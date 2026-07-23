import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function DuplicateLineRemoverTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trim, setTrim] = useState(true);
  const [sort, setSort] = useState(false);
  const [removed, setRemoved] = useState<number | null>(null);

  const run = () => {
    const lines = input.split("\n");
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of lines) {
      const line = trim ? raw.trim() : raw;
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push(line); }
    }
    if (sort) out.sort((a, b) => a.localeCompare(b));
    setOutput(out.join("\n"));
    setRemoved(lines.length - out.length);
  };

  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };

  return (
    <div className="space-y-4">
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste lines here…" className="min-h-[200px] font-mono text-sm" />
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2"><Switch id="cs" checked={caseSensitive} onCheckedChange={setCaseSensitive} /><Label htmlFor="cs">Case sensitive</Label></div>
        <div className="flex items-center gap-2"><Switch id="tr" checked={trim} onCheckedChange={setTrim} /><Label htmlFor="tr">Trim whitespace</Label></div>
        <div className="flex items-center gap-2"><Switch id="so" checked={sort} onCheckedChange={setSort} /><Label htmlFor="so">Sort A→Z</Label></div>
      </div>
      <div className="flex gap-2">
        <Button onClick={run}>Remove duplicates</Button>
        {output && <Button variant="outline" onClick={copy}>Copy</Button>}
      </div>
      {removed !== null && <p className="text-sm text-muted-foreground">Removed <span className="font-semibold text-foreground">{removed}</span> duplicate line{removed === 1 ? "" : "s"}.</p>}
      {output && <Textarea readOnly value={output} className="min-h-[200px] font-mono text-sm" />}
    </div>
  );
}