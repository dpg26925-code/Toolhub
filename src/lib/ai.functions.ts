import { createServerFn } from "@tanstack/react-start";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const GATEWAY = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openrouter/free";
const CREDIT_COST = 1;
const GUEST_COOKIE = "nexatools_ai_guest_uses";
const GUEST_LIMIT = 3;

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AuthContext = { supabase: SupabaseClient<Database>; userId: string };

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

async function getOptionalAuthContext(): Promise<AuthContext | null> {
  const request = getRequest();
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) throw new Error("Please sign in again to use AI tools.");

  const token = authHeader.replace("Bearer ", "");
  if (!token || token.split(".").length !== 3) throw new Error("Please sign in again to use AI tools.");

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) throw new Error("Please sign in again to use AI tools.");
  return { supabase, userId: data.claims.sub };
}

function spendGuestUse() {
  const used = Number.parseInt(getCookie(GUEST_COOKIE) ?? "0", 10);
  const safeUsed = Number.isFinite(used) && used > 0 ? Math.min(used, GUEST_LIMIT) : 0;
  if (safeUsed >= GUEST_LIMIT) {
    throw new Error("Guest AI limit reached. Sign up or upgrade to continue using AI tools.");
  }
  const request = getRequest();
  setCookie(GUEST_COOKIE, String(safeUsed + 1), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
  });
}

async function spendCredit(supabase: SupabaseClient<Database>) {
  const { error } = await supabase.rpc("consume_credits", { _amount: CREDIT_COST });
  if (error) {
    if (error.message.includes("insufficient_credits")) {
      throw new Error("You have no credits left. Upgrade or wait for your daily refill.");
    }
    throw new Error(`Unable to charge credits: ${error.message}`);
  }
}

async function logUsage(
  supabase: SupabaseClient<Database>,
  userId: string,
  toolSlug: string | undefined,
  status: "success" | "error",
  processingMs: number,
) {
  if (!toolSlug) return;
  const { data: tool } = await supabase.from("tools").select("id").eq("slug", toolSlug).maybeSingle();
  await supabase.from("usage_logs").insert({
    user_id: userId,
    tool_id: tool?.id ?? null,
    credits_used: CREDIT_COST,
    status,
    processing_time_ms: processingMs,
  });
}

async function runWithLogging<T>(
  context: AuthContext,
  toolSlug: string | undefined,
  work: () => Promise<T>,
): Promise<T> {
  await spendCredit(context.supabase);
  const started = Date.now();
  try {
    const result = await work();
    void logUsage(context.supabase, context.userId, toolSlug, "success", Date.now() - started);
    return result;
  } catch (e) {
    void logUsage(context.supabase, context.userId, toolSlug, "error", Date.now() - started);
    throw e;
  }
}

async function runAiTool<T>(toolSlug: string | undefined, work: () => Promise<T>): Promise<T> {
  const authContext = await getOptionalAuthContext();
  if (authContext) return runWithLogging(authContext, toolSlug, work);
  spendGuestUse();
  return work();
}

async function callGateway(messages: { role: string; content: string }[]) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OPENROUTER_API_KEY");
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://nexatools.cloud",
      "X-Title": "Nexatools",
    },
    body: JSON.stringify({ model, messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    let providerMessage = text;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      providerMessage = parsed.error?.message ?? text;
    } catch {
      providerMessage = text;
    }
    if (res.status === 429) throw new Error("Rate limit — please try again in a moment.");
    if (res.status === 402) throw new Error("OpenRouter credits exhausted. Top up at openrouter.ai/credits.");
    if (res.status === 404) throw new Error("Selected AI model is unavailable. Please try again in a moment.");
    throw new Error(`AI request failed (${res.status}): ${providerMessage.slice(0, 180)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

export const summarizeText = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        text: z.string().min(1).max(50000),
        length: z.enum(["short", "medium", "long"]).default("medium"),
        style: z.enum(["bullet", "paragraph"]).default("paragraph"),
        toolSlug: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return runAiTool(data.toolSlug ?? "summarize", async () => {
      const lengthMap = { short: "2-3 sentences", medium: "1 short paragraph", long: "3-4 paragraphs" };
      const styleInstr =
        data.style === "bullet" ? "Format as a concise bulleted list." : "Format as flowing prose.";
      const summary = await callGateway([
        { role: "system", content: `You summarise text. Length: ${lengthMap[data.length]}. ${styleInstr}` },
        { role: "user", content: data.text },
      ]);
      return { summary };
    });
  });

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        text: z.string().min(1).max(20000),
        target: z.enum(["English", "Vietnamese", "Spanish", "Indonesian"]),
        toolSlug: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return runAiTool(data.toolSlug ?? "translate", async () => {
      const translated = await callGateway([
        {
          role: "system",
          content: `You are a professional translator. Translate the user's text into ${data.target}. Reply with only the translation, no notes.`,
        },
        { role: "user", content: data.text },
      ]);
      return { translated };
    });
  });

export const rewriteText = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        text: z.string().min(1).max(20000),
        tone: z.enum(["formal", "casual", "professional"]).default("professional"),
        length: z.enum(["shorter", "same", "longer"]).default("same"),
        toolSlug: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return runAiTool(data.toolSlug ?? "rewrite", async () => {
      const rewritten = await callGateway([
        {
          role: "system",
          content: `Rewrite the user's text in a ${data.tone} tone, making it ${data.length === "same" ? "roughly the same length" : data.length}. Reply with only the rewritten text.`,
        },
        { role: "user", content: data.text },
      ]);
      return { rewritten };
    });
  });

export const chatWithPdf = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        pdfText: z.string().min(1).max(200000),
        question: z.string().min(1).max(2000),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
          .max(20)
          .default([]),
        toolSlug: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return runAiTool(data.toolSlug ?? "chat-pdf", async () => {
      const answer = await callGateway([
        {
          role: "system",
          content:
            "You answer questions strictly using the provided PDF text. If the answer isn't in the document, say so. Be concise.\n\n--- PDF CONTENT ---\n" +
            data.pdfText.slice(0, 180000),
        },
        ...data.history,
        { role: "user", content: data.question },
      ]);
      return { answer };
    });
  });