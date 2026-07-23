import { useState } from "react";
import * as yaml from "js-yaml";
import TOML from "@iarna/toml";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const SAMPLE = `title: Nexatools
owner:
  name: Alice
  joined: 2025-01-01
ports:
  - 80
  - 443
enabled: true
`;

export default function YamlToToml() {
  const [src, setSrc] = useState(SAMPLE);
  const [out, setOut] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const convert = () => {
    try {
      const data = yaml.load(src);
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Root must be a YAML mapping");
      setOut(TOML.stringify(data as unknown as Record<string, TOML.AnyJson>));
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid YAML");
      setOut("");
    }
  };

  const onFile = async (f: File | null) => { if (f) setSrc(await f.text()); };
  const copy = async () => { await navigator.clipboard.writeText(out); toast.success("Copied"); };
  const download = () => {
    const blob = new Blob([out], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "config.toml"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>YAML</Label>
            <Input type="file" accept=".yaml,.yml,text/yaml" className="h-8 w-auto" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </div>
          <Textarea rows={16} value={src} onChange={(e) => setSrc(e.target.value)} className="font-mono text-xs" />
          {err && <p className="text-xs text-destructive mt-1">{err}</p>}
        </div>
        <div>
          <Label>TOML</Label>
          <Textarea rows={16} value={out} readOnly className="font-mono text-xs" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={convert}>Convert to TOML</Button>
        <Button variant="outline" onClick={copy} disabled={!out}>Copy</Button>
        <Button variant="outline" onClick={download} disabled={!out}>Download .toml</Button>
      </div>
    </div>
  );
}