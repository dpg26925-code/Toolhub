import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function HtmlToMarkdownTool() {
  const [html, setHtml] = useState("<h1>Hello</h1>\n<p>This is <strong>Nexatools</strong>. Try <a href=\"https://nexatools.cloud\">our tools</a>.</p>\n<ul><li>Fast</li><li>Private</li></ul>");
  const [md, setMd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onFile = async (f: File | null) => { if (f) setHtml(await f.text()); };

  const convert = async () => {
    setError(null); setMd("");
    try {
      const Turndown = (await import("turndown")).default;
      const td = new Turndown({ headingStyle: "atx", codeBlockStyle: "fenced" });
      setMd(td.turndown(html));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const download = () => {
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.md"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div><Label>Upload HTML</Label><Input type="file" accept=".html,.htm,text/html" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="mt-1"/></div>
      <div><Label>HTML</Label><Textarea rows={10} value={html} onChange={(e) => setHtml(e.target.value)} className="mt-1 font-mono text-xs"/></div>
      <Button onClick={convert}>Convert to Markdown</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {md && (<>
        <Textarea rows={10} readOnly value={md} className="font-mono text-xs"/>
        <div className="flex gap-2"><Button onClick={download}>Download .md</Button><Button variant="outline" onClick={() => { navigator.clipboard.writeText(md); toast.success("Copied"); }}>Copy</Button></div>
      </>)}
    </div>
  );
}