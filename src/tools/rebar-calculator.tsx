import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [L, setL] = useState(5);
  const [W, setW] = useState(4);
  const [spacing, setSpacing] = useState(0.2);
  const [barPrice, setBarPrice] = useState(15);
  const [barLen, setBarLen] = useState(6);

  const r = useMemo(() => {
    const long = Math.ceil(W / spacing) + 1;
    const trans = Math.ceil(L / spacing) + 1;
    const totalM = long * L + trans * W;
    const bars = Math.ceil(totalM / barLen);
    return { long, trans, totalM, bars, cost: bars * barPrice };
  }, [L, W, spacing, barPrice, barLen]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Slab length (m)</Label><Input type="number" step="0.1" value={L} onChange={(e) => setL(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Slab width (m)</Label><Input type="number" step="0.1" value={W} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Bar spacing (m)</Label><Input type="number" step="0.05" value={spacing} onChange={(e) => setSpacing(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Bar length (m)</Label><Input type="number" step="0.5" value={barLen} onChange={(e) => setBarLen(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Bar price ($)</Label><Input type="number" step="0.1" value={barPrice} onChange={(e) => setBarPrice(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Longitudinal bars" value={r.long.toString()}/>
        <Stat label="Transverse bars" value={r.trans.toString()}/>
        <Stat label="Total length" value={`${r.totalM.toFixed(1)} m`}/>
        <Stat label="Bars to buy" value={r.bars.toString()} highlight/>
        <Stat label="Cost" value={`$${r.cost.toFixed(0)}`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}