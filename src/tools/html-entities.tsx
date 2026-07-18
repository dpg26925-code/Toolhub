import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

function encode(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] as string))
    .replace(/[\u00A0-\u9999]/g, (c) => `&#${c.charCodeAt(0)};`);
}

function decode(s: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = s;
  return el.value;
}

export default function HtmlEntitiesTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const run = () => {
    try {
      setOutput(mode === "encode" ? encode(input) : decode(input));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}>
        <TabsList>
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>
      </Tabs>
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "encode" ? "<div>Hello & welcome</div>" : "&lt;div&gt;Hello &amp; welcome&lt;/div&gt;"} className="min-h-[180px] font-mono text-sm" />
      <div className="flex gap-2">
        <Button onClick={run}>{mode === "encode" ? "Encode" : "Decode"}</Button>
        {output && <Button variant="outline" onClick={copy}>Copy</Button>}
      </div>
      {output && <Textarea readOnly value={output} className="min-h-[180px] font-mono text-sm" />}
    </div>
  );
}