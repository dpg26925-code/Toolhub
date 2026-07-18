import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { getTool, getCategory } from "@/lib/tools-data";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { tool, category: getCategory(tool.categorySlug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Tool not found — ToolHub AI" }, { name: "robots", content: "noindex" }] };
    const { tool } = loaderData;
    return {
      meta: [
        { title: `${tool.name} — ToolHub AI` },
        { name: "description", content: tool.shortDescription },
        { property: "og:title", content: `${tool.name} — ToolHub AI` },
        { property: "og:description", content: tool.shortDescription },
      ],
    };
  },
  component: ToolPagePlaceholder,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Tool not found</h1>
        <Link to="/tools" className="mt-6 inline-block text-primary hover:underline">All tools →</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
      </div>
    </SiteLayout>
  ),
});

function ToolPagePlaceholder() {
  const { tool, category } = Route.useLoaderData();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Link to="/tools" className="text-sm text-muted-foreground hover:text-primary">← Back to tools</Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-lg font-semibold text-accent-foreground">
            {tool.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
            <p className="text-sm text-muted-foreground">{category?.name}</p>
          </div>
        </div>
        <p className="mt-4 text-muted-foreground">{tool.shortDescription}</p>
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-soft">
          <p className="text-sm font-semibold text-primary">Tool interface coming in Phase 3</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The reusable ToolShell (input · preview · output) and this tool's handler will ship in the next phase.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}