import { createFileRoute, Link } from "@tanstack/react-router";
import { abs } from "@/lib/site";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { ToolCard } from "@/components/tool-card";
import { CATEGORIES, TOOLS } from "@/lib/tools-data";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "All Tools — 30+ Free Online Tools | Nexatools" },
      { name: "description", content: "Browse every tool available on Nexatools — PDF, image, AI and developer utilities." },
      { property: "og:title", content: "All Tools — 30+ Free Online Tools | Nexatools" },
      { property: "og:description", content: "Browse every tool available on Nexatools." },
      { property: "og:url", content: abs("/tools") },
    ],
    links: [{ rel: "canonical", href: abs("/tools") }],
  }),
  component: ToolsIndex,
});

function ToolsIndex() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (cat && t.categorySlug !== cat) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.shortDescription.toLowerCase().includes(q);
    });
  }, [query, cat]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All tools</h1>
          <p className="mt-2 text-muted-foreground">{TOOLS.length} tools across {CATEGORIES.length} categories.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="space-y-2">
            <button onClick={() => setCat(null)} className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${cat === null ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}>
              All categories
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.slug} onClick={() => setCat(c.slug)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${cat === c.slug ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}>
                <span>{c.icon}</span><span>{c.name}</span>
              </button>
            ))}
            <Link to="/categories/$slug" params={{ slug: "developer" }} className="mt-3 block text-xs text-muted-foreground hover:text-primary">
              Browse category pages →
            </Link>
          </aside>
          <div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className="mb-6 w-full rounded-lg border border-input bg-card px-4 py-3 text-sm shadow-soft outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              aria-label="Search tools"
            />
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No tools match your search.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((t) => (<ToolCard key={t.slug} tool={t} />))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}