import { useState } from "react";
import { html as beautifyHtml } from "js-beautify";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function minifyHtml(src: string): string {
  return src
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/\n/g, "")
    .trim();
}

export default function HtmlBeautifierTool() {
  const [input, setInput] = useState('<!DOCTYPE html><html><head><title>Hello</title></head><body><div class="wrap"><h1>Hi</h1><p>Beautify me.</p></div></body></html>');
  const [beautified, setBeautified] = useState("");
  const [minified, setMinified] = useState("");
  const [indent, setIndent] = useState(2);

  const run = () => {
    const pretty = beautifyHtml(input, {
      indent_size: indent,
      indent_char: " ",
      wrap_line_length: 0,
      preserve_newlines: true,
      max_preserve_newlines: 1,
      end_with_newline: false,
    });
    setBeautified(pretty);
    setMinified(minifyHtml(input));
  };

  const onFile = async (f: File) => setInput(await f.text());

  const copy = async (t: string) => { await navigator.clipboard.writeText(t); toast.success("Copied"); };
  const download = (t: string, name: string) => {
    const blob = new Blob([t], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label>Upload HTML file (optional)</Label>
          <Input type="file" accept=".html,.htm,text/html" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="mt-1" />
        </div>
        <div>
          <Label>Indent size</Label>
          <Input type="number" min={1} max={8} value={indent} onChange={(e) => setIndent(Math.max(1, Math.min(8, Number(e.target.value) || 2)))} className="mt-1" />
        </div>
      </div>
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste HTML…" className="min-h-[180px] font-mono text-xs" />
      <div className="flex gap-2">
        <Button onClick={run}>Format HTML</Button>
      </div>
      {(beautified || minified) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Beautified</Label>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => copy(beautified)}>Copy</Button>
                <Button size="sm" variant="outline" onClick={() => download(beautified, "beautified.html")}>Download</Button>
              </div>
            </div>
            <Textarea readOnly value={beautified} className="min-h-[280px] font-mono text-xs" />
            <p className="text-xs text-muted-foreground">{beautified.length.toLocaleString()} characters</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Minified</Label>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => copy(minified)}>Copy</Button>
                <Button size="sm" variant="outline" onClick={() => download(minified, "minified.html")}>Download</Button>
              </div>
            </div>
            <Textarea readOnly value={minified} className="min-h-[280px] font-mono text-xs" />
            <p className="text-xs text-muted-foreground">
              {minified.length.toLocaleString()} characters
              {beautified && ` · saved ${Math.max(0, Math.round((1 - minified.length / beautified.length) * 100))}%`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}