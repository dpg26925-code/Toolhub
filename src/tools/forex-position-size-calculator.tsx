import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [account, setAccount] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [stopPips, setStopPips] = useState(30);
  const [pipValue, setPipValue] = useState(10);

  const r = useMemo(() => {
    const risk = account * (riskPct / 100);
    const lots = risk / (stopPips * pipValue);
    return { risk, lots };
  }, [account, riskPct, stopPips, pipValue]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Account balance ($)</Label><Input type="number" value={account} onChange={(e) => setAccount(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Risk (%)</Label><Input type="number" step="0.1" value={riskPct} onChange={(e) => setRiskPct(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Stop loss (pips)</Label><Input type="number" value={stopPips} onChange={(e) => setStopPips(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Pip value / lot ($)</Label><Input type="number" step="0.01" value={pipValue} onChange={(e) => setPipValue(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="$ at risk" value={`$${r.risk.toFixed(2)}`}/>
        <Stat label="Position size" value={`${r.lots.toFixed(2)} lots`} highlight/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}