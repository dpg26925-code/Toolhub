import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
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
import { Pencil, Trash2, X, Sparkles, Eye, Clock, User as UserIcon, Calendar,
  Bold, Italic, Heading2, Heading3, Link2, Image as ImageIcon, List, ListOrdered,
  Quote, Code, Minus, ListTree } from "lucide-react";
import { callAi } from "@/lib/ai-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PostForm = {
  id: number | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  tags: string;
  published: boolean;
  meta_title: string;
  meta_description: string;
  category: string;
  published_at: string; // ISO or ""
};

const EMPTY: PostForm = {
  id: null, title: "", slug: "", excerpt: "", content: "",
  cover_image: "", tags: "", published: false,
  meta_title: "", meta_description: "", category: "", published_at: "",
};

const CATEGORIES = ["General", "PDF", "Image", "Video", "AI", "Developer", "Writing", "SEO", "Tutorial", "Product"];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const wordsIn = (s: string) => (s.trim().match(/\S+/g)?.length ?? 0);
const readingMinutes = (s: string) => Math.max(1, Math.round(wordsIn(s) / 220));

const slugifyHeading = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function extractToc(md: string) {
  const items: { level: 2 | 3; text: string; id: string }[] = [];
  const used = new Map<string, number>();
  for (const raw of (md || "").split(/\r?\n/)) {
    const m = raw.trim().match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;
    const level = (m[1].length === 2 ? 2 : 3) as 2 | 3;
    const text = m[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim();
    let id = slugifyHeading(text) || `section-${items.length + 1}`;
    const n = used.get(id) ?? 0;
    if (n > 0) id = `${id}-${n}`;
    used.set(id, n + 1);
    items.push({ level, text, id });
  }
  return items;
}

function mdPreview(md: string): string {
  let s = (md || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  s = s.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c.trim()}</code></pre>`);
  s = s.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  const used = new Map<string, number>();
  const hid = (t: string) => {
    let id = slugifyHeading(t) || `section-${used.size + 1}`;
    const n = used.get(id) ?? 0; if (n > 0) id = `${id}-${n}`;
    used.set(id, n + 1); return id;
  };
  s = s.replace(/^###### (.+)$/gm, "<h6>$1</h6>").replace(/^##### (.+)$/gm, "<h5>$1</h5>")
       .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
       .replace(/^### (.+)$/gm, (_, t) => `<h3 id="${hid(t)}">${t}</h3>`)
       .replace(/^## (.+)$/gm, (_, t) => `<h2 id="${hid(t)}">${t}</h2>`)
       .replace(/^# (.+)$/gm, (_, t) => `<h1 id="${hid(t)}">${t}</h1>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  s = s.replace(/^---$/gm, "<hr/>");
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" class="rounded-lg my-3" />');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
  s = s.replace(/^(?:- |\* )(.+)$/gm, "<li>$1</li>").replace(/(<li>[\s\S]+?<\/li>)/g, (m) => `<ul>${m}</ul>`);
  s = s.split(/\n{2,}/).map((p) => (/^<(h\d|ul|pre|blockquote|img)/.test(p.trim()) ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`)).join("\n\n");
  return s;
}

function extractJson(raw: string): any {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1) s = s.slice(first, last + 1);
  return JSON.parse(s);
}

export const Route = createFileRoute("/admin/blog")({
  head: () => ({ meta: [{ title: "Blog — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminBlog,
});

function AdminBlog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<PostForm>(EMPTY);
  const isEditing = form.id !== null;
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiTone, setAiTone] = useState("informative");
  const [aiAudience, setAiAudience] = useState("general readers");
  const [aiLength, setAiLength] = useState("medium");
  const [aiBusy, setAiBusy] = useState(false);

  const readingMin = useMemo(() => readingMinutes(form.content), [form.content]);
  const wordCount = useMemo(() => wordsIn(form.content), [form.content]);
  const toc = useMemo(() => extractToc(form.content), [form.content]);

  const applyMd = (
    wrap: { before: string; after?: string; placeholder?: string; block?: boolean } | ((sel: string) => string)
  ) => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = ta.value;
    const sel = value.slice(start, end);
    let insert: string;
    let selStart: number;
    let selEnd: number;
    if (typeof wrap === "function") {
      insert = wrap(sel);
      selStart = start + insert.length;
      selEnd = selStart;
    } else {
      const text = sel || wrap.placeholder || "";
      const before = wrap.block && start > 0 && value[start - 1] !== "\n" ? "\n" : "";
      insert = `${before}${wrap.before}${text}${wrap.after ?? ""}`;
      selStart = start + before.length + wrap.before.length;
      selEnd = selStart + text.length;
    }
    const next = value.slice(0, start) + insert + value.slice(end);
    setForm((f) => ({ ...f, content: next }));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
    });
  };

  const insertToc = () =>
    applyMd(() => {
      const items = extractToc(form.content);
      if (!items.length) { toast.error("Add H2/H3 headings first"); return ""; }
      const md = ["## Table of contents", ...items.map((it) =>
        `${it.level === 3 ? "  " : ""}- [${it.text}](#${it.id})`
      ), ""].join("\n");
      return md + "\n";
    });

  const promptLink = () => {
    const url = typeof window !== "undefined" ? window.prompt("URL", "https://") : "";
    if (!url) return;
    applyMd({ before: "[", after: `](${url})`, placeholder: "link text" });
  };
  const promptImage = () => {
    const url = typeof window !== "undefined" ? window.prompt("Image URL", "https://") : "";
    if (!url) return;
    applyMd({ before: "![", after: `](${url})`, placeholder: "alt text", block: true });
  };

  const TB = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );

  const generate = async () => {
    if (!aiTopic.trim()) { toast.error("Enter a topic"); return; }
    setAiBusy(true);
    try {
      const raw = await callAi({
        action: "blog-write",
        topic: aiTopic,
        keywords: aiKeywords,
        tone: aiTone,
        audience: aiAudience,
        length: aiLength,
      });
      const j = extractJson(raw);
      setForm((f) => ({
        ...f,
        title: j.title ?? f.title,
        slug: j.slug ? slugify(j.slug) : (j.title ? slugify(j.title) : f.slug),
        excerpt: j.excerpt ?? f.excerpt,
        tags: Array.isArray(j.tags) ? j.tags.join(", ") : f.tags,
        content: j.content ?? f.content,
        meta_title: j.meta_title ?? j.title ?? f.meta_title,
        meta_description: j.meta_description ?? j.excerpt ?? f.meta_description,
      }));
      toast.success("Draft generated — review then publish");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setAiBusy(false);
    }
  };

  const postsQ = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const saveM = useMutation({
    mutationFn: async () => {
      const slug = form.slug ? slugify(form.slug) : slugify(form.title);
      if (!slug) throw new Error("Title or slug is required");
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const payload: any = {
        title: form.title,
        slug,
        excerpt: form.excerpt || null,
        content: form.content,
        cover_image: form.cover_image || null,
        tags,
        published: form.published,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        category: form.category || null,
        published_at: form.published
          ? (form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString())
          : null,
      };
      if (form.id) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert({ ...payload, author_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "Post updated" : "Post created");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteM = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post deleted");
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
    onError: (e: any) => toast.error(e.message),
  });

  const startEdit = (p: any) => {
    setForm({
      id: p.id,
      title: p.title ?? "",
      slug: p.slug ?? "",
      excerpt: p.excerpt ?? "",
      content: p.content ?? "",
      cover_image: p.cover_image ?? "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
      published: !!p.published,
      meta_title: p.meta_title ?? "",
      meta_description: p.meta_description ?? "",
      category: p.category ?? "",
      published_at: p.published_at ? new Date(p.published_at).toISOString().slice(0, 16) : "",
    });
    setShowPreview(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminShell title="Blog">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Blog Writer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Topic</Label>
              <Input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. Top 10 free PDF tools for freelancers in 2026" />
            </div>
            <div className="md:col-span-2">
              <Label>Keywords (optional, comma-separated)</Label>
              <Input value={aiKeywords} onChange={(e) => setAiKeywords(e.target.value)} placeholder="pdf compressor, merge pdf, online tools" />
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={aiTone} onValueChange={setAiTone}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["informative","friendly","professional","persuasive","casual","authoritative"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Audience</Label>
              <Input value={aiAudience} onChange={(e) => setAiAudience(e.target.value)} placeholder="general readers" />
            </div>
            <div>
              <Label>Length</Label>
              <Select value={aiLength} onValueChange={setAiLength}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (500-700 words)</SelectItem>
                  <SelectItem value="medium">Medium (900-1200 words)</SelectItem>
                  <SelectItem value="long">Long (1500-2000 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generate} disabled={aiBusy || !aiTopic.trim()}>
            <Sparkles className="h-4 w-4 mr-2" />
            {aiBusy ? "Generating…" : "Generate draft"}
          </Button>
          <p className="text-xs text-muted-foreground">Fills the form below. Review, edit, then toggle Publish.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {isEditing ? `Edit post #${form.id}` : "New post"}
                <Badge variant={form.published ? "default" : "secondary"}>
                  {form.published ? "Published" : "Draft"}
                </Badge>
              </span>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => setShowPreview((v) => !v)}>
                  <Eye className="h-4 w-4 mr-1" /> {showPreview ? "Edit" : "Preview"}
                </Button>
                {isEditing && (
                  <Button size="sm" variant="ghost" onClick={() => { setForm(EMPTY); setShowPreview(false); }}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                )}
              </div>
            </CardTitle>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
              <span className="inline-flex items-center gap-1"><UserIcon className="h-3 w-3" /> {user?.email ?? "—"}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {form.published_at ? new Date(form.published_at).toLocaleString() : "Not scheduled"}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {readingMin} min read · {wordCount} words</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showPreview ? (
              <article className="rounded-xl border bg-background p-5">
                {form.cover_image && (
                  <img src={form.cover_image} alt={form.title} className="mb-4 h-56 w-full rounded-lg object-cover" />
                )}
                <h1 className="text-3xl font-bold tracking-tight">{form.title || "Untitled"}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{user?.email ?? "Author"}</span>
                  <span>·</span>
                  <span>{form.published_at ? new Date(form.published_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{readingMin} min read</span>
                  {form.category && (<><span>·</span><Badge variant="secondary">{form.category}</Badge></>)}
                </div>
                {form.excerpt && <p className="mt-4 text-muted-foreground">{form.excerpt}</p>}
                <div className="prose max-w-none dark:prose-invert mt-6 text-sm" dangerouslySetInnerHTML={{ __html: mdPreview(form.content) }} />
              </article>
            ) : (
              <>
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div>
                  <Label>Slug (optional)</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={form.title ? slugify(form.title) : "auto from title"} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category || "__none"} onValueChange={(v) => setForm({ ...form, category: v === "__none" ? "" : v })}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">— None —</SelectItem>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Publish date</Label>
                    <Input
                      type="datetime-local"
                      value={form.published_at}
                      onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                    />
                  </div>
                </div>
                <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} /></div>
                <div>
                  <Label>Cover image URL</Label>
                  <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://…" />
                  {form.cover_image && (
                    <div className="mt-2 overflow-hidden rounded-lg border">
                      <img
                        src={form.cover_image}
                        alt="Cover preview"
                        className="h-40 w-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>
                <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="seo, marketing, ai" /></div>

                <div className="rounded-lg border p-3 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">SEO</p>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Meta title</Label>
                      <span className={`text-xs ${form.meta_title.length > 60 ? "text-destructive" : "text-muted-foreground"}`}>{form.meta_title.length}/60</span>
                    </div>
                    <Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} placeholder={form.title || "Shown on Google (≤ 60 chars)"} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Meta description</Label>
                      <span className={`text-xs ${form.meta_description.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>{form.meta_description.length}/160</span>
                    </div>
                    <Textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} rows={2} placeholder={form.excerpt || "Shown under the title in search results (≤ 160 chars)"} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>Content (Markdown)</Label>
                    <span className="text-xs text-muted-foreground">WordPress-style editor · {toc.length} heading{toc.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 bg-muted/40 p-1">
                    <TB title="Heading 2" onClick={() => applyMd({ before: "## ", placeholder: "Heading", block: true })}><Heading2 className="h-4 w-4" /></TB>
                    <TB title="Heading 3" onClick={() => applyMd({ before: "### ", placeholder: "Subheading", block: true })}><Heading3 className="h-4 w-4" /></TB>
                    <span className="mx-1 h-5 w-px bg-border" />
                    <TB title="Bold" onClick={() => applyMd({ before: "**", after: "**", placeholder: "bold" })}><Bold className="h-4 w-4" /></TB>
                    <TB title="Italic" onClick={() => applyMd({ before: "*", after: "*", placeholder: "italic" })}><Italic className="h-4 w-4" /></TB>
                    <TB title="Inline code" onClick={() => applyMd({ before: "`", after: "`", placeholder: "code" })}><Code className="h-4 w-4" /></TB>
                    <span className="mx-1 h-5 w-px bg-border" />
                    <TB title="Link" onClick={promptLink}><Link2 className="h-4 w-4" /></TB>
                    <TB title="Image" onClick={promptImage}><ImageIcon className="h-4 w-4" /></TB>
                    <span className="mx-1 h-5 w-px bg-border" />
                    <TB title="Bulleted list" onClick={() => applyMd({ before: "- ", placeholder: "List item", block: true })}><List className="h-4 w-4" /></TB>
                    <TB title="Numbered list" onClick={() => applyMd({ before: "1. ", placeholder: "List item", block: true })}><ListOrdered className="h-4 w-4" /></TB>
                    <TB title="Quote" onClick={() => applyMd({ before: "> ", placeholder: "Quote", block: true })}><Quote className="h-4 w-4" /></TB>
                    <TB title="Horizontal rule" onClick={() => applyMd(() => "\n\n---\n\n")}><Minus className="h-4 w-4" /></TB>
                    <span className="mx-1 h-5 w-px bg-border" />
                    <TB title="Insert Table of Contents" onClick={insertToc}><ListTree className="h-4 w-4" /></TB>
                  </div>
                  <Textarea
                    ref={contentRef}
                    rows={16}
                    className="rounded-t-none font-mono text-sm"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder={"Write your post in Markdown…\n\n## Introduction\nStart here."}
                  />
                  {toc.length > 0 && (
                    <div className="mt-3 rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                        <ListTree className="h-3 w-3" /> Table of contents preview
                      </p>
                      <ol className="mt-2 space-y-1 text-sm">
                        {toc.map((it) => (
                          <li key={it.id} className={it.level === 3 ? "ml-4 text-muted-foreground" : ""}>
                            {it.text}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Publish</Label></div>
                <div className="flex gap-2">
                  <Button onClick={() => saveM.mutate()} disabled={saveM.isPending || !form.title}>
                    {saveM.isPending ? "Saving…" : isEditing ? "Update post" : "Create post"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowPreview(true)} disabled={!form.title && !form.content}>
                    <Eye className="h-4 w-4 mr-1" /> Preview
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Posts</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Publish</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(postsQ.data ?? []).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">/{p.slug}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(p.published_at ?? p.created_at).toLocaleDateString()} · {readingMinutes(p.content ?? "")} min read
                      </div>
                    </TableCell>
                    <TableCell>{p.category ? <Badge variant="outline">{p.category}</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                    <TableCell><Badge variant={p.published ? "default" : "secondary"}>{p.published ? "Published" : "Draft"}</Badge></TableCell>
                    <TableCell><Switch checked={p.published} onCheckedChange={(v) => togglePub.mutate({ id: p.id, published: v })} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" asChild aria-label="View">
                          <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer"><Eye className="h-4 w-4" /></a>
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => startEdit(p)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Delete "${p.title}"? This cannot be undone.`)) deleteM.mutate(p.id);
                          }}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {postsQ.data && postsQ.data.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No posts yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}