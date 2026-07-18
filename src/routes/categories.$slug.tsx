import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ToolCard } from "@/components/tool-card";
import { getCategory, toolsInCategory } from "@/lib/tools-data";
import type { Tool } from "@/lib/tools-data";
import { abs } from "@/lib/site";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category, tools: toolsInCategory(params.slug) };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Category not found — Nexatools" }, { name: "robots", content: "noindex" }] };
    const { category } = loaderData;
    const title = `${category.name} Tools — Free Online ${category.name} Utilities | Nexatools`;
    const url = abs(`/categories/${params.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: category.description },
        { property: "og:title", content: title },
        { property: "og:description", content: category.description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <p className="mt-2 text-muted-foreground">Try browsing all tools instead.</p>
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

function CategoryPage() {
  const { category, tools } = Route.useLoaderData();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <Link to="/tools" className="text-sm text-muted-foreground hover:text-primary">← All tools</Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="mr-2">{category.icon}</span>{category.name} tools
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
        </div>
        {tools.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No tools in this category yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t: Tool) => (<ToolCard key={t.slug} tool={t} />))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}