import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({ meta: [{ title: "History — ToolHub AI" }, { name: "robots", content: "noindex" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("usage_logs")
        .select("*, tools(name, slug, icon)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  return (
    <DashboardShell title="History">
      <Card>
        <CardContent className="p-0">
          {q.data?.length ? (
            <ul className="divide-y">
              {q.data.map((r: any) => (
                <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <Link to="/tools/$slug" params={{ slug: r.tools?.slug }} className="flex items-center gap-2 hover:underline">
                    <span>{r.tools?.icon}</span>
                    <span>{r.tools?.name}</span>
                  </Link>
                  <div className="flex items-center gap-3">
                    <Badge variant={r.status === "success" ? "default" : "destructive"}>{r.status ?? "success"}</Badge>
                    <span className="text-muted-foreground">-{r.credits_used} cr</span>
                    <span className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">No usage history yet.</p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}