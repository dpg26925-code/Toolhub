import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Stop = { name: string; km: number };

export default function Tool() {
  const [unit, setUnit] = useState<"km" | "mi">("km");
  const [speed, setSpeed] = useState(70);
  const [stops, setStops] = useState<Stop[]>([
    { name: "Warehouse", km: 0 }, { name: "Depot A", km: 45 }, { name: "Depot B", km: 62 }, { name: "Customer", km: 30 },
  ]);

  const totalKm = useMemo(() => stops.slice(1).reduce((s, x) => s + x.km, 0), [stops]);
  const display = unit === "mi" ? totalKm * 0.621371 : totalKm;
  const time = totalKm / (speed || 1);

  const upd = (i: number, k: keyof Stop, v: string | number) => setStops((r) => r.map((x, j) => j === i ? { ...x, [k]: k === "name" ? String(v) : +v || 0 } : x));
  const add = () => setStops((r) => [...r, { name: `Stop ${r.length}`, km: 20 }]);
  const del = (i: number) => setStops((r) => r.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Manual entry — Enter distance between each waypoint (no live map API in demo).</div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Units</Label><Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="km">Kilometers</SelectItem><SelectItem value="mi">Miles</SelectItem></SelectContent></Select></div>
        <div><Label>Avg speed (km/h)</Label><Input type="number" value={speed} onChange={(e) => setSpeed(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="space-y-2">
        {stops.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_140px_40px] gap-2">
            <Input value={s.name} onChange={(e) => upd(i, "name", e.target.value)} placeholder="Stop name"/>
            <Input type="number" value={s.km} onChange={(e) => upd(i, "km", e.target.value)} placeholder="Distance from prev (km)" disabled={i === 0}/>
            <Button size="sm" variant="ghost" onClick={() => del(i)}>✕</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={add}>+ Add stop</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label={`Total distance (${unit})`} value={`${display.toFixed(1)}`} highlight/>
        <Stat label="Estimated drive time" value={`${Math.floor(time)}h ${Math.round((time % 1) * 60)}m`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}