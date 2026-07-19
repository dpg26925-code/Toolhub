import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

function mdToHtml(md: string): string {
  let s = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  s = s.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c.trim()}</code></pre>`);
  s = s.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  s = s.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  s = s.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  s = s.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  s = s.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  s = s.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  s = s.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/^(?:- |\* )(.+)$/gm, "<li>$1</li>");
  s = s.replace(/(<li>[\s\S]+?<\/li>)/g, (m) => `<ul>${m}</ul>`);
  s = s.split(/\n{2,}/).map((p) => (/^<(h\d|ul|pre|blockquote)/.test(p.trim()) ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`)).join("\n\n");
  return s;
}

function htmlToMd(html: string): string {
  let s = html;
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, c) => `${"#".repeat(+n)} ${c.trim()}\n\n`);
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  s = s.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
  s = s.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  s = s.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*\/?>/gi, "![$1]($2)");
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  s = s.replace(/<\/?(ul|ol|p|div)[^>]*>/gi, "\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

export default function MarkdownHtmlTool() {
  const [md, setMd] = useState("# Hello\n\nThis is **markdown**.\n\n- Item 1\n- Item 2");
  const [html, setHtml] = useState("");
  const preview = useMemo(() => mdToHtml(md), [md]);
  const copy = async (text: string) => { await navigator.clipboard.writeText(text); toast.success("Copied"); };

  return (
    <Tabs defaultValue="md2html">
      <TabsList>
        <TabsTrigger value="md2html">Markdown → HTML</TabsTrigger>
        <TabsTrigger value="html2md">HTML → Markdown</TabsTrigger>
      </TabsList>
      <TabsContent value="md2html" className="space-y-3">
        <Textarea value={md} onChange={(e) => setMd(e.target.value)} className="min-h-[200px] font-mono text-sm" />
        <div className="flex gap-2"><Button onClick={() => copy(preview)}>Copy HTML</Button></div>
        <Textarea readOnly value={preview} className="min-h-[160px] font-mono text-sm" />
        <div className="rounded-xl border border-border bg-background p-4 text-sm prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: preview }} />
      </TabsContent>
      <TabsContent value="html2md" className="space-y-3">
        <Textarea value={html} onChange={(e) => setHtml(e.target.value)} placeholder="<h1>Hello</h1>..." className="min-h-[200px] font-mono text-sm" />
        <div className="flex gap-2"><Button onClick={() => copy(htmlToMd(html))}>Copy Markdown</Button></div>
        <Textarea readOnly value={htmlToMd(html)} className="min-h-[160px] font-mono text-sm" />
      </TabsContent>
    </Tabs>
  );
}