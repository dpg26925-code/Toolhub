import { supabase } from "@/integrations/supabase/client";

const GUEST_KEY = "nexatools_ai_guest_uses";

function readGuestUses(): number {
  if (typeof window === "undefined") return 0;
  const n = Number.parseInt(window.localStorage.getItem(GUEST_KEY) ?? "0", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function bumpGuestUses(next: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_KEY, String(next));
}

export async function callAi<T extends Record<string, unknown>>(payload: T & { action: string }): Promise<string> {
  const guestUses = readGuestUses();
  const { data, error } = await supabase.functions.invoke("ai-gateway", {
    body: payload,
    headers: { "x-guest-uses": String(guestUses) },
  });

  if (error) {
    // Supabase wraps non-2xx as FunctionsHttpError; try to parse the JSON body.
    let msg = error.message || "AI request failed";
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        if (body?.error) msg = body.error;
      } catch { /* ignore */ }
    }
    throw new Error(msg);
  }

  const res = data as { content?: string; guestUses?: number; creditsRemaining?: number | null; error?: string };
  if (res?.error) throw new Error(res.error);
  if (typeof res?.guestUses === "number") bumpGuestUses(res.guestUses);
  if (typeof window !== "undefined" && typeof res?.creditsRemaining === "number") {
    window.dispatchEvent(new CustomEvent("nexatools:credits", { detail: res.creditsRemaining }));
  }
  return res?.content ?? "";
}