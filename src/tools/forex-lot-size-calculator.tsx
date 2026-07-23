import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [units, setUnits] = useState(100000);
  const r = useMemo(() => ({ standard: units / 100000, mini: units / 10000, micro: units / 1000, nano: units / 100 }), [units]);
  return (
    <div className="space-y-4">
      <div className="max-w-sm"><Label>Units</Label><Input type="number" value={units} onChange={(e) => setUnits(+e.target.value || 0)} className="mt-1"/></div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Standard lots" value={r.standard.toFixed(4)} highlight/>
        <Stat label="Mini lots" value={r.mini.toFixed(3)}/>
        <Stat label="Micro lots" value={r.micro.toFixed(2)}/>
        <Stat label="Nano lots" value={r.nano.toFixed(1)}/>
      </div>
      <div className="rounded-lg border p-3 text-xs">Standard = 100,000 · Mini = 10,000 · Micro = 1,000 · Nano = 100 units of base currency.</div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}