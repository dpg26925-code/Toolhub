import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [peak, setPeak] = useState(10000);
  const [trough, setTrough] = useState(8500);

  const r = useMemo(() => {
    const dd = peak - trough;
    const pct = peak ? (dd / peak) * 100 : 0;
    const recovery = trough ? (peak / trough - 1) * 100 : 0;
    return { dd, pct, recovery };
  }, [peak, trough]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Peak equity ($)</Label><Input type="number" value={peak} onChange={(e) => setPeak(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Trough equity ($)</Label><Input type="number" value={trough} onChange={(e) => setTrough(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Drawdown ($)" value={`$${r.dd.toFixed(0)}`}/>
        <Stat label="Drawdown (%)" value={`${r.pct.toFixed(2)}%`} highlight/>
        <Stat label="Gain to recover" value={`${r.recovery.toFixed(2)}%`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}