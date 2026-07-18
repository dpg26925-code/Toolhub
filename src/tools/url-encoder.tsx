import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function UrlEncoderTool() {
  const [input, setInput] = useState("https://example.com/search?q=hello world&lang=vi");
  const [output, setOutput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const run = (fn: (s: string) => string) => {
    try {
      setOutput(fn(input));
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Input</label>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[200px] font-mono text-xs" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Output</label>
          <Textarea value={output} readOnly className="min-h-[200px] font-mono text-xs" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => run(encodeURIComponent)}>Encode component</Button>
        <Button variant="secondary" onClick={() => run(encodeURI)}>Encode URI</Button>
        <Button variant="outline" onClick={() => run(decodeURIComponent)}>Decode</Button>
        <Button variant="ghost" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }} disabled={!output}>Copy</Button>
      </div>
      {err && <p className="text-sm text-destructive">Error: {err}</p>}
    </div>
  );
}