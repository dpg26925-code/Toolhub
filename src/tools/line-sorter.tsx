import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LineSorterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [dedupe, setDedupe] = useState(false);
  const [trim, setTrim] = useState(true);
  const [natural, setNatural] = useState(true);

  const run = () => {
    let lines = input.split("\n");
    if (trim) lines = lines.map((l) => l.trim());
    if (dedupe) lines = Array.from(new Set(lines));
    const cmp = natural
      ? (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
      : (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
    lines.sort(cmp);
    if (dir === "desc") lines.reverse();
    setOutput(lines.join("\n"));
  };

  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };

  return (
    <div className="space-y-4">
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste lines to sort…" className="min-h-[200px] font-mono text-sm" />
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={dir === "asc" ? "default" : "outline"} onClick={() => setDir("asc")}>A → Z</Button>
          <Button size="sm" variant={dir === "desc" ? "default" : "outline"} onClick={() => setDir("desc")}>Z → A</Button>
        </div>
        <div className="flex items-center gap-2"><Switch id="nat" checked={natural} onCheckedChange={setNatural} /><Label htmlFor="nat">Natural sort (item2 before item10)</Label></div>
        <div className="flex items-center gap-2"><Switch id="dd" checked={dedupe} onCheckedChange={setDedupe} /><Label htmlFor="dd">Remove duplicates</Label></div>
        <div className="flex items-center gap-2"><Switch id="tr" checked={trim} onCheckedChange={setTrim} /><Label htmlFor="tr">Trim lines</Label></div>
      </div>
      <div className="flex gap-2">
        <Button onClick={run}>Sort lines</Button>
        {output && <Button variant="outline" onClick={copy}>Copy</Button>}
      </div>
      {output && <Textarea readOnly value={output} className="min-h-[200px] font-mono text-sm" />}
    </div>
  );
}