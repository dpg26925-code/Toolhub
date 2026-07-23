import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UNITS: Record<string, number> = { cm: 0.01, m: 1, inch: 0.0254, ft: 0.3048 };

export default function Tool() {
  const [unit, setUnit] = useState("cm");
  const [l, setL] = useState(40);
  const [w, setW] = useState(30);
  const [h, setH] = useState(25);
  const [qty, setQty] = useState(100);
  const [density, setDensity] = useState(200);

  const r = useMemo(() => {
    const f = UNITS[unit];
    const perCbm = l * w * h * f * f * f;
    const total = perCbm * qty;
    const weight = total * density;
    const twentyFt = Math.floor(28 / total);
    const fortyFt = Math.floor(58 / total);
    return { perCbm, total, weight, twentyFt, fortyFt };
  }, [unit, l, w, h, qty, density]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-5">
        <div><Label>Unit</Label><Select value={unit} onValueChange={setUnit}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{Object.keys(UNITS).map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Length</Label><Input type="number" value={l} onChange={(e) => setL(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Width</Label><Input type="number" value={w} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Height</Label><Input type="number" value={h} onChange={(e) => setH(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Quantity</Label><Input type="number" value={qty} onChange={(e) => setQty(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div><Label>Est. density (kg/m³)</Label><Input type="number" value={density} onChange={(e) => setDensity(+e.target.value || 0)} className="mt-1 max-w-xs"/></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="CBM per carton" value={`${r.perCbm.toFixed(4)} m³`}/>
        <Stat label="Total CBM" value={`${r.total.toFixed(3)} m³`} highlight/>
        <Stat label="Est. weight" value={`${r.weight.toFixed(0)} kg`}/>
        <Stat label="Fits in 20ft container" value={`~${r.twentyFt.toLocaleString()} × qty`}/>
        <Stat label="Fits in 40ft container" value={`~${r.fortyFt.toLocaleString()} × qty`}/>
      </div>
      <div className="rounded-lg border p-3">
        <div className="text-xs text-muted-foreground mb-2">Visualization (relative scale)</div>
        <div className="mx-auto flex h-32 w-full items-end justify-center gap-1">
          {Array.from({ length: Math.min(qty, 20) }).map((_, i) => <div key={i} className="w-3 rounded-t bg-primary" style={{ height: `${Math.max(20, r.perCbm * 500)}%` }}/>)}
        </div>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}