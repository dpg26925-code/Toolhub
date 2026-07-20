// Supabase Edge Function: ai-gateway
// Runs on Deno. Handles all AI calls previously in Cloudflare Worker server functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const GATEWAY = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemma-4-26b-a4b-it:free";
const CREDIT_COST = 1;
const GUEST_LIMIT = 3;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-guest-uses",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Msg = { role: string; content: string };

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...extraHeaders },
  });
}

async function callGateway(messages: Msg[]): Promise<string> {
  const key = Deno.env.get("OPENROUTER_API_KEY");
  if (!key) throw new Error("Missing OPENROUTER_API_KEY");
  const model = Deno.env.get("OPENROUTER_MODEL") || DEFAULT_MODEL;
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
      const parsed = JSON.parse(text);
      providerMessage = parsed?.error?.message ?? text;
    } catch { /* ignore */ }
    if (res.status === 429) throw new Error("Rate limit — please try again in a moment.");
    if (res.status === 402) throw new Error("OpenRouter credits exhausted. Top up at openrouter.ai/credits.");
    if (res.status === 404) throw new Error("Selected AI model is unavailable. Please try again in a moment.");
    throw new Error(`AI request failed (${res.status}): ${String(providerMessage).slice(0, 180)}`);
  }
  const j = await res.json();
  return j?.choices?.[0]?.message?.content ?? "";
}

const WRITING_SYSTEM: Record<string, (opts: string) => string> = {
  "grammar-check": () =>
    "You are a professional editor. Fix grammar, spelling and punctuation errors in the user's text. Preserve their voice, meaning and formatting. Reply with only the corrected text — no commentary, no explanations.",
  paragraph: (opts) =>
    `Write one well-structured paragraph (4-6 sentences) on the given topic. Tone: ${opts || "neutral"}. Reply with only the paragraph.`,
  email: (opts) =>
    `Draft a complete email based on the user's brief. Include subject line on the first line prefixed "Subject: ". Tone: ${opts || "professional"}. Keep it concise and actionable.`,
  "blog-titles": () =>
    "Generate exactly 10 catchy, SEO-friendly blog titles for the given topic. Return them as a numbered list (1. ... 2. ...). No intro, no outro.",
  expand: (opts) =>
    `Expand the user's short notes into detailed, well-written content. Target length: ${opts || "medium (2-3 paragraphs)"}. Preserve every key point.`,
  tone: (opts) =>
    `Rewrite the user's text in a ${opts || "friendly"} tone. Preserve meaning and length. Reply with only the rewritten text.`,
};

