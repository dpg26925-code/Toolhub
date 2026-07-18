import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Check } from "lucide-react";

export const Route = createFileRoute("/dashboard/subscription")({
  head: () => ({ meta: [{ title: "Subscription — ToolHub AI" }, { name: "robots", content: "noindex" }] }),
  component: SubPage,
});

function SubPage() {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("plan, credits").eq("id", user!.id).single();
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", user!.id).maybeSingle();
      return { profile, sub };
    },
  });

  const plan = q.data?.profile?.plan ?? "free";

  return (
    <DashboardShell title="Subscription">
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current plan</CardTitle>
            <Badge>{plan.toUpperCase()}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {q.data?.sub ? (
              <p>Renews {q.data.sub.current_period_end ? new Date(q.data.sub.current_period_end).toLocaleDateString() : "—"}. Status: {q.data.sub.status}.</p>
            ) : (
              <p>You're on the Free plan. Upgrade for unlimited tool runs, no ads, and API access.</p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <PlanCard name="Free" price="$0" features={["10 credits/day", "All client-side tools", "Ads shown"]} current={plan === "free"} />
          <PlanCard name="Pro" price="$20/mo" features={["Unlimited runs", "No ads", "API access", "Priority queue"]} current={plan === "pro"} highlight />
          <PlanCard name="Enterprise" price="Custom" features={["SLA", "SSO", "Dedicated support"]} current={plan === "enterprise"} />
        </div>
      </div>
    </DashboardShell>
  );
}

function PlanCard({ name, price, features, current, highlight }: { name: string; price: string; features: string[]; current?: boolean; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-primary shadow-lg" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {name}
          {current && <Badge variant="secondary">Current</Badge>}
        </CardTitle>
        <p className="text-2xl font-bold">{price}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" />{f}</li>
          ))}
        </ul>
        {!current && <Button className="w-full" disabled>Coming soon</Button>}
      </CardContent>
    </Card>
  );
}