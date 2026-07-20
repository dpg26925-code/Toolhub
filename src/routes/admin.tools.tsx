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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/tools")({
  head: () => ({ meta: [{ title: "Tools — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminTools,
});

function AdminTools() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editing, setEditing] = useState<any | null>(null);
  const [editState, setEditState] = useState<{ credit_cost: number; category_id: number | null; is_featured: boolean }>({
    credit_cost: 0, category_id: null, is_featured: false,
  });

  const catsQ = useQuery({
    queryKey: ["admin-tools-cats"],
    queryFn: async () => (await supabase.from("categories").select("id, name").order("name")).data ?? [],
  });

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

  const featM = useMutation({
    mutationFn: async ({ id, is_featured }: { id: number; is_featured: boolean }) => {
      const { error } = await supabase.from("tools").update({ is_featured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tools"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const delM = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("tools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tools"] }); toast.success("Tool deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const saveM = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const { error } = await supabase.from("tools").update({
        credit_cost: editState.credit_cost,
        category_id: editState.category_id,
        is_featured: editState.is_featured,
      }).eq("id", editing.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tools"] }); toast.success("Saved"); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  function openEdit(t: any) {
    setEditing(t);
    setEditState({ credit_cost: t.credit_cost, category_id: t.category_id, is_featured: !!t.is_featured });
  }

  const filtered = (toolsQ.data ?? []).filter((t: any) => {
    if (q && !t.name.toLowerCase().includes(q.toLowerCase()) && !t.slug.includes(q.toLowerCase())) return false;
    if (catFilter !== "all" && String(t.category_id) !== catFilter) return false;
    return true;
  });

  return (
    <AdminShell title="Tools">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder="Search tools…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(catsQ.data ?? []).map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-auto text-sm text-muted-foreground">{filtered.length} tools</span>
          </div>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <button
                        type="button"
                        onClick={() => featM.mutate({ id: t.id, is_featured: !t.is_featured })}
                        aria-label="Toggle featured"
                        className="text-muted-foreground hover:text-yellow-500"
                      >
                        <Star className={`h-4 w-4 ${t.is_featured ? "fill-yellow-400 text-yellow-500" : ""}`} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={t.is_published}
                        onCheckedChange={(v) => toggleM.mutate({ id: t.id, is_published: v })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(t)}>Edit</Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { if (confirm(`Delete "${t.name}"?`)) delM.mutate(t.id); }}
                          aria-label="Delete tool"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit tool: {editing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select
                value={editState.category_id ? String(editState.category_id) : ""}
                onValueChange={(v) => setEditState((s) => ({ ...s, category_id: Number(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {(catsQ.data ?? []).map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Credit cost</label>
              <Input
                type="number"
                min={0}
                value={editState.credit_cost}
                onChange={(e) => setEditState((s) => ({ ...s, credit_cost: Number(e.target.value) }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={editState.is_featured}
                onCheckedChange={(v) => setEditState((s) => ({ ...s, is_featured: v }))}
              />
              Featured on homepage
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => saveM.mutate()} disabled={saveM.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}