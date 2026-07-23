import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function minifyCss(css: string, opts: { removeComments: boolean; removeWhitespace: boolean; shortenHex: boolean }) {
  let out = css;
  if (opts.removeComments) out = out.replace(/\/\*[\s\S]*?\*\//g, "");
  if (opts.removeWhitespace) {
    out = out.replace(/\s+/g, " ")
      .replace(/ ?([{}:;,>+~]) ?/g, "$1")
      .replace(/;}/g, "}")
      .trim();
  }
  if (opts.shortenHex) {
    out = out.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, "#$1$2$3");
  }
  return out;
}

export default function CssMinifier() {
  const [code, setCode] = useState(".btn {\n  /* primary */\n  color: #ffffff;\n  background: #3366cc;\n  padding: 8px 16px;\n}\n");
  const [rc, setRc] = useState(true);
  const [rw, setRw] = useState(true);
  const [sh, setSh] = useState(true);

  const output = useMemo(() => minifyCss(code, { removeComments: rc, removeWhitespace: rw, shortenHex: sh }), [code, rc, rw, sh]);

  const before = new Blob([code]).size;
  const after = new Blob([output]).size;
  const saved = before ? Math.round((1 - after / before) * 100) : 0;

  const onFile = async (f: File | null) => { if (f) setCode(await f.text()); };
  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };
  const download = () => {
    const blob = new Blob([output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "styles.min.css"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>Source CSS</Label>
            <Input type="file" accept=".css,text/css" className="h-8 w-auto" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </div>
          <Textarea rows={16} value={code} onChange={(e) => setCode(e.target.value)} className="font-mono text-xs" />
        </div>
        <div>
          <Label>Minified output</Label>
          <Textarea rows={16} value={output} readOnly className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground mt-1">Original: {before}B · Minified: {after}B · Saved {saved}%</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2"><Switch id="rc" checked={rc} onCheckedChange={setRc} /><Label htmlFor="rc">Remove comments</Label></div>
        <div className="flex items-center gap-2"><Switch id="rw" checked={rw} onCheckedChange={setRw} /><Label htmlFor="rw">Remove whitespace</Label></div>
        <div className="flex items-center gap-2"><Switch id="sh" checked={sh} onCheckedChange={setSh} /><Label htmlFor="sh">Shorten hex values</Label></div>
        <Button onClick={copy} disabled={!output}>Copy</Button>
        <Button variant="outline" onClick={download} disabled={!output}>Download .min.css</Button>
      </div>
    </div>
  );
}