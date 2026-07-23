import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Mode = "chars" | "words" | "lines";

export default function TextReverserTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("chars");

  const run = () => {
    if (mode === "chars") setOutput(Array.from(input).reverse().join(""));
    else if (mode === "words") setOutput(input.split(/(\s+)/).reverse().join(""));
    else setOutput(input.split("\n").reverse().join("\n"));
  };

  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };

  const modes: { id: Mode; label: string }[] = [
    { id: "chars", label: "Reverse characters" },
    { id: "words", label: "Reverse word order" },
    { id: "lines", label: "Reverse line order" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <Button key={m.id} size="sm" variant={mode === m.id ? "default" : "outline"} onClick={() => setMode(m.id)}>{m.label}</Button>
        ))}
      </div>
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or paste text…" className="min-h-[180px] font-mono text-sm" />
      <div className="flex gap-2">
        <Button onClick={run}>Reverse</Button>
        {output && <Button variant="outline" onClick={copy}>Copy</Button>}
      </div>
      {output && <Textarea readOnly value={output} className="min-h-[180px] font-mono text-sm" />}
    </div>
  );
}