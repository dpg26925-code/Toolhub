import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [type, setType] = useState<"pallet" | "shelf" | "floor">("pallet");
  const [qty, setQty] = useState(500);
  const [aisle, setAisle] = useState(30); // %

  const r = useMemo(() => {
    // pallet: 1.2 x 0.8 m = 0.96 m², shelf: 0.5 m², floor: 1 m²
    const per = type === "pallet" ? 0.96 : type === "shelf" ? 0.5 : 1;
    const storage = qty * per;
    const aisleArea = storage * (aisle / 100);
    const total = storage + aisleArea;
    return { per, storage, aisleArea, total };
  }, [type, qty, aisle]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Storage type</Label><Select value={type} onValueChange={(v) => setType(v as typeof type)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="pallet">Pallet racking</SelectItem><SelectItem value="shelf">Shelf/bin</SelectItem><SelectItem value="floor">Floor stack</SelectItem></SelectContent></Select></div>
        <div><Label>Quantity of units</Label><Input type="number" value={qty} onChange={(e) => setQty(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Aisle allowance (%)</Label><Input type="number" value={aisle} onChange={(e) => setAisle(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label={`Space per unit`} value={`${r.per.toFixed(2)} m²`}/>
        <Stat label="Storage footprint" value={`${r.storage.toFixed(1)} m²`}/>
        <Stat label="Aisles & handling" value={`${r.aisleArea.toFixed(1)} m²`}/>
        <Stat label="Total warehouse area" value={`${r.total.toFixed(1)} m²`} highlight/>
      </div>
      <div className="rounded-lg border p-3 text-sm">Tip: For high-throughput operations, use 40–50% aisle allowance. For dense storage, 25–30% is common. Add mezzanine floors for vertical scaling.</div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}