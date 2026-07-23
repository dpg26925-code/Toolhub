import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DROP_FACTORS = [10, 15, 20, 60];

export default function Tool() {
  const [volume, setVolume] = useState(1000);
  const [hours, setHours] = useState(8);
  const [factor, setFactor] = useState(20);

  const r = useMemo(() => {
    const mlPerHr = volume / hours;
    const drops = (volume * factor) / (hours * 60);
    return { mlPerHr, drops };
  }, [volume, hours, factor]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Educational only. Verify with pump/tubing package insert.</div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Volume (mL)</Label><Input type="number" value={volume} onChange={(e) => setVolume(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Time (hours)</Label><Input type="number" step="0.1" value={hours} onChange={(e) => setHours(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Drop factor (gtt/mL)</Label><Select value={String(factor)} onValueChange={(v) => setFactor(+v)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{DROP_FACTORS.map((f) => <SelectItem key={f} value={String(f)}>{f} {f === 60 ? "(microdrip)" : ""}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Infusion rate" value={`${r.mlPerHr.toFixed(1)} mL/hr`}/>
        <Stat label="Drip rate" value={`${r.drops.toFixed(0)} gtt/min`} highlight/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}