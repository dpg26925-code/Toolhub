import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog")({
  head: () => ({ meta: [{ title: "Blog — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminBlog,
});

function AdminBlog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", cover_image: "", published: false });

  const postsQ = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createM = useMutation({
    mutationFn: async () => {
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { error } = await supabase.from("blog_posts").insert({
        title: form.title, slug, excerpt: form.excerpt, content: form.content,
        cover_image: form.cover_image || null, published: form.published,
        published_at: form.published ? new Date().toISOString() : null,
        author_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post created");
      setForm({ title: "", slug: "", excerpt: "", content: "", cover_image: "", published: false });
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePub = useMutation({
    mutationFn: async ({ id, published }: { id: number; published: boolean }) => {
      const { error } = await supabase.from("blog_posts")
        .update({ published, published_at: published ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog"] }),
  });

  return (
    <AdminShell title="Blog">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>New post</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Slug (optional)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div><Label>Cover image URL</Label><Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} /></div>
            <div><Label>Content (Markdown)</Label><Textarea rows={10} className="font-mono text-sm" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Publish</Label></div>
            <Button onClick={() => createM.mutate()} disabled={createM.isPending || !form.title}>Create post</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Posts</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Publish</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(postsQ.data ?? []).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell><div className="font-medium">{p.title}</div><div className="text-xs text-muted-foreground font-mono">/{p.slug}</div></TableCell>
                    <TableCell><Badge variant={p.published ? "default" : "secondary"}>{p.published ? "Published" : "Draft"}</Badge></TableCell>
                    <TableCell><Switch checked={p.published} onCheckedChange={(v) => togglePub.mutate({ id: p.id, published: v })} /></TableCell>
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