import { createFileRoute } from "@tanstack/react-router";
import { abs } from "@/lib/site";
import { SiteLayout } from "@/components/site-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ITEMS = [
  { q: "Is Nexatools free?", a: "Yes. All client-side utilities are free, and you get 10 credits on signup to try Pro AI tools." },
  { q: "What are credits?", a: "Credits are consumed by AI and heavy server-side tools. Each tool's page shows its cost." },
  { q: "Do you store my files?", a: "Client-side tools run entirely in your browser — nothing is uploaded." },
  { q: "Can I use Nexatools via API?", a: "Yes. Pro plans include API access. Generate keys from your dashboard." },
  { q: "How do I cancel?", a: "Cancel anytime from the Subscription page in your dashboard." },
  { q: "What is the difference between Free and Pro?", a: "Free users get 10 credits refilled daily, access to every client-side utility, and ad-supported pages. Pro removes ads, unlocks unlimited AI usage, API access with higher rate limits, and priority processing." },
  { q: "Do I need to sign up to use the tools?", a: "No signup is required for client-side utilities like JSON Formatter, Base64 or Image Resizer — guests get 3 free uses of AI tools too. Sign in to unlock daily credits, usage history and favorites." },
  { q: "What file formats are supported?", a: "Image tools accept JPG, PNG, WebP, GIF and BMP. PDF tools accept any standard PDF. OCR supports 100+ languages. Text tools accept UTF-8 input up to 1 MB." },
  { q: "Is there a file size limit?", a: "Client-side tools handle up to your device's memory (typically 100 MB+). AI tools accept text up to 100 KB per request and PDFs up to 20 MB." },
  { q: "Can I use Nexatools commercially?", a: "Yes. Output from every tool is yours to use for personal or commercial projects, on both Free and Pro plans." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards through our billing partner LemonSqueezy. Invoices and receipts are emailed automatically." },
  { q: "Do you offer refunds?", a: "Yes — Pro subscriptions come with a 14-day money-back guarantee, no questions asked." },
  { q: "How is my data protected?", a: "Files processed by client-side tools never leave your browser. Server-side tools transmit data over HTTPS, process it in memory, and delete it immediately after your request completes. See our Privacy Policy for details." },
  { q: "Can I request a new tool?", a: "Absolutely — email us or open a request from the dashboard. We ship new tools every month based on user demand." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Frequently Asked Questions | Nexatools" },
      { name: "description", content: "Answers to common questions about Nexatools — plans, credits, privacy and API access." },
      { property: "og:title", content: "FAQ — Frequently Asked Questions | Nexatools" },
      { property: "og:description", content: "Common questions about Nexatools." },
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
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <header className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight">Frequently asked questions</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Clear answers about Nexatools plans, credits, privacy, billing, files, and API access.
          </p>
        </header>

        <section aria-label="FAQ answers" className="mt-10 grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-5 text-sm shadow-soft">
              <p className="font-semibold text-foreground">Topics</p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>Plans & credits</li>
                <li>Privacy & files</li>
                <li>API access</li>
                <li>Billing & refunds</li>
              </ul>
            </div>
          </aside>

          <Accordion type="multiple" defaultValue={ITEMS.slice(0, 6).map((item) => item.q)} className="rounded-xl border border-border bg-card px-5 shadow-soft">
            {ITEMS.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-6 text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </SiteLayout>
  );
}