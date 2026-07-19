import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Mode = "az" | "za" | "short" | "long";

export default function TtHashtagSort() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("az");
  const out = useMemo(() => {
    const tags = Array.from(new Set((text.match(/#[\p{L}\p{N}_]+/gu) || []).map((t) => t.toLowerCase())));
    const sorted = [...tags];
    if (mode === "az") sorted.sort();
    if (mode === "za") sorted.sort().reverse();
    if (mode === "short") sorted.sort((a, b) => a.length - b.length);
    if (mode === "long") sorted.sort((a, b) => b.length - a.length);
    return sorted.join(" ");
  }, [text, mode]);
  return (
    <div className="space-y-3">
      <Label>Hashtags</Label>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[140px]" />
      <div className="flex flex-wrap gap-2">
        {(["az", "za", "short", "long"] as Mode[]).map((m) => (
          <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)}>
            {m === "az" ? "A → Z" : m === "za" ? "Z → A" : m === "short" ? "Shortest first" : "Longest first"}
          </Button>
        ))}
      </div>
      <Label>Sorted</Label>
      <Textarea readOnly value={out} className="min-h-[100px] bg-secondary/40" />
      <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}