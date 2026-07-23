import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const R_VALUES: Record<string, { pricePerM2: number; label: string }> = {
  fiberglass: { pricePerM2: 10, label: "Fiberglass batt R-13" },
  mineral: { pricePerM2: 14, label: "Mineral wool R-15" },
  foam: { pricePerM2: 22, label: "Spray foam R-21" },
  rigid: { pricePerM2: 18, label: "Rigid foam R-13" },
};

export default function Tool() {
  const [type, setType] = useState("fiberglass");
  const [W, setW] = useState(5);
  const [H, setH] = useState(3);
  const [walls, setWalls] = useState(4);
  const [waste, setWaste] = useState(10);

  const r = useMemo(() => {
    const area = W * H * walls;
    const withWaste = area * (1 + waste / 100);
    const cost = withWaste * R_VALUES[type].pricePerM2;
    return { area, withWaste, cost };
  }, [type, W, H, walls, waste]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Label>Insulation type</Label><Select value={type} onValueChange={setType}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(R_VALUES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Waste (%)</Label><Input type="number" value={waste} onChange={(e) => setWaste(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Wall width (m)</Label><Input type="number" step="0.1" value={W} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Wall height (m)</Label><Input type="number" step="0.1" value={H} onChange={(e) => setH(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label># walls</Label><Input type="number" value={walls} onChange={(e) => setWalls(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Wall area" value={`${r.area.toFixed(1)} m²`}/>
        <Stat label="With waste" value={`${r.withWaste.toFixed(1)} m²`}/>
        <Stat label="Estimated cost" value={`$${r.cost.toFixed(0)}`} highlight/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}