import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function TomlToJsonTool() {
  const [toml, setToml] = useState('title = "Nexatools"\nversion = 1.2\n\n[owner]\nname = "Alex"\ndob = 1979-05-27T07:32:00Z');
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  const onFile = async (f: File | null) => { if (f) setToml(await f.text()); };

  const convert = async () => {
    setError(null); setJson("");
    try {
      const TOML = await import("@iarna/toml");
      const parsed = TOML.parse(toml);
      setJson(JSON.stringify(parsed, null, indent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid TOML");
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
        <div><Label>Upload TOML</Label><Input type="file" accept=".toml" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="mt-1"/></div>
        <div><Label>Indent</Label><Input type="number" min={0} max={8} value={indent} onChange={(e) => setIndent(Math.max(0, Math.min(8, +e.target.value)))} className="mt-1"/></div>
      </div>
      <div><Label>TOML</Label><Textarea rows={10} value={toml} onChange={(e) => setToml(e.target.value)} className="mt-1 font-mono text-xs"/></div>
      <Button onClick={convert}>Convert to JSON</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {json && (<>
        <Textarea rows={10} readOnly value={json} className="font-mono text-xs"/>
        <div className="flex gap-2"><Button onClick={download}>Download JSON</Button><Button variant="outline" onClick={() => { navigator.clipboard.writeText(json); toast.success("Copied"); }}>Copy</Button></div>
      </>)}
    </div>
  );
}