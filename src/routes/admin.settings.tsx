import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Admin Settings" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell title="Settings">
      <Card>
        <CardHeader><CardTitle>Platform settings</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Global platform configuration will live here (feature flags, guest quotas, ad slots, email templates).
        </CardContent>
      </Card>
    </AdminShell>
  ),
});