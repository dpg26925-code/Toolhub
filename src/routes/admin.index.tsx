import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Nexatools" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

function AdminHome() {
  const q = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ count: users }, { count: tools }, { count: usage }, { count: posts }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("tools").select("*", { count: "exact", head: true }),
        supabase.from("usage_logs").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
      ]);
      return { users, tools, usage, posts };
    },
  });
  return (
    <AdminShell title="Overview">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Users" value={q.data?.users ?? "—"} />
        <StatCard label="Tools" value={q.data?.tools ?? "—"} />
        <StatCard label="Total runs" value={q.data?.usage ?? "—"} />
        <StatCard label="Blog posts" value={q.data?.posts ?? "—"} />
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm text-muted-foreground font-medium">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-3xl font-bold">{value}</div></CardContent>
    </Card>
  );
}