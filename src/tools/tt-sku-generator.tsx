import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function TtSkuGenerator() {
  const [prefix, setPrefix] = useState("TT");
  const [category, setCategory] = useState("SKN");
  const [colors, setColors] = useState("BLK,WHT,RED");
  const [sizes, setSizes] = useState("S,M,L,XL");
  const [pad, setPad] = useState(3);
  const skus = useMemo(() => {
    const cs = colors.split(",").map((c) => c.trim()).filter(Boolean);
    const ss = sizes.split(",").map((s) => s.trim()).filter(Boolean);
    const out: string[] = []; let n = 1;
    for (const c of cs) for (const s of ss) out.push(`${prefix}-${category}-${c}-${s}-${String(n++).padStart(pad, "0")}`);
    return out;
  }, [prefix, category, colors, sizes, pad]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-5">
        <div><Label>Prefix</Label><Input value={prefix} onChange={(e) => setPrefix(e.target.value.toUpperCase())} className="mt-1" /></div>
        <div><Label>Category code</Label><Input value={category} onChange={(e) => setCategory(e.target.value.toUpperCase())} className="mt-1" /></div>
        <div className="sm:col-span-2"><Label>Colors (comma sep)</Label><Input value={colors} onChange={(e) => setColors(e.target.value)} className="mt-1" /></div>
        <div><Label>Pad digits</Label><Input type="number" min={1} max={6} value={pad} onChange={(e) => setPad(+e.target.value || 3)} className="mt-1" /></div>
        <div className="sm:col-span-5"><Label>Sizes (comma sep)</Label><Input value={sizes} onChange={(e) => setSizes(e.target.value)} className="mt-1" /></div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{skus.length} SKUs generated</p>
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(skus.join("\n")); toast.success("Copied"); }}>Copy all</Button>
      </div>
      <Textarea readOnly value={skus.join("\n")} className="min-h-[220px] font-mono text-xs bg-secondary/40" />
    </div>
  );
}