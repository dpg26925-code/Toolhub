import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Mode = "spaces" | "newlines" | "tabs" | "all";

export default function WhitespaceRemoverTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("spaces");

  const run = () => {
    let out = input;
    if (mode === "spaces") out = out.replace(/ {2,}/g, " ").replace(/[ \t]+$/gm, "");
    else if (mode === "newlines") out = out.replace(/\n{2,}/g, "\n");
    else if (mode === "tabs") out = out.replace(/\t+/g, " ");
    else if (mode === "all") out = out.replace(/\s+/g, " ").trim();
    setOutput(out);
  };

  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };

  const modes: { id: Mode; label: string }[] = [
    { id: "spaces", label: "Extra spaces" },
    { id: "newlines", label: "Extra newlines" },
    { id: "tabs", label: "Tabs → space" },
    { id: "all", label: "Compact all whitespace" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <Button key={m.id} size="sm" variant={mode === m.id ? "default" : "outline"} onClick={() => setMode(m.id)}>{m.label}</Button>
        ))}
      </div>
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text…" className="min-h-[200px] font-mono text-sm" />
      <div className="flex gap-2">
        <Button onClick={run}>Clean</Button>
        {output && <Button variant="outline" onClick={copy}>Copy</Button>}
      </div>
      {output && <Textarea readOnly value={output} className="min-h-[200px] font-mono text-sm" />}
    </div>
  );
}