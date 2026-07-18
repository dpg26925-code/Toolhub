import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const CREDIT_COST = 1;

type RpcClient = { rpc: (fn: "consume_credits", args: { _amount: number }) => Promise<{ error: { message: string } | null }> };

async function spendCredit(supabase: RpcClient) {
  const { error } = await supabase.rpc("consume_credits", { _amount: CREDIT_COST });
  if (error) {
    if (error.message.includes("insufficient_credits")) {
      throw new Error("You have no credits left. Upgrade or wait for your daily refill.");
    }
    throw new Error(`Unable to charge credits: ${error.message}`);
  }
}

async function callGateway(messages: { role: string; content: string }[]) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit — please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

export const summarizeText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        text: z.string().min(1).max(50000),
        length: z.enum(["short", "medium", "long"]).default("medium"),
        style: z.enum(["bullet", "paragraph"]).default("paragraph"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await spendCredit(context.supabase);
    const lengthMap = { short: "2-3 sentences", medium: "1 short paragraph", long: "3-4 paragraphs" };
    const styleInstr =
      data.style === "bullet" ? "Format as a concise bulleted list." : "Format as flowing prose.";
    const summary = await callGateway([
      { role: "system", content: `You summarise text. Length: ${lengthMap[data.length]}. ${styleInstr}` },
      { role: "user", content: data.text },
    ]);
    return { summary };
  });

export const translateText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        text: z.string().min(1).max(20000),
        target: z.enum(["English", "Vietnamese", "Spanish", "Indonesian"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await spendCredit(context.supabase);
    const translated = await callGateway([
      {
        role: "system",
        content: `You are a professional translator. Translate the user's text into ${data.target}. Reply with only the translation, no notes.`,
      },
      { role: "user", content: data.text },
    ]);
    return { translated };
  });

export const rewriteText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        text: z.string().min(1).max(20000),
        tone: z.enum(["formal", "casual", "professional"]).default("professional"),
        length: z.enum(["shorter", "same", "longer"]).default("same"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await spendCredit(context.supabase);
    const rewritten = await callGateway([
      {
        role: "system",
        content: `Rewrite the user's text in a ${data.tone} tone, making it ${data.length === "same" ? "roughly the same length" : data.length}. Reply with only the rewritten text.`,
      },
      { role: "user", content: data.text },
    ]);
    return { rewritten };
  });

export const chatWithPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        pdfText: z.string().min(1).max(200000),
        question: z.string().min(1).max(2000),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
          .max(20)
          .default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await spendCredit(context.supabase);
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