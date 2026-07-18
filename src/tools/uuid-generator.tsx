import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { v4 as uuidv4, v5 as uuidv5 } from "uuid";
import { toast } from "sonner";

const NAMESPACES: Record<string, string> = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
};

export default function UuidGeneratorTool() {
  const [version, setVersion] = useState<"v4" | "v5">("v4");
  const [count, setCount] = useState(10);
  const [output, setOutput] = useState("");
  const [namespace, setNamespace] = useState(NAMESPACES.DNS);
  const [name, setName] = useState("example.com");

  const generate = () => {
    try {
      const ids: string[] = [];
      for (let i = 0; i < count; i++) {
        ids.push(version === "v4" ? uuidv4() : uuidv5(count > 1 ? `${name}-${i}` : name, namespace));
      }
      setOutput(ids.join("\n"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    }
  };

  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };

  return (
    <div className="space-y-6">
      <Tabs value={version} onValueChange={(v) => setVersion(v as "v4" | "v5")}>
        <TabsList>
          <TabsTrigger value="v4">UUID v4 (random)</TabsTrigger>
          <TabsTrigger value="v5">UUID v5 (name-based)</TabsTrigger>
        </TabsList>
        <TabsContent value="v5" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Namespace UUID</Label>
              <Input value={namespace} onChange={(e) => setNamespace(e.target.value)} className="mt-1 font-mono text-xs" />
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(NAMESPACES).map(([k, v]) => (
                  <Button key={k} type="button" size="sm" variant="outline" onClick={() => setNamespace(v)}>{k}</Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div>
        <Label>Count: {count}</Label>
        <Slider value={[count]} min={1} max={500} step={1} onValueChange={([v]) => setCount(v)} className="mt-2" />
      </div>

      <div className="flex gap-2">
        <Button onClick={generate}>Generate</Button>
        {output && <Button variant="outline" onClick={copy}>Copy all</Button>}
      </div>
      {output && <Textarea readOnly value={output} className="min-h-[280px] font-mono text-sm" />}
    </div>
  );
}