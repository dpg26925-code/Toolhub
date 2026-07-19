import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TtHashtagSplit() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(10);
  const groups = useMemo(() => {
    const tags = text.match(/#[\p{L}\p{N}_]+/gu) || [];
    const out: string[][] = [];
    for (let i = 0; i < tags.length; i += size) out.push(tags.slice(i, i + size));
    return out;
  }, [text, size]);
  return (
    <div className="space-y-3">
      <Label>Hashtags</Label>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[140px]" />
      <div className="flex items-center gap-3">
        <Label className="whitespace-nowrap">Group size</Label>
        <Input type="number" min={1} max={100} value={size} onChange={(e) => setSize(Math.max(1, Number(e.target.value) || 1))} className="w-24" />
      </div>
      <div className="space-y-2">
        {groups.map((g, i) => (
          <div key={i} className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Group {i + 1} · {g.length} tags</span>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(g.join(" ")); toast.success("Copied"); }}>Copy</Button>
            </div>
            <div className="text-sm break-words">{g.join(" ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}