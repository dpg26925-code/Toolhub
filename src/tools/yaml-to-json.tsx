import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function YamlToJsonTool() {
  const [yaml, setYaml] = useState("name: Nexatools\nfeatures:\n  - fast\n  - private\n  - free\nversion: 1.2");
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  const onFile = async (f: File | null) => { if (f) setYaml(await f.text()); };

  const convert = async () => {
    setError(null); setJson("");
    try {
      const jsYaml = await import("js-yaml");
      const parsed = jsYaml.load(yaml);
      setJson(JSON.stringify(parsed, null, indent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid YAML");
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
        <div><Label>Upload YAML</Label><Input type="file" accept=".yaml,.yml,text/yaml" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="mt-1"/></div>
        <div><Label>Indent</Label><Input type="number" min={0} max={8} value={indent} onChange={(e) => setIndent(Math.max(0, Math.min(8, +e.target.value)))} className="mt-1"/></div>
      </div>
      <div><Label>YAML</Label><Textarea rows={10} value={yaml} onChange={(e) => setYaml(e.target.value)} className="mt-1 font-mono text-xs"/></div>
      <Button onClick={convert}>Convert to JSON</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {json && (<>
        <Textarea rows={10} readOnly value={json} className="font-mono text-xs"/>
        <div className="flex gap-2"><Button onClick={download}>Download JSON</Button><Button variant="outline" onClick={() => { navigator.clipboard.writeText(json); toast.success("Copied"); }}>Copy</Button></div>
      </>)}
    </div>
  );
}