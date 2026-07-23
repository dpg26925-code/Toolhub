import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { abs } from "@/lib/site";
import { SiteLayout } from "@/components/site-layout";
import { useAuth } from "@/hooks/use-auth";
import { createLemonCheckout } from "@/lib/lemonsqueezy.functions";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Free & Pro Plans | Nexatools" },
      { name: "description", content: "Simple pricing for Nexatools. Start free, upgrade to Pro for more credits and AI tools." },
      { property: "og:title", content: "Pricing — Free & Pro Plans | Nexatools" },
      { property: "og:description", content: "Start free. Upgrade to Pro when you need more." },
      { property: "og:url", content: abs("/pricing") },
    ],
    links: [{ rel: "canonical", href: abs("/pricing") }],
  }),
  component: PricingPage,
});

const PLANS = [
  { name: "Free", price: "$0", period: "forever", features: ["10 credits on signup", "All client-side tools", "3 guest runs per browser", "Community support"], ctaLabel: "Get started", kind: "free" as const, highlight: false },
  { name: "Pro", price: "$20", period: "/month", features: ["500 credits per month", "All AI tools included", "API access with rate limits", "Priority email support", "Save favorites & history"], ctaLabel: "Start Pro", kind: "pro" as const, highlight: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Volume credits & SLA", "SSO / SAML", "Dedicated infra options", "Custom tools & integrations"], ctaLabel: "Contact us", kind: "enterprise" as const, highlight: false },
] as const;

function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const checkout = useServerFn(createLemonCheckout);
  const [loadingPro, setLoadingPro] = useState(false);

  const handlePro = async () => {
    if (!user) {
      window.location.href = "/auth/signup?next=/pricing";
      return;
    }
    setLoadingPro(true);
    try {
      const { url } = await checkout();
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start checkout");
      setLoadingPro(false);
    }
  };

  const linkFor = (kind: "free" | "enterprise") =>
    kind === "enterprise" ? "/about" : user ? "/dashboard" : "/auth/signup";
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Start free. Upgrade when your team needs more credits or AI horsepower.
          </p>
        </header>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`hover-lift flex flex-col rounded-3xl border p-8 shadow-soft ${p.highlight ? "border-primary bg-gradient-to-b from-accent/40 to-card" : "border-border bg-card"}`}>
              {p.highlight && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Most popular</span>
              )}
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-primary">✓</span><span className="text-muted-foreground">{f}</span></li>
                ))}
              </ul>
              {p.kind === "pro" ? (
                <button
                  type="button"
                  onClick={handlePro}
                  disabled={loadingPro}
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-brand px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:opacity-70"
                >
                  {loadingPro && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loadingPro ? "Redirecting…" : p.ctaLabel}
                </button>
              ) : (
                <Link to={linkFor(p.kind)} className={`mt-8 inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition ${p.highlight ? "bg-gradient-brand text-primary-foreground hover:opacity-95" : "border border-border bg-card hover:bg-secondary"}`}>
                  {p.ctaLabel}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}