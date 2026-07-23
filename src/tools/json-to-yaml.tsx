import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function JsonToYamlTool() {
  const [json, setJson] = useState('{\n  "name": "Nexatools",\n  "features": ["fast", "private", "free"],\n  "version": 1.2\n}');
  const [yaml, setYaml] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onFile = async (f: File | null) => { if (f) setJson(await f.text()); };

  const convert = async () => {
    setError(null); setYaml("");
    try {
      const parsed = JSON.parse(json);
      const jsYaml = await import("js-yaml");
      setYaml(jsYaml.dump(parsed, { indent: 2, lineWidth: 120 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const download = () => {
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.yaml"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div><Label>Upload JSON</Label><Input type="file" accept=".json,application/json" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="mt-1"/></div>
      <div><Label>JSON</Label><Textarea rows={10} value={json} onChange={(e) => setJson(e.target.value)} className="mt-1 font-mono text-xs"/></div>
      <Button onClick={convert}>Convert to YAML</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {yaml && (<>
        <Textarea rows={10} readOnly value={yaml} className="font-mono text-xs"/>
        <div className="flex gap-2"><Button onClick={download}>Download YAML</Button><Button variant="outline" onClick={() => { navigator.clipboard.writeText(yaml); toast.success("Copied"); }}>Copy</Button></div>
      </>)}
    </div>
  );
}