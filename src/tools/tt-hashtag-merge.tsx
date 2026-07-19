import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TtHashtagMerge() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const out = useMemo(() => {
    const merge = (s: string) => s.match(/#[\p{L}\p{N}_]+/gu) || [];
    const all = [...merge(a), ...merge(b), ...merge(c)].map((t) => t.toLowerCase());
    return Array.from(new Set(all)).join(" ");
  }, [a, b, c]);
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>List A</Label><Textarea value={a} onChange={(e) => setA(e.target.value)} className="mt-1 min-h-[120px]" /></div>
        <div><Label>List B</Label><Textarea value={b} onChange={(e) => setB(e.target.value)} className="mt-1 min-h-[120px]" /></div>
        <div><Label>List C</Label><Textarea value={c} onChange={(e) => setC(e.target.value)} className="mt-1 min-h-[120px]" /></div>
      </div>
      <Label>Merged & de-duplicated</Label>
      <Textarea readOnly value={out} className="min-h-[100px] bg-secondary/40" />
      <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}