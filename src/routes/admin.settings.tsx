import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Admin Settings" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminShell title="Settings">
      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader><CardTitle>Platform</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Site name" value="Nexatools" />
            <Row label="Primary domain" value="nexatools.cloud" />
            <Row label="Environment" value="Production" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Supabase" value="Connected" />
            <Row label="LemonSqueezy" value="Connected" />
            <Row label="OpenRouter" value="Connected" />
            <Row label="Google OAuth" value="Enabled" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>External dashboards</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline"><a href="https://supabase.com/dashboard/project/fdwpzixwvksjlicnovdo" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-2" /> Supabase</a></Button>
            <Button asChild variant="outline"><a href="https://app.lemonsqueezy.com" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-2" /> LemonSqueezy</a></Button>
            <Button asChild variant="outline"><a href="https://openrouter.ai" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-2" /> OpenRouter</a></Button>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Secrets and API keys are managed via project environment configuration — not editable in the app UI for security reasons.
        </p>
      </div>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}