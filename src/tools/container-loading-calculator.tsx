import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CONTAINERS: Record<string, { L: number; W: number; H: number; maxKg: number }> = {
  "20ft": { L: 590, W: 235, H: 239, maxKg: 21770 },
  "40ft": { L: 1203, W: 235, H: 239, maxKg: 26680 },
  "40ft HC": { L: 1203, W: 235, H: 269, maxKg: 26580 },
};

export default function Tool() {
  const [type, setType] = useState<keyof typeof CONTAINERS>("20ft");
  const [l, setL] = useState(40);
  const [w, setW] = useState(30);
  const [h, setH] = useState(25);
  const [kgPerCarton, setKg] = useState(15);

  const r = useMemo(() => {
    const c = CONTAINERS[type];
    // simple orthogonal packing
    const nL = Math.floor(c.L / l), nW = Math.floor(c.W / w), nH = Math.floor(c.H / h);
    const fit = nL * nW * nH;
    const cVol = c.L * c.W * c.H;
    const usedVol = fit * l * w * h;
    const util = (usedVol / cVol) * 100;
    const totalKg = fit * kgPerCarton;
    const weightLimited = totalKg > c.maxKg ? Math.floor(c.maxKg / kgPerCarton) : fit;
    return { c, fit, weightLimited, util, totalKg, cbm: cVol / 1e6 };
  }, [type, l, w, h, kgPerCarton]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Container</Label><Select value={type} onValueChange={(v) => setType(v as typeof type)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
          <SelectContent>{Object.keys(CONTAINERS).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Carton L (cm)</Label><Input type="number" value={l} onChange={(e) => setL(+e.target.value || 1)} className="mt-1"/></div>
        <div><Label>Carton W (cm)</Label><Input type="number" value={w} onChange={(e) => setW(+e.target.value || 1)} className="mt-1"/></div>
        <div><Label>Carton H (cm)</Label><Input type="number" value={h} onChange={(e) => setH(+e.target.value || 1)} className="mt-1"/></div>
        <div><Label>Weight per carton (kg)</Label><Input type="number" value={kgPerCarton} onChange={(e) => setKg(+e.target.value || 1)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Cartons fit (volume)" value={r.fit.toLocaleString()}/>
        <Stat label="Cartons fit (with weight limit)" value={r.weightLimited.toLocaleString()} highlight/>
        <Stat label="Container volume" value={`${r.cbm.toFixed(2)} m³`}/>
        <Stat label="Utilization" value={`${r.util.toFixed(1)}%`}/>
        <Stat label="Total weight" value={`${r.totalKg.toLocaleString()} kg / ${r.c.maxKg.toLocaleString()} kg max`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}