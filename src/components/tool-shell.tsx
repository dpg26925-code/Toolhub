import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import type { Tool, ToolCategory } from "@/lib/tools-data";
import { toolsInCategory } from "@/lib/tools-data";
import { getToolContent } from "@/lib/tool-content";
import { ToolActions } from "@/components/tool-actions";

export function ToolShell({
  tool,
  category,
  children,
}: {
  tool: Tool;
  category?: ToolCategory;
  children: ReactNode;
}) {
  const content = getToolContent(tool);
  const related = category
    ? toolsInCategory(category.slug).filter((t) => t.slug !== tool.slug).slice(0, 6)
    : [];
  return (
    <SiteLayout>
      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link to="/tools" className="hover:text-primary">Tools</Link></li>
            {category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link to="/categories/$slug" params={{ slug: category.slug }} className="hover:text-primary">
                    {category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li className="text-foreground">{tool.name}</li>
          </ol>
        </nav>

        <header className="mt-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-lg font-semibold text-accent-foreground">
            {tool.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
            {category && (
              <Link
                to="/categories/$slug"
                params={{ slug: category.slug }}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {category.name}
              </Link>
            )}
          </div>
          <ToolActions slug={tool.slug} />
        </header>
        <p className="mt-3 max-w-2xl text-muted-foreground">{tool.shortDescription}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 font-medium text-brand">
            ✓ No sign-up required
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
            Free to use
          </span>
        </div>

        <section aria-label="Tool" className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          {children}
        </section>

        <section aria-labelledby="how-to-use" className="mt-14">
          <h2 id="how-to-use" className="text-2xl font-bold tracking-tight">How to use {tool.name}</h2>
          <ol className="mt-5 space-y-3">
            {content.howToUse.map((step, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="about-tool" className="mt-14">
          <h2 id="about-tool" className="text-2xl font-bold tracking-tight">About {tool.name}</h2>
          <div className="prose prose-slate mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
            {content.longDescription.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <section aria-labelledby="faq" className="mt-14">
          <h2 id="faq" className="text-2xl font-bold tracking-tight">FAQ about {tool.name}</h2>
          <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
            {content.faqs.map((f, i) => (
              <details key={i} className="group p-5">
                <summary className="cursor-pointer list-none font-medium text-foreground marker:hidden">
                  <span className="mr-2 inline-block text-muted-foreground transition group-open:rotate-90">›</span>
                  {f.q}
                </summary>
                <p className="mt-3 pl-6 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {related.length > 0 && category && (
          <section aria-labelledby="related-tools" className="mt-14">
            <div className="flex items-end justify-between gap-3">
              <h2 id="related-tools" className="text-2xl font-bold tracking-tight">
                More {category.name} tools
              </h2>
              <Link
                to="/categories/$slug"
                params={{ slug: category.slug }}
                className="text-sm text-primary hover:underline"
              >
                View all {category.name} tools →
              </Link>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/tools/$slug"
                    params={{ slug: r.slug }}
                    className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-soft"
                  >
                    <span className="text-lg">{r.icon}</span>
                    <span>
                      <span className="block font-medium text-foreground">{r.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
                        {r.shortDescription}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">
              Browse the full <Link to="/tools" className="text-primary hover:underline">tools directory</Link>
              {" "}or explore other <Link to="/categories/$slug" params={{ slug: category.slug }} className="text-primary hover:underline">{category.name}</Link> utilities.
            </p>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}