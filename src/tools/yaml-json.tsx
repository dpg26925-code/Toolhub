import { useState } from "react";
import * as yaml from "js-yaml";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function YamlJsonTool() {
  const [yamlIn, setYamlIn] = useState("name: Nexatools\nversion: 1\nfeatures:\n  - fast\n  - free");
  const [jsonIn, setJsonIn] = useState('{\n  "name": "Nexatools",\n  "version": 1\n}');
  const [out, setOut] = useState("");

  const y2j = () => {
    try { setOut(JSON.stringify(yaml.load(yamlIn), null, 2)); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Invalid YAML"); }
  };
  const j2y = () => {
    try { setOut(yaml.dump(JSON.parse(jsonIn))); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Invalid JSON"); }
  };
  const copy = async () => { await navigator.clipboard.writeText(out); toast.success("Copied"); };

  return (
    <Tabs defaultValue="y2j" onValueChange={() => setOut("")}>
      <TabsList>
        <TabsTrigger value="y2j">YAML → JSON</TabsTrigger>
        <TabsTrigger value="j2y">JSON → YAML</TabsTrigger>
      </TabsList>
      <TabsContent value="y2j" className="space-y-3">
        <Textarea value={yamlIn} onChange={(e) => setYamlIn(e.target.value)} className="min-h-[200px] font-mono text-sm" />
        <div className="flex gap-2"><Button onClick={y2j}>Convert</Button>{out && <Button variant="outline" onClick={copy}>Copy</Button>}</div>
        {out && <Textarea readOnly value={out} className="min-h-[200px] font-mono text-sm" />}
      </TabsContent>
      <TabsContent value="j2y" className="space-y-3">
        <Textarea value={jsonIn} onChange={(e) => setJsonIn(e.target.value)} className="min-h-[200px] font-mono text-sm" />
        <div className="flex gap-2"><Button onClick={j2y}>Convert</Button>{out && <Button variant="outline" onClick={copy}>Copy</Button>}</div>
        {out && <Textarea readOnly value={out} className="min-h-[200px] font-mono text-sm" />}
      </TabsContent>
    </Tabs>
  );
}