import { createFileRoute } from "@tanstack/react-router";
import { abs } from "@/lib/site";
import { SiteLayout } from "@/components/site-layout";

const ITEMS = [
  { q: "Is ToolHub AI free?", a: "Yes. All client-side utilities are free, and you get 10 credits on signup to try Pro AI tools." },
  { q: "What are credits?", a: "Credits are consumed by AI and heavy server-side tools. Each tool's page shows its cost." },
  { q: "Do you store my files?", a: "Client-side tools run entirely in your browser — nothing is uploaded." },
  { q: "Can I use ToolHub AI via API?", a: "Yes. Pro plans include API access. Generate keys from your dashboard." },
  { q: "How do I cancel?", a: "Cancel anytime from the Subscription page in your dashboard." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Frequently Asked Questions | ToolHub AI" },
      { name: "description", content: "Answers to common questions about ToolHub AI — plans, credits, privacy and API access." },
      { property: "og:title", content: "FAQ — Frequently Asked Questions | ToolHub AI" },
      { property: "og:description", content: "Common questions about ToolHub AI." },
      { property: "og:url", content: abs("/faq") },
    ],
    links: [{ rel: "canonical", href: abs("/faq") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: ITEMS.map((i) => ({
            "@type": "Question",
            name: i.q,
            acceptedAnswer: { "@type": "Answer", text: i.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">Frequently asked questions</h1>
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
          {ITEMS.map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold">
                {item.q}
                <span className="ml-4 text-muted-foreground transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}