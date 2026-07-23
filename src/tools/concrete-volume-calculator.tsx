import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [shape, setShape] = useState<"slab" | "footing" | "column">("slab");
  const [L, setL] = useState(5);
  const [W, setW] = useState(4);
  const [T, setT] = useState(0.15);
  const [D, setD] = useState(0.3);
  const [H, setH] = useState(3);
  const [waste, setWaste] = useState(10);
  const [price, setPrice] = useState(120);

  const r = useMemo(() => {
    let v = 0;
    if (shape === "slab") v = L * W * T;
    else if (shape === "footing") v = L * W * D;
    else v = Math.PI * (D / 2) ** 2 * H;
    const withWaste = v * (1 + waste / 100);
    const bags = withWaste * 60; // approx 40 kg bags per m3 dry mix (~60 bags @40kg per m3 finished)
    const cost = withWaste * price;
    return { v, withWaste, bags, cost };
  }, [shape, L, W, T, D, H, waste, price]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Shape</Label><Select value={shape} onValueChange={(v) => setShape(v as typeof shape)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="slab">Slab</SelectItem><SelectItem value="footing">Footing</SelectItem><SelectItem value="column">Round column</SelectItem></SelectContent></Select></div>
        {shape !== "column" && <div><Label>Length (m)</Label><Input type="number" step="0.1" value={L} onChange={(e) => setL(+e.target.value || 0)} className="mt-1"/></div>}
        {shape !== "column" && <div><Label>Width (m)</Label><Input type="number" step="0.1" value={W} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>}
        {shape === "slab" && <div><Label>Thickness (m)</Label><Input type="number" step="0.01" value={T} onChange={(e) => setT(+e.target.value || 0)} className="mt-1"/></div>}
        {shape === "footing" && <div><Label>Depth (m)</Label><Input type="number" step="0.01" value={D} onChange={(e) => setD(+e.target.value || 0)} className="mt-1"/></div>}
        {shape === "column" && <div><Label>Diameter (m)</Label><Input type="number" step="0.01" value={D} onChange={(e) => setD(+e.target.value || 0)} className="mt-1"/></div>}
        {shape === "column" && <div><Label>Height (m)</Label><Input type="number" step="0.1" value={H} onChange={(e) => setH(+e.target.value || 0)} className="mt-1"/></div>}
        <div><Label>Waste (%)</Label><Input type="number" value={waste} onChange={(e) => setWaste(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Price ($/m³)</Label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Volume" value={`${r.v.toFixed(2)} m³`}/>
        <Stat label="With waste" value={`${r.withWaste.toFixed(2)} m³`} highlight/>
        <Stat label="Ready-mix cost" value={`$${r.cost.toFixed(0)}`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}