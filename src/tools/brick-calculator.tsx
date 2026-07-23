import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BRICKS: Record<string, { L: number; H: number; label: string }> = {
  standard: { L: 0.19, H: 0.09, label: "Standard 190×90mm" },
  us: { L: 0.194, H: 0.057, label: "US Modular 8×2.25in" },
  block: { L: 0.4, H: 0.2, label: "Concrete block 400×200mm" },
};

export default function Tool() {
  const [type, setType] = useState("standard");
  const [W, setW] = useState(5);
  const [H, setH] = useState(3);
  const [waste, setWaste] = useState(10);
  const [price, setPrice] = useState(0.5);

  const r = useMemo(() => {
    const b = BRICKS[type];
    const area = W * H;
    const per = 1 / ((b.L + 0.01) * (b.H + 0.01));
    const total = area * per;
    const withWaste = total * (1 + waste / 100);
    const mortar = area * 0.02; // m3 per m2
    return { area, total, withWaste, mortar, cost: withWaste * price };
  }, [type, W, H, waste, price]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2"><Label>Brick/block type</Label><Select value={type} onValueChange={setType}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(BRICKS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Wall width (m)</Label><Input type="number" step="0.1" value={W} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Wall height (m)</Label><Input type="number" step="0.1" value={H} onChange={(e) => setH(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Waste (%)</Label><Input type="number" value={waste} onChange={(e) => setWaste(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Price / unit ($)</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Wall area" value={`${r.area.toFixed(2)} m²`}/>
        <Stat label="Units needed" value={`${Math.ceil(r.withWaste).toLocaleString()}`} highlight/>
        <Stat label="Mortar" value={`${r.mortar.toFixed(2)} m³`}/>
        <Stat label="Cost" value={`$${r.cost.toFixed(0)}`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}