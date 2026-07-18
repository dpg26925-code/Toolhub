import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ToolCard } from "@/components/tool-card";
import { CATEGORIES, TOOLS, featuredTools } from "@/lib/tools-data";
import { SITE_URL, abs } from "@/lib/site";

const TITLE = "ToolHub AI — 30+ Free Online Tools Powered by AI";
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
          name: "ToolHub AI",
          url: SITE_URL,
          description:
            "ToolHub AI is a multi-tool SaaS platform offering 30+ free online tools for PDF, image, AI and developer workflows.",
          slogan: "30+ Free Online Tools Powered by AI",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "ToolHub AI",
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
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{ background: "radial-gradient(60% 50% at 50% 0%, oklch(0.94 0.06 290) 0%, transparent 70%)" }}
        />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              {TOOLS.length}+ tools · AI-powered · Free to start
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
              30+ Free Online Tools <span className="bg-gradient-brand bg-clip-text text-transparent">Powered by AI</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Compress PDFs, remove backgrounds, summarize text — no downloads, no sign-ups required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/tools" className="inline-flex items-center rounded-lg bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95">
                Explore Tools
              </Link>
              <Link to="/pricing" className="inline-flex items-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary">
                See pricing
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Trusted by 10,000+ users · No software installation · Free to start
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="featured-tools" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 id="featured-tools" className="text-2xl font-bold tracking-tight sm:text-3xl">Featured tools</h2>
          <p className="mt-2 text-muted-foreground">Our most-loved tools — pick one and go.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">{s.n}</div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="stats" className="bg-secondary/40 py-14">
        <h2 id="stats" className="sr-only">Platform stats</h2>
        <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 text-center sm:grid-cols-4 sm:px-6">
          {[
            { k: "100K+", v: "Users" },
            { k: "500K+", v: "Tools used" },
            { k: `${TOOLS.length}+`, v: "Tools available" },
            { k: "99.9%", v: "Uptime" },
          ].map((s) => (
            <div key={s.v}>
              <dt className="text-3xl font-bold text-foreground sm:text-4xl">{s.k}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{s.v}</dd>
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
          <Link to="/tools" className="text-sm font-semibold text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/categories/$slug" params={{ slug: c.slug }} className="hover-lift rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="text-3xl">{c.icon}</div>
              <h3 className="mt-4 text-lg font-semibold">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center text-primary-foreground shadow-lift">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start using ToolHub AI for free</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
            Create a free account and get 10 credits to try our Pro AI tools — no card required.
          </p>
          <div className="mt-6">
            <Link to="/auth/signup" className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-soft transition hover:bg-white/90">
              Get Started — No Credit Card
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
