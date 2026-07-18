import { Suspense } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ToolShell } from "@/components/tool-shell";
import { getTool, getCategory } from "@/lib/tools-data";
import { TOOL_REGISTRY } from "@/tools/registry";

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
  component: ToolPage,
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

function ToolPage() {
  const { tool, category } = Route.useLoaderData();
  const Component = TOOL_REGISTRY[tool.slug];

  return (
    <ToolShell tool={tool} category={category}>
      {Component ? (
        <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading tool…</div>}>
          <Component />
        </Suspense>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-semibold text-primary">Coming soon</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This tool is on the roadmap and will be available shortly.
          </p>
        </div>
      )}
    </ToolShell>
  );
}