function buildMessages(body: any): { messages: Msg[]; toolSlug: string } {
  const action = body.action as string;
  switch (action) {
    case "summarize": {
      const lengthMap: Record<string, string> = { short: "2-3 sentences", medium: "1 short paragraph", long: "3-4 paragraphs" };
      const styleInstr = body.style === "bullet" ? "Format as a concise bulleted list." : "Format as flowing prose.";
      return {
        toolSlug: body.toolSlug ?? "summarize",
        messages: [
          { role: "system", content: `You summarise text. Length: ${lengthMap[body.length ?? "medium"]}. ${styleInstr}` },
          { role: "user", content: String(body.text ?? "") },
        ],
      };
    }
    case "translate":
      return {
        toolSlug: body.toolSlug ?? "translate",
        messages: [
          { role: "system", content: `You are a professional translator. Translate the user's text into ${body.target}. Reply with only the translation, no notes.` },
          { role: "user", content: String(body.text ?? "") },
        ],
      };
    case "rewrite":
      return {
        toolSlug: body.toolSlug ?? "rewrite",
        messages: [
          { role: "system", content: `Rewrite the user's text in a ${body.tone ?? "professional"} tone, making it ${body.length === "same" ? "roughly the same length" : body.length}. Reply with only the rewritten text.` },
          { role: "user", content: String(body.text ?? "") },
        ],
      };
    case "chat-pdf":
      return {
        toolSlug: body.toolSlug ?? "chat-pdf",
        messages: [
          {
            role: "system",
            content:
              "You answer questions strictly using the provided PDF text. If the answer isn't in the document, say so. Be concise.\n\n--- PDF CONTENT ---\n" +
              String(body.pdfText ?? "").slice(0, 180000),
          },
          ...((body.history ?? []) as Msg[]),
          { role: "user", content: String(body.question ?? "") },
        ],
      };
    case "writing": {
      const mode = body.mode as string;
      const sys = WRITING_SYSTEM[mode];
      if (!sys) throw new Error("Invalid writing mode");
      return {
        toolSlug: body.toolSlug ?? mode,
        messages: [
          { role: "system", content: sys(String(body.option ?? "")) },
          { role: "user", content: String(body.text ?? "") },
        ],
      };
    }
    case "blog-write": {
      const topic = String(body.topic ?? "").trim();
      const tone = String(body.tone ?? "informative");
      const audience = String(body.audience ?? "general readers");
      const length = String(body.length ?? "medium");
      const keywords = String(body.keywords ?? "");
      const lengthMap: Record<string, string> = {
        short: "500-700 words",
        medium: "900-1200 words",
        long: "1500-2000 words",
      };
      const wordCount = lengthMap[length] ?? lengthMap.medium;
      return {
        toolSlug: "admin-blog-writer",
        messages: [
          {
            role: "system",
            content:
              "You are an expert SEO blog writer. Return ONLY valid JSON (no code fences, no prose) matching this shape:\n" +
              `{"title": string, "slug": string, "excerpt": string, "tags": string[], "content": string}\n` +
              "- title: catchy, <= 60 chars, includes primary keyword.\n" +
              "- slug: url-safe lowercase kebab-case derived from title.\n" +
              "- excerpt: 140-160 chars meta description.\n" +
              "- tags: 3-6 lowercase tags.\n" +
              "- content: Markdown body only (no H1 — the title is the H1). Use ## for section headings, short paragraphs, bullet lists, and a concluding section. Target " +
              wordCount +
              `. Tone: ${tone}. Audience: ${audience}.` +
              (keywords ? ` Naturally include these keywords: ${keywords}.` : ""),
          },
          { role: "user", content: `Topic: ${topic}` },
        ],
      };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const { messages, toolSlug } = buildMessages(body);

    const authHeader = req.headers.get("authorization");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Signed-in path: enforce credits + log usage via user's JWT (RLS applies).
    if (authHeader?.startsWith("Bearer ") && authHeader.length > 20) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) return json({ error: "Please sign in again to use AI tools." }, 401);
      const userId = userData.user.id;

      const { data: remaining, error: creditErr } = await supabase.rpc("consume_credits", { _amount: CREDIT_COST });
      if (creditErr) {
        if (creditErr.message.includes("insufficient_credits")) {
          return json({ error: "You have no credits left. Upgrade or wait for your daily refill." }, 402);
        }
        return json({ error: `Unable to charge credits: ${creditErr.message}` }, 500);
      }

      const started = Date.now();
      try {
        const content = await callGateway(messages);
        const { data: tool } = await supabase.from("tools").select("id").eq("slug", toolSlug).maybeSingle();
        await supabase.from("usage_logs").insert({
          user_id: userId,
          tool_id: tool?.id ?? null,
          credits_used: CREDIT_COST,
          status: "success",
          processing_time_ms: Date.now() - started,
        });
        return json({ content, creditsRemaining: typeof remaining === "number" ? remaining : null });
      } catch (e) {
        const { data: tool } = await supabase.from("tools").select("id").eq("slug", toolSlug).maybeSingle();
        await supabase.from("usage_logs").insert({
          user_id: userId,
          tool_id: tool?.id ?? null,
          credits_used: CREDIT_COST,
          status: "error",
          processing_time_ms: Date.now() - started,
        });
        throw e;
      }
    }

    // Guest path: soft limit via client-sent header.
    const guestUses = Number.parseInt(req.headers.get("x-guest-uses") ?? "0", 10) || 0;
    if (guestUses >= GUEST_LIMIT) {
      return json({ error: "Guest AI limit reached. Sign up or upgrade to continue using AI tools." }, 402);
    }
    const content = await callGateway(messages);
    return json({ content, guestUses: guestUses + 1 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});