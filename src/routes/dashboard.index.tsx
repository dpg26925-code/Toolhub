import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { TOOLS } from "@/lib/tools-data";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — ToolHub AI" }, { name: "robots", content: "noindex" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuth();

  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });

  const recentQ = useQuery({
    queryKey: ["recent-usage", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("usage_logs")
        .select("*, tools(name, slug, icon)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const favQ = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("favorite_tools")
        .select("tools(name, slug, icon, short_description)")
        .eq("user_id", user!.id)
        .limit(6);
      return data ?? [];
    },
  });

  const credits = profileQ.data?.credits ?? 0;
  const plan = profileQ.data?.plan ?? "free";
  const dailyMax = plan === "free" ? 10 : 100;

  return (
    <DashboardShell title="Dashboard">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Welcome back{profileQ.data?.full_name ? `, ${profileQ.data.full_name}` : ""} 👋
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Credits remaining</span>
              <span className="font-medium">{credits} / {dailyMax}</span>
            </div>
            <Progress value={Math.min(100, (credits / dailyMax) * 100)} />
            <div className="flex gap-2 pt-2">
              <Button asChild>
                <Link to="/tools">Browse tools</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/subscription">Upgrade to Pro</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Recently used</CardTitle></CardHeader>
            <CardContent>
              {recentQ.data?.length ? (
                <ul className="space-y-2 text-sm">
                  {recentQ.data.map((r: any) => (
                    <li key={r.id} className="flex justify-between">
                      <Link to="/tools/$slug" params={{ slug: r.tools?.slug }} className="hover:underline">
                        {r.tools?.icon} {r.tools?.name}
                      </Link>
                      <span className="text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No tools used yet. <Link to="/tools" className="text-primary hover:underline">Explore tools</Link></p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Your favorites</CardTitle></CardHeader>
            <CardContent>
              {favQ.data?.length ? (
                <ul className="space-y-2 text-sm">
                  {favQ.data.map((f: any, i) => (
                    <li key={i}>
                      <Link to="/tools/$slug" params={{ slug: f.tools?.slug }} className="hover:underline">
                        {f.tools?.icon} {f.tools?.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Star your favorite tools to see them here.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Quick stats</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <Stat label="Tools available" value={TOOLS.length} />
            <Stat label="Credits" value={credits} />
            <Stat label="Plan" value={plan.toUpperCase()} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}