import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { marked } from "marked";
import { toast } from "sonner";

const SAMPLE = `# Markdown Preview

Write **Markdown** and see the rendered HTML side by side.

## Features

- Headers, lists, tables, code blocks
- [Links](https://nexatools.cloud) and images
- GitHub-flavored extensions (tables, task lists)

> Blockquotes look nice too.

\`\`\`js
function hello(name) {
  return "Hello, " + name;
}
\`\`\`

| Column | Value |
| ------ | ----- |
| Speed  | Fast  |
| Cost   | Free  |
`;

export default function MarkdownPreview() {
  const [md, setMd] = useState(SAMPLE);
  const [gfm, setGfm] = useState(true);
  const [dark, setDark] = useState(false);

  const html = useMemo(() => {
    marked.setOptions({ gfm, breaks: true });
    return marked.parse(md) as string;
  }, [md, gfm]);

  const copy = async () => { await navigator.clipboard.writeText(html); toast.success("HTML copied"); };
  const download = () => {
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>Preview</title></head><body>${html}</body></html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "preview.html"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2"><Switch id="gfm" checked={gfm} onCheckedChange={setGfm} /><Label htmlFor="gfm">GitHub-flavored</Label></div>
        <div className="flex items-center gap-2"><Switch id="dark" checked={dark} onCheckedChange={setDark} /><Label htmlFor="dark">Dark preview</Label></div>
        <Button onClick={copy}>Copy HTML</Button>
        <Button variant="outline" onClick={download}>Download HTML</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Markdown</Label>
          <Textarea rows={20} value={md} onChange={(e) => setMd(e.target.value)} className="font-mono text-xs" />
        </div>
        <div>
          <Label>Preview</Label>
          <div
            className={`prose prose-sm max-w-none rounded-md border p-4 overflow-auto ${dark ? "bg-zinc-900 text-zinc-100 prose-invert" : "bg-background"}`}
            style={{ minHeight: "20rem" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}