import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard-shell";
import { ToolCard } from "@/components/tool-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getTool } from "@/lib/tools-data";

export const Route = createFileRoute("/dashboard/favorites")({
  head: () => ({ meta: [{ title: "Favorites — ToolHub AI" }, { name: "robots", content: "noindex" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["favorites-full", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("favorite_tools").select("tools(slug)").eq("user_id", user!.id);
      return (data ?? []).map((f: any) => f.tools?.slug).filter(Boolean);
    },
  });

  const tools = (q.data ?? []).map((slug) => getTool(slug)).filter(Boolean);

  return (
    <DashboardShell title="Favorites">
      {tools.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => <ToolCard key={t!.slug} tool={t!} />)}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No favorites yet. <Link to="/tools" className="text-primary hover:underline">Browse tools</Link>
        </p>
      )}
    </DashboardShell>
  );
}