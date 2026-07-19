import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const SAMPLE_JSON = '{"hello":"world","list":[1,2,3]}';

function getJsonError(input: string, message: string) {
  const match = /position\s+(\d+)/i.exec(message);
  if (!match) return message;

  const pos = Number(match[1]);
  const upto = input.slice(0, pos);
  const line = upto.split("\n").length;
  const col = pos - upto.lastIndexOf("\n");
  return `${message} (line ${line}, column ${col})`;
}

function transformJson(value: string, space: number | 0) {
  return JSON.stringify(JSON.parse(value), null, space);
}

export default function JsonFormatterTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState(() => transformJson(SAMPLE_JSON, 2));
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  const format = (space: number | 0) => {
    try {
      setOutput(transformJson(input, space));
      setError(null);
    } catch (e) {
      const msg = (e as Error).message;
      setError(getJsonError(input, msg));
      setOutput("");
    }
  };

  const updateInput = (value: string) => {
    setInput(value);
    if (!value.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      setOutput(transformJson(value, indent));
      setError(null);
    } catch (e) {
      setOutput("");
      setError(getJsonError(value, (e as Error).message));
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied");
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Input JSON</label>
          <Textarea value={input} onChange={(e) => updateInput(e.target.value)} className="min-h-[280px] font-mono text-xs" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Output</label>
          <Textarea value={output} readOnly placeholder="Formatted JSON will appear here" className="min-h-[280px] font-mono text-xs" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm">Indent</label>
        <Input
          type="number"
          min={0}
          max={8}
          value={indent}
          onChange={(e) => {
            const next = Number(e.target.value);
            setIndent(next);
            if (input.trim()) {
              try {
                setOutput(transformJson(input, next));
                setError(null);
              } catch {
                // Keep the existing validation message from the input editor.
              }
            }
          }}
          className="w-20"
        />
        <Button onClick={() => format(indent)}>Beautify</Button>
        <Button variant="secondary" onClick={() => format(0)}>Minify</Button>
        <Button variant="ghost" onClick={copyOutput} disabled={!output}>Copy</Button>
        <Button variant="ghost" onClick={download} disabled={!output}>Download .json</Button>
      </div>
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <span className="font-medium">Invalid JSON:</span> {error}
        </div>
      )}
    </div>
  );
}