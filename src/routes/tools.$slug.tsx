import { Suspense } from "react";
import { ClientOnly, createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ToolShell } from "@/components/tool-shell";
import { getTool, getCategory } from "@/lib/tools-data";
import { TOOL_REGISTRY } from "@/tools/registry";
import { getToolContent, toolMetaDescription, toolPageTitle } from "@/lib/tool-content";
import { abs } from "@/lib/site";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) {
      const redirects: Record<string, string> = {
        "ut-builder": "utm-builder",
      };
      const target = redirects[params.slug];
      if (target) throw redirect({ to: "/tools/$slug", params: { slug: target } });
      throw notFound();
    }
    return { tool, category: getCategory(tool.categorySlug) };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Tool not found — Nexatools" }, { name: "robots", content: "noindex" }] };
    const { tool, category } = loaderData;
    const title = toolPageTitle(tool);
    const description = toolMetaDescription(tool);
    const url = abs(`/tools/${params.slug}`);
    const content = getToolContent(tool);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: tool.name,
            description: description,
            applicationCategory: category?.name ? `${category.name}Application` : "UtilitiesApplication",
            operatingSystem: "Any (web browser)",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: content.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Tools", item: "/tools" },
              ...(category
                ? [{ "@type": "ListItem", position: 3, name: category.name, item: `/categories/${category.slug}` }]
                : []),
              { "@type": "ListItem", position: category ? 4 : 3, name: tool.name, item: url },
            ],
          }),
        },
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

  return (
    <ToolShell tool={tool} category={category}>
      <ClientOnly fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading tool…</div>}>
        <ToolRenderer slug={tool.slug} />
      </ClientOnly>
    </ToolShell>
  );
}

// Rendered only on the client; TOOL_REGISTRY is intentionally empty during SSR
// (see src/tools/registry.ts) to keep heavy tool chunks out of the Worker bundle.
function ToolRenderer({ slug }: { slug: string }) {
  const Component = TOOL_REGISTRY[slug];
  if (!Component) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-sm font-semibold text-primary">Coming soon</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This tool is on the roadmap and will be available shortly.
        </p>
      </div>
    );
  }
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading tool…</div>}>
      <Component />
    </Suspense>
  );
}