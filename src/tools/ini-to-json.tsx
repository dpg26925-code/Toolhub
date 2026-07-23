import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function parseIni(text: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  let section: Record<string, unknown> = out;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith(";") || line.startsWith("#")) continue;
    const sec = line.match(/^\[([^\]]+)\]$/);
    if (sec) {
      const name = sec[1];
      section = {};
      out[name] = section;
      continue;
    }
    const kv = line.match(/^([^=:]+)[=:](.*)$/);
    if (kv) {
      const k = kv[1].trim();
      let v: unknown = kv[2].trim().replace(/^["'](.*)["']$/, "$1");
      if (v === "true") v = true;
      else if (v === "false") v = false;
      else if (v !== "" && !isNaN(Number(v))) v = Number(v);
      section[k] = v;
    }
  }
  return out;
}

export default function IniToJsonTool() {
  const [ini, setIni] = useState("; Nexatools example config\n[server]\nhost = localhost\nport = 8080\n\n[db]\nurl = postgres://user:pw@localhost/db\npool = 5\ndebug = true");
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  const onFile = async (f: File | null) => { if (f) setIni(await f.text()); };

  const convert = () => {
    setError(null); setJson("");
    try {
      setJson(JSON.stringify(parseIni(ini), null, indent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Upload INI</Label><Input type="file" accept=".ini,.cfg,.conf,text/plain" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="mt-1"/></div>
        <div><Label>Indent</Label><Input type="number" min={0} max={8} value={indent} onChange={(e) => setIndent(Math.max(0, Math.min(8, +e.target.value)))} className="mt-1"/></div>
      </div>
      <div><Label>INI</Label><Textarea rows={10} value={ini} onChange={(e) => setIni(e.target.value)} className="mt-1 font-mono text-xs"/></div>
      <Button onClick={convert}>Convert to JSON</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {json && (<>
        <Textarea rows={10} readOnly value={json} className="font-mono text-xs"/>
        <div className="flex gap-2"><Button onClick={download}>Download JSON</Button><Button variant="outline" onClick={() => { navigator.clipboard.writeText(json); toast.success("Copied"); }}>Copy</Button></div>
      </>)}
    </div>
  );
}