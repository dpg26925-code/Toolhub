import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [W, setW] = useState(5);
  const [H, setH] = useState(3);
  const [spacing, setSpacing] = useState(0.4);
  const [studLen, setStudLen] = useState(3);
  const [price, setPrice] = useState(8);

  const r = useMemo(() => {
    const studs = Math.ceil(W / spacing) + 1;
    const plates = Math.ceil((W * 2) / studLen);
    const total = studs + plates;
    return { studs, plates, total, cost: total * price };
  }, [W, H, spacing, studLen, price]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Wall length (m)</Label><Input type="number" step="0.1" value={W} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Wall height (m)</Label><Input type="number" step="0.1" value={H} onChange={(e) => setH(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Stud spacing (m)</Label><Input type="number" step="0.05" value={spacing} onChange={(e) => setSpacing(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Stud length (m)</Label><Input type="number" step="0.1" value={studLen} onChange={(e) => setStudLen(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Price per piece ($)</Label><Input type="number" step="0.1" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Studs" value={r.studs.toString()}/>
        <Stat label="Plates" value={r.plates.toString()}/>
        <Stat label="Total pieces" value={r.total.toString()} highlight/>
        <Stat label="Cost" value={`$${r.cost.toFixed(0)}`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}