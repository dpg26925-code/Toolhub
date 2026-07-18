import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tools")({
  head: () => ({ meta: [{ title: "Tools — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminTools,
});

function AdminTools() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const toolsQ = useQuery({
    queryKey: ["admin-tools"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tools").select("*, categories(name)")
        .order("id", { ascending: true });
      return data ?? [];
    },
  });

  const toggleM = useMutation({
    mutationFn: async ({ id, is_published }: { id: number; is_published: boolean }) => {
      const { error } = await supabase.from("tools").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tools"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (toolsQ.data ?? []).filter((t: any) =>
    !q || t.name.toLowerCase().includes(q.toLowerCase()) || t.slug.includes(q.toLowerCase())
  );

  return (
    <AdminShell title="Tools">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Input placeholder="Search tools…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
            <Button disabled className="ml-auto">+ New tool</Button>
          </div>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.icon} {t.name}</TableCell>
                    <TableCell className="font-mono text-xs">{t.slug}</TableCell>
                    <TableCell>{t.categories?.name ?? "—"}</TableCell>
                    <TableCell><Badge variant={t.credit_cost === 0 ? "secondary" : "default"}>{t.credit_cost}</Badge></TableCell>
                    <TableCell>
                      <Switch
                        checked={t.is_published}
                        onCheckedChange={(v) => toggleM.mutate({ id: t.id, is_published: v })}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}