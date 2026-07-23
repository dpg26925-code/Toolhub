import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [W, setW] = useState(4);
  const [H, setH] = useState(3);
  const [tileW, setTileW] = useState(30);
  const [tileH, setTileH] = useState(30);
  const [waste, setWaste] = useState(10);
  const [price, setPrice] = useState(25);

  const r = useMemo(() => {
    const area = W * H;
    const tileArea = (tileW / 100) * (tileH / 100);
    const tiles = Math.ceil((area / tileArea) * (1 + waste / 100));
    const boxes = Math.ceil(tiles / 12); // typically 12 per box
    const cost = area * (1 + waste / 100) * price;
    return { area, tiles, boxes, cost };
  }, [W, H, tileW, tileH, waste, price]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Room width (m)</Label><Input type="number" step="0.1" value={W} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Room length (m)</Label><Input type="number" step="0.1" value={H} onChange={(e) => setH(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Waste (%)</Label><Input type="number" value={waste} onChange={(e) => setWaste(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Tile width (cm)</Label><Input type="number" value={tileW} onChange={(e) => setTileW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Tile height (cm)</Label><Input type="number" value={tileH} onChange={(e) => setTileH(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Price ($/m²)</Label><Input type="number" step="0.1" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Room area" value={`${r.area.toFixed(2)} m²`}/>
        <Stat label="Tiles needed" value={r.tiles.toLocaleString()} highlight/>
        <Stat label="Boxes (of 12)" value={r.boxes.toLocaleString()}/>
        <Stat label="Material cost" value={`$${r.cost.toFixed(0)}`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}