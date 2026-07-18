import { createFileRoute } from "@tanstack/react-router";
import { abs } from "@/lib/site";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Why We Built ToolHub AI | ToolHub AI" },
      { name: "description", content: "Why we're building ToolHub AI — a fast, private, well-designed workspace for online tools." },
      { property: "og:title", content: "About — Why We Built ToolHub AI | ToolHub AI" },
      { property: "og:description", content: "Why we're building ToolHub AI." },
      { property: "og:url", content: abs("/about") },
    ],
    links: [{ rel: "canonical", href: abs("/about") }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">Our mission</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Online tool sites are usually cluttered, ad-heavy and slow. ToolHub AI is our attempt to fix that:
          one clean workspace with tools that feel fast, private and beautifully designed.
        </p>
        <h2 className="mt-10 text-2xl font-semibold">Why ToolHub?</h2>
        <ul className="mt-4 space-y-3 text-muted-foreground">
          <li>• Utilities run in your browser whenever possible — your data doesn't leave your device.</li>
          <li>• AI tools built on top-tier models, priced fairly with credits, not upsells.</li>
          <li>• A single account for PDFs, images, dev utilities and AI.</li>
          <li>• API access so you can integrate tools directly into your workflow.</li>
        </ul>
        <p className="mt-10 text-muted-foreground">
          Have feedback? Reach us at <a href="mailto:hello@toolhub.ai" className="text-primary hover:underline">hello@toolhub.ai</a>.
        </p>
      </article>
    </SiteLayout>
  );
}