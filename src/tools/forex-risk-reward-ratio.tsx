import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [entry, setEntry] = useState(1.1);
  const [stop, setStop] = useState(1.09);
  const [target, setTarget] = useState(1.13);

  const r = useMemo(() => {
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    const ratio = risk ? reward / risk : 0;
    const breakeven = ratio ? 1 / (1 + ratio) * 100 : 0;
    return { risk, reward, ratio, breakeven };
  }, [entry, stop, target]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Entry</Label><Input type="number" step="0.0001" value={entry} onChange={(e) => setEntry(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Stop loss</Label><Input type="number" step="0.0001" value={stop} onChange={(e) => setStop(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Take profit</Label><Input type="number" step="0.0001" value={target} onChange={(e) => setTarget(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Risk" value={r.risk.toFixed(4)}/>
        <Stat label="Reward" value={r.reward.toFixed(4)}/>
        <Stat label="R:R" value={`1 : ${r.ratio.toFixed(2)}`} highlight/>
        <Stat label="Break-even win rate" value={`${r.breakeven.toFixed(1)}%`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}