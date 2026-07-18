import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Nexatools" },
      { name: "description", content: "Terms of service for using Nexatools." },
      { property: "og:title", content: "Terms of Service — Nexatools" },
      { property: "og:description", content: "Terms of service for using Nexatools." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-8 space-y-4 text-muted-foreground">
          <p>Welcome to Nexatools. By using our services you agree to the terms below.</p>
          <p>This is placeholder legal copy for V1. Replace with reviewed terms before public launch.</p>
        </div>
      </article>
    </SiteLayout>
  ),
});