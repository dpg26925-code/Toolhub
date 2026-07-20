import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Wrench, Users } from "lucide-react";

const PRO_PRICE_USD = 20;

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const [users, tools, posts, mtdActive] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("tools").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .gte("created_at", monthStart.toISOString()),
      ]);
      return {
        users: users.count ?? 0,
        tools: tools.count ?? 0,
        posts: posts.count ?? 0,
        mtdRevenue: (mtdActive.count ?? 0) * PRO_PRICE_USD,
      };
    },
  });

  const recentSubs = useQuery({
    queryKey: ["admin-recent-subs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("id, plan_id, status, created_at, user_id, profiles(email)")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const recentUsers = useQuery({
    queryKey: ["admin-recent-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, plan, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatCard label="Total Users" value={stats.data?.users ?? "—"} />
        <StatCard label="Total Tools" value={stats.data?.tools ?? "—"} />
        <StatCard label="Blog Posts" value={stats.data?.posts ?? "—"} />
        <StatCard label="Revenue (MTD)" value={stats.data ? `$${stats.data.mtdRevenue}` : "—"} />
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Button asChild variant="outline" className="h-auto py-3 justify-start">
          <Link to="/admin/blog"><FileText className="h-4 w-4 mr-2" /> Create new post</Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-3 justify-start">
          <Link to="/admin/tools"><Wrench className="h-4 w-4 mr-2" /> Manage tools</Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-3 justify-start">
          <Link to="/admin/users"><Users className="h-4 w-4 mr-2" /> View all users</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent subscriptions</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>User</TableHead><TableHead>Plan</TableHead>
                <TableHead>Status</TableHead><TableHead>Date</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(recentSubs.data ?? []).map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs">{s.profiles?.email ?? s.user_id?.slice(0, 8)}</TableCell>
                    <TableCell>{s.plan_id}</TableCell>
                    <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {recentSubs.data && recentSubs.data.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">No subscriptions yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent signups</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Email</TableHead><TableHead>Name</TableHead>
                <TableHead>Plan</TableHead><TableHead>Joined</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(recentUsers.data ?? []).map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-xs font-medium">{u.email}</TableCell>
                    <TableCell className="text-xs">{u.full_name ?? "—"}</TableCell>
                    <TableCell><Badge variant={u.plan === "pro" ? "default" : "secondary"}>{u.plan}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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