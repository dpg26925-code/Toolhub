import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ToolCard } from "@/components/tool-card";
import { CATEGORIES, TOOLS, featuredTools } from "@/lib/tools-data";
import { SITE_URL, abs } from "@/lib/site";
import { CategoryIcon } from "@/components/category-icon";

const TITLE = "Nexatools — 30+ Free Online Tools Powered by AI";
const DESCRIPTION =
  "Compress PDFs, remove backgrounds, summarize text and 27 more free online tools. No downloads, no sign-ups required.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Nexatools",
          url: SITE_URL,
          description:
            "Nexatools is a multi-tool SaaS platform offering 30+ free online tools for PDF, image, AI and developer workflows.",
          slogan: "30+ Free Online Tools Powered by AI",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Nexatools",
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: abs("/tools?q={search_term_string}"),
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = featuredTools();
  return (
    <SiteLayout>
      <section className="relative">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand">
              {TOOLS.length} Professional Utilities
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
              <span>Streamline your workflow with </span>
              <span className="text-brand">Nexatools</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              A curated collection of free, high-performance web tools for developers, designers, and creators.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/tools"
                className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-brand"
              >
                Try free — no sign-up
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center rounded-lg border border-primary bg-transparent px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                See pricing
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No account required. Guests get 3 free AI runs — unlimited use for basic tools.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="featured-tools" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 id="featured-tools" className="text-2xl font-bold tracking-tight sm:text-3xl">Featured tools</h2>
          <p className="mt-2 text-muted-foreground">Our most-loved tools — pick one and go.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 8).map((t) => (<ToolCard key={t.slug} tool={t} />))}
        </div>
      </section>

      <section aria-labelledby="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 id="how-it-works" className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <p className="mt-2 text-muted-foreground">Three steps, no learning curve.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: 1, t: "Choose a tool", d: "Browse 30+ tools by category or search by name." },
            { n: 2, t: "Upload or paste content", d: "Drop in a file, paste text or tweak the options." },
            { n: 3, t: "Get result instantly", d: "Download, copy or share your result in seconds." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">{s.n}</div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="stats" className="bg-primary py-14 text-primary-foreground">
        <h2 id="stats" className="sr-only">Platform stats</h2>
        <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 text-center sm:grid-cols-4 sm:px-6">
          {[
            { k: `${TOOLS.length}`, v: "Free tools" },
            { k: `${CATEGORIES.length}`, v: "Categories" },
            { k: "100%", v: "Runs in your browser" },
            { k: "$0", v: "Forever free tier" },
          ].map((s) => (
            <div key={s.v}>
              <dt className="text-3xl font-bold text-brand sm:text-4xl">{s.k}</dt>
              <dd className="mt-1 text-sm text-primary-foreground/70">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse by category</h2>
            <p className="mt-2 text-muted-foreground">Pick a workflow and jump straight in.</p>
          </div>
          <Link to="/tools" className="text-sm font-semibold text-brand hover:underline">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/categories/$slug" params={{ slug: c.slug }} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
              <CategoryIcon slug={c.slug} size={44} />
              <h3 className="mt-4 text-lg font-semibold group-hover:text-brand">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-primary p-10 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start using Nexatools for free</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
            Create a free account and get 10 credits to try our Pro AI tools — no card required.
          </p>
          <div className="mt-6">
            <Link to="/auth/signup" className="inline-flex items-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90">
              Get Started — No Credit Card
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
