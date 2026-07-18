import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ToolCard } from "@/components/tool-card";
import { CATEGORIES, TOOLS, featuredTools } from "@/lib/tools-data";

export const Route = createFileRoute("/")({
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
              The ultimate <span className="bg-gradient-brand bg-clip-text text-transparent">AI-powered</span> online tool platform
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Compress PDFs, edit images, transform text and speed up your dev workflow — all in one clean, fast workspace built for global creators.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/tools" className="inline-flex items-center rounded-lg bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95">
                Explore all tools
              </Link>
              <Link to="/pricing" className="inline-flex items-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary">
                See pricing
              </Link>
            </div>
          </div>
          <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 text-center">
            {[
              { k: "30+", v: "Tools shipping" },
              { k: "4", v: "Categories" },
              { k: "100%", v: "Client-side privacy" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <dt className="text-2xl font-bold text-foreground sm:text-3xl">{s.k}</dt>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
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

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured tools</h2>
          <p className="mt-2 text-muted-foreground">Handpicked tools that pair speed with delight.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((t) => (<ToolCard key={t.slug} tool={t} />))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center text-primary-foreground shadow-lift">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to work faster?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
            Create a free account and get 10 credits to try our Pro AI tools — no card required.
          </p>
          <div className="mt-6">
            <Link to="/auth/signup" className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-soft transition hover:bg-white/90">
              Create free account
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
