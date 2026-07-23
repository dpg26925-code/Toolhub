import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [W, setW] = useState(5);
  const [H, setH] = useState(3);
  const [walls, setWalls] = useState(4);
  const [sheetSize, setSheetSize] = useState(2.88); // 4x8 ft ≈ 2.88 m²
  const [waste, setWaste] = useState(10);
  const [price, setPrice] = useState(12);

  const r = useMemo(() => {
    const area = W * H * walls;
    const sheets = Math.ceil((area / sheetSize) * (1 + waste / 100));
    const screws = sheets * 32;
    const jointCompound = area * 0.3; // kg per m²
    return { area, sheets, screws, jointCompound, cost: sheets * price };
  }, [W, H, walls, sheetSize, waste, price]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Wall width (m)</Label><Input type="number" step="0.1" value={W} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Wall height (m)</Label><Input type="number" step="0.1" value={H} onChange={(e) => setH(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label># walls</Label><Input type="number" value={walls} onChange={(e) => setWalls(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Sheet size (m²)</Label><Input type="number" step="0.1" value={sheetSize} onChange={(e) => setSheetSize(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Waste (%)</Label><Input type="number" value={waste} onChange={(e) => setWaste(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Sheet price ($)</Label><Input type="number" step="0.1" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Area" value={`${r.area.toFixed(1)} m²`}/>
        <Stat label="Sheets" value={r.sheets.toString()} highlight/>
        <Stat label="Screws (~)" value={r.screws.toString()}/>
        <Stat label="Joint compound" value={`${r.jointCompound.toFixed(1)} kg`}/>
        <Stat label="Cost" value={`$${r.cost.toFixed(0)}`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}