import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PALLETS: Record<string, { L: number; W: number; label: string }> = {
  eur: { L: 120, W: 80, label: "EUR (120×80 cm)" },
  us: { L: 122, W: 102, label: "US GMA (48×40 in)" },
  asia: { L: 110, W: 110, label: "ASIA (110×110 cm)" },
};

export default function Tool() {
  const [ptype, setPtype] = useState("eur");
  const [cL, setCL] = useState(40);
  const [cW, setCW] = useState(30);
  const [cH, setCH] = useState(20);
  const [maxH, setMaxH] = useState(180);
  const [kg, setKg] = useState(10);

  const r = useMemo(() => {
    const p = PALLETS[ptype];
    // simple grid: two orientations, pick best
    const opt1 = Math.floor(p.L / cL) * Math.floor(p.W / cW);
    const opt2 = Math.floor(p.L / cW) * Math.floor(p.W / cL);
    const perLayer = Math.max(opt1, opt2);
    const layers = Math.floor(maxH / cH);
    const total = perLayer * layers;
    const cols = Math.floor(p.L / Math.min(cL, cW));
    const rows = Math.floor(p.W / Math.max(cL, cW));
    return { p, perLayer, layers, total, weight: total * kg, cols, rows };
  }, [ptype, cL, cW, cH, maxH, kg]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-5">
        <div><Label>Pallet type</Label><Select value={ptype} onValueChange={setPtype}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(PALLETS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Carton L</Label><Input type="number" value={cL} onChange={(e) => setCL(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Carton W</Label><Input type="number" value={cW} onChange={(e) => setCW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Carton H</Label><Input type="number" value={cH} onChange={(e) => setCH(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Max stack H (cm)</Label><Input type="number" value={maxH} onChange={(e) => setMaxH(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div><Label>Carton weight (kg)</Label><Input type="number" value={kg} onChange={(e) => setKg(+e.target.value || 0)} className="mt-1 max-w-xs"/></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Cartons per layer" value={r.perLayer.toString()}/>
        <Stat label="Layers" value={r.layers.toString()}/>
        <Stat label="Total cartons / pallet" value={r.total.toString()} highlight/>
        <Stat label="Total weight" value={`${r.weight.toFixed(1)} kg`}/>
      </div>
      <div className="rounded-lg border p-3">
        <div className="mb-2 text-xs text-muted-foreground">Layer diagram (top view)</div>
        <div className="mx-auto grid gap-0.5 bg-muted-foreground/20 p-2" style={{ gridTemplateColumns: `repeat(${Math.max(r.cols, 1)}, minmax(0, 1fr))`, width: 300, height: (300 * r.p.W) / r.p.L }}>
          {Array.from({ length: r.perLayer }).map((_, i) => <div key={i} className="rounded-sm bg-primary/70"/>)}
        </div>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}