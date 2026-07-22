import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

type LemonPayload = {
  meta?: {
    event_name?: string;
    custom_data?: { user_id?: string };
  };
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      customer_id?: number | string;
      variant_id?: number | string;
      renews_at?: string | null;
      ends_at?: string | null;
      user_email?: string;
    };
  };
};

export const Route = createFileRoute("/api/public/webhooks/lemonsqueezy")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
        if (!secret) return new Response("Not configured", { status: 500 });

        const signature = request.headers.get("x-signature") ?? "";
        const raw = await request.text();
        const expected = createHmac("sha256", secret).update(raw).digest("hex");
        const sig = Buffer.from(signature, "hex");
        const exp = Buffer.from(expected, "hex");
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const payload = JSON.parse(raw) as LemonPayload;
        const event = payload.meta?.event_name ?? "";
        const userId = payload.meta?.custom_data?.user_id;
        const attrs = payload.data?.attributes ?? {};
        const subId = payload.data?.id ? String(payload.data.id) : null;

        if (!userId || !subId) {
          return new Response("Missing user_id or subscription id", { status: 200 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const activeStatuses = new Set(["active", "on_trial", "past_due"]);
        const status = attrs.status ?? "unknown";
        const isActive =
          activeStatuses.has(status) &&
          !["subscription_expired", "subscription_cancelled"].includes(event);
        const plan = isActive ? "pro" : "free";

        await supabaseAdmin
          .from("subscriptions")
          .upsert(
            {
              user_id: userId,
              plan_id: "pro",
              status,
              provider: "lemonsqueezy",
              provider_subscription_id: subId,
              provider_customer_id: attrs.customer_id ? String(attrs.customer_id) : null,
              provider_variant_id: attrs.variant_id ? String(attrs.variant_id) : null,
              current_period_end: attrs.renews_at ?? attrs.ends_at ?? null,
              canceled_at: event === "subscription_cancelled" ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );

        await supabaseAdmin.from("profiles").update({ plan }).eq("id", userId);

        // Record referral commission on first activation
        if (isActive) {
          try {
            const { data: prof } = await supabaseAdmin
              .from("profiles")
              .select("referred_by")
              .eq("id", userId)
              .maybeSingle();
            const referrer = prof?.referred_by as string | null | undefined;
            if (referrer && referrer !== userId) {
              const { data: existing } = await supabaseAdmin
                .from("referrals")
                .select("id, status")
                .eq("referred_user_id", userId)
                .maybeSingle();
              const pct = Number(process.env.REFERRAL_COMMISSION_PCT ?? "30");
              const flat = Number(process.env.REFERRAL_COMMISSION_CENTS ?? "600");
              const commission = Number.isFinite(pct) && pct > 0 ? Math.round(2000 * pct / 100) : flat;
              if (existing && existing.status !== "converted" && existing.status !== "paid") {
                await supabaseAdmin
                  .from("referrals")
                  .update({
                    status: "converted",
                    commission_cents: commission,
                    currency: "USD",
                    subscription_id: subId,
                    converted_at: new Date().toISOString(),
                  })
                  .eq("id", existing.id);
              } else if (!existing) {
                await supabaseAdmin.from("referrals").insert({
                  referrer_id: referrer,
                  referred_user_id: userId,
                  status: "converted",
                  commission_cents: commission,
                  currency: "USD",
                  subscription_id: subId,
                  converted_at: new Date().toISOString(),
                });
              }
            }
          } catch (err) {
            console.error("[lemonsqueezy] referral insert failed", err);
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});