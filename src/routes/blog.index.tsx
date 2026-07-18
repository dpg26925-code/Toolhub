import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — ToolHub AI" },
      { name: "description", content: "Product updates, tips and tutorials from the ToolHub AI team." },
      { property: "og:title", content: "Blog — ToolHub AI" },
      { property: "og:description", content: "Product updates, tips and tutorials." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">Blog coming soon</h1>
        <p className="mt-3 text-muted-foreground">We're preparing tutorials and product updates. Check back shortly.</p>
      </div>
    </SiteLayout>
  ),
});