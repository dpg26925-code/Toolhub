import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminPayments,
});

function AdminPayments() {
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const q = useQuery({
    queryKey: ["admin-payments", filter],
    queryFn: async () => {
      let query = supabase
        .from("subscriptions")
        .select("*, profiles(email)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter !== "all") query = query.eq("status", filter);
      const { data } = await query;
      return data ?? [];
    },
  });

  return (
    <AdminShell title="Payments">
      <Card className="mb-4">
        <CardContent className="p-4 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter status:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="past_due">Past due</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-sm text-muted-foreground">{(q.data ?? []).length} records</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider ID</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(q.data ?? []).map((o: any) => {
                const open = expanded === o.id;
                return (
                  <Fragment key={o.id}>
                    <TableRow>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => setExpanded(open ? null : o.id)}>
                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">#{o.id}</TableCell>
                      <TableCell className="text-xs">{o.profiles?.email ?? o.user_id?.slice(0, 8)}</TableCell>
                      <TableCell>{o.plan_id}</TableCell>
                      <TableCell><Badge variant={o.status === "active" ? "default" : "secondary"}>{o.status}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{o.provider_subscription_id ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                    {open && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30">
                          <pre className="text-xs overflow-auto max-h-80 whitespace-pre-wrap">{JSON.stringify(o, null, 2)}</pre>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
              {q.data && q.data.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No orders yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}