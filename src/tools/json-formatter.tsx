import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function JsonFormatterTool() {
  const [input, setInput] = useState('{"hello":"world","list":[1,2,3]}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  const format = (space: number | 0) => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, space));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Input JSON</label>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[280px] font-mono text-xs" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Output</label>
          <Textarea value={output} readOnly className="min-h-[280px] font-mono text-xs" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm">Indent</label>
        <Input type="number" min={0} max={8} value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="w-20" />
        <Button onClick={() => format(indent)}>Beautify</Button>
        <Button variant="secondary" onClick={() => format(0)}>Minify</Button>
        <Button variant="ghost" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }} disabled={!output}>Copy</Button>
      </div>
      {error && <p className="text-sm text-destructive">Invalid JSON: {error}</p>}
    </div>
  );
}