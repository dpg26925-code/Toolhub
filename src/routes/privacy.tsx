import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ToolHub AI" },
      { name: "description", content: "How ToolHub AI handles your data and privacy." },
      { property: "og:title", content: "Privacy Policy — ToolHub AI" },
      { property: "og:description", content: "How ToolHub AI handles your data and privacy." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-8 space-y-4 text-muted-foreground">
          <p>We take privacy seriously. Client-side tools run entirely in your browser — no data is uploaded.</p>
          <p>This is placeholder privacy copy for V1. Replace with reviewed policy before public launch.</p>
        </div>
      </article>
    </SiteLayout>
  ),
});