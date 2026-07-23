import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const NAMED: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const NAMED_REV: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", copy: "©", reg: "®", trade: "™", hellip: "…", mdash: "—", ndash: "–", laquo: "«", raquo: "»" };

function encode(s: string, minimal: boolean, numeric: boolean) {
  let out = "";
  for (const ch of s) {
    if (ch in NAMED) { out += numeric ? `&#${ch.charCodeAt(0)};` : NAMED[ch]; continue; }
    const cp = ch.codePointAt(0)!;
    if (minimal || cp < 128) { out += ch; continue; }
    out += `&#${cp};`;
  }
  return out;
}
function decode(s: string) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]+);/g, (m, n) => NAMED_REV[n] ?? m);
}

export default function HtmlEntityEncoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState('<div class="hi">Café & Co. — "hello"</div>');
  const [minimal, setMinimal] = useState(true);
  const [numeric, setNumeric] = useState(false);

  const output = useMemo(() => {
    try { return mode === "encode" ? encode(input, minimal, numeric) : decode(input); }
    catch { return ""; }
  }, [input, mode, minimal, numeric]);

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}>
        <TabsList><TabsTrigger value="encode">Encode</TabsTrigger><TabsTrigger value="decode">Decode</TabsTrigger></TabsList>
      </Tabs>
      {mode === "encode" && (
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2"><Switch checked={minimal} onCheckedChange={setMinimal} /><Label>Only encode {"<>&\"'"}</Label></div>
          <div className="flex items-center gap-2"><Switch checked={numeric} onCheckedChange={setNumeric} /><Label>Numeric entities (&amp;#NN;)</Label></div>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Input</Label><Textarea rows={10} className="mt-1 font-mono text-sm" value={input} onChange={(e) => setInput(e.target.value)} /></div>
        <div><Label>Output</Label><Textarea rows={10} className="mt-1 font-mono text-sm" value={output} readOnly /></div>
      </div>
      <Button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }} disabled={!output}>Copy output</Button>
    </div>
  );
}