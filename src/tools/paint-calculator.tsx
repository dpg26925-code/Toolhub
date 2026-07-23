import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [W, setW] = useState(5);
  const [H, setH] = useState(3);
  const [walls, setWalls] = useState(4);
  const [coats, setCoats] = useState(2);
  const [coverage, setCoverage] = useState(10); // m2 per L
  const [openings, setOpenings] = useState(3); // m2 total
  const [price, setPrice] = useState(8);

  const r = useMemo(() => {
    const area = Math.max(0, W * H * walls - openings);
    const litres = (area * coats) / coverage;
    return { area, litres, cost: litres * price };
  }, [W, H, walls, coats, coverage, openings, price]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Wall width (m)</Label><Input type="number" step="0.1" value={W} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Wall height (m)</Label><Input type="number" step="0.1" value={H} onChange={(e) => setH(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label># of walls</Label><Input type="number" value={walls} onChange={(e) => setWalls(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Coats</Label><Input type="number" value={coats} onChange={(e) => setCoats(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Coverage (m²/L)</Label><Input type="number" step="0.1" value={coverage} onChange={(e) => setCoverage(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Doors/windows (m²)</Label><Input type="number" step="0.1" value={openings} onChange={(e) => setOpenings(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Price ($/L)</Label><Input type="number" step="0.1" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Paintable area" value={`${r.area.toFixed(1)} m²`}/>
        <Stat label="Paint required" value={`${r.litres.toFixed(1)} L`} highlight/>
        <Stat label="Cost" value={`$${r.cost.toFixed(0)}`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}