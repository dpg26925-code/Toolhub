import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({ meta: [{ title: "History — Nexatools" }, { name: "robots", content: "noindex" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(0);
  const q = useQuery({
    queryKey: ["history", user?.id, page],
    enabled: !!user,
    queryFn: async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, count } = await supabase
        .from("usage_logs")
        .select("*, tools(name, slug, icon)", { count: "exact" })
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .range(from, to);
      return { rows: data ?? [], count: count ?? 0 };
    },
  });
  const rows = q.data?.rows ?? [];
  const total = q.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DashboardShell title="History">
      <Card>
        <CardContent className="p-0">
          {rows.length ? (
            <ul className="divide-y">
              {rows.map((r: any) => (
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
      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page + 1} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}