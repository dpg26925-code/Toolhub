import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ReferralRow = {
  id: string;
  referred_user_id: string;
  status: string;
  commission_cents: number;
  currency: string;
  subscription_id: string | null;
  converted_at: string | null;
  paid_at: string | null;
  created_at: string;
  referred_email?: string | null;
};

export type PayoutRow = {
  id: string;
  amount_cents: number;
  currency: string;
  method: string | null;
  payout_reference: string | null;
  status: string;
  notes: string | null;
  paid_at: string | null;
  created_at: string;
};

export type ReferralStats = {
  referralCode: string | null;
  totalReferred: number;
  totalConverted: number;
  pendingCents: number;
  paidCents: number;
  currency: string;
  referrals: ReferralRow[];
  payouts: PayoutRow[];
};

export const getMyReferralStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReferralStats> => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", userId)
      .maybeSingle();

    const { data: refs } = await supabase
      .from("referrals")
      .select("id, referred_user_id, status, commission_cents, currency, subscription_id, converted_at, paid_at, created_at")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    const referrals = (refs ?? []) as ReferralRow[];

    // Enrich with referred user email (best-effort; RLS-safe since profiles has appropriate policies)
    const ids = referrals.map((r) => r.referred_user_id);
    let emailMap = new Map<string, string>();
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", ids);
      emailMap = new Map((profs ?? []).map((p: { id: string; email: string | null }) => [p.id, p.email ?? ""]));
    }
    for (const r of referrals) r.referred_email = emailMap.get(r.referred_user_id) ?? null;

    const { data: payouts } = await supabase
      .from("referral_payouts")
      .select("id, amount_cents, currency, method, payout_reference, status, notes, paid_at, created_at")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    const pendingCents = referrals
      .filter((r) => r.status === "converted")
      .reduce((s, r) => s + (r.commission_cents ?? 0), 0);
    const paidCents = ((payouts ?? []) as PayoutRow[])
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + (p.amount_cents ?? 0), 0);

    return {
      referralCode: profile?.referral_code ?? null,
      totalReferred: referrals.length,
      totalConverted: referrals.filter((r) => r.status !== "pending" && r.status !== "void").length,
      pendingCents,
      paidCents,
      currency: referrals[0]?.currency ?? "USD",
      referrals,
      payouts: (payouts ?? []) as PayoutRow[],
    };
  });

export const attachReferralCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ code: z.string().min(4).max(20) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: ok, error } = await context.supabase.rpc("attach_referral", { _code: data.code });
    if (error) return { attached: false, error: error.message };
    return { attached: !!ok };
  });