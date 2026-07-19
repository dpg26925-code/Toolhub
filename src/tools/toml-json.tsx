import { useState } from "react";
import TOML from "@iarna/toml";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function TomlJsonTool() {
  const [toml, setToml] = useState('title = "Nexatools"\n\n[owner]\nname = "Alice"');
  const [json, setJson] = useState('{\n  "title": "Nexatools",\n  "owner": { "name": "Alice" }\n}');
  const [out, setOut] = useState("");

  const t2j = () => { try { setOut(JSON.stringify(TOML.parse(toml), null, 2)); } catch (e) { toast.error(e instanceof Error ? e.message : "Invalid TOML"); } };
  const j2t = () => { try { setOut(TOML.stringify(JSON.parse(json))); } catch (e) { toast.error(e instanceof Error ? e.message : "Invalid JSON"); } };
  const copy = async () => { await navigator.clipboard.writeText(out); toast.success("Copied"); };

  return (
    <Tabs defaultValue="t2j" onValueChange={() => setOut("")}>
      <TabsList>
        <TabsTrigger value="t2j">TOML → JSON</TabsTrigger>
        <TabsTrigger value="j2t">JSON → TOML</TabsTrigger>
      </TabsList>
      <TabsContent value="t2j" className="space-y-3">
        <Textarea value={toml} onChange={(e) => setToml(e.target.value)} className="min-h-[200px] font-mono text-sm" />
        <div className="flex gap-2"><Button onClick={t2j}>Convert</Button>{out && <Button variant="outline" onClick={copy}>Copy</Button>}</div>
        {out && <Textarea readOnly value={out} className="min-h-[200px] font-mono text-sm" />}
      </TabsContent>
      <TabsContent value="j2t" className="space-y-3">
        <Textarea value={json} onChange={(e) => setJson(e.target.value)} className="min-h-[200px] font-mono text-sm" />
        <div className="flex gap-2"><Button onClick={j2t}>Convert</Button>{out && <Button variant="outline" onClick={copy}>Copy</Button>}</div>
        {out && <Textarea readOnly value={out} className="min-h-[200px] font-mono text-sm" />}
      </TabsContent>
    </Tabs>
  );
}