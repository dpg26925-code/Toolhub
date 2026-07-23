import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Tier = { min: number; rate: number };
const DEFAULT_TIERS: Tier[] = [{ min: 0, rate: 5 }, { min: 1000, rate: 8 }, { min: 5000, rate: 12 }];

export default function Tool() {
  const [sale, setSale] = useState(50);
  const [rate, setRate] = useState(10);
  const [tiered, setTiered] = useState(false);
  const [volume, setVolume] = useState(1000);

  const commission = tiered ? tierRate(volume) * sale / 100 : rate * sale / 100;
  const effective = sale > 0 ? (commission / sale) * 100 : 0;

  const scenarios = [10, 50, 100, 500, 1000, 5000].map((v) => {
    const r = tiered ? tierRate(v * sale) : rate;
    return { v, revenue: v * sale, earn: v * sale * r / 100, rate: r };
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Sale price ($)</Label><Input type="number" step="0.01" value={sale} onChange={(e) => setSale(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Commission rate (%)</Label><Input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value || 0)} className="mt-1" disabled={tiered}/></div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={tiered} onChange={(e) => setTiered(e.target.checked)}/> Tiered commission</label></div>
      </div>
      {tiered && (
        <div className="rounded-lg border p-3 text-sm">
          <div className="mb-2 font-semibold">Bonus thresholds</div>
          <ul className="space-y-1">{DEFAULT_TIERS.map((t) => <li key={t.min}>≥ ${t.min.toLocaleString()} monthly volume → {t.rate}%</li>)}</ul>
          <div className="mt-3"><Label>Current volume ($)</Label><Input type="number" value={volume} onChange={(e) => setVolume(+e.target.value || 0)} className="mt-1"/></div>
          <div className="mt-2 text-xs">Applied rate: <strong>{tierRate(volume)}%</strong></div>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Commission per sale" value={`$${commission.toFixed(2)}`} highlight/>
        <Stat label="Effective rate" value={`${effective.toFixed(2)}%`}/>
      </div>
      <div className="rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Earnings at different volumes</h3>
        <table className="mt-2 w-full text-sm">
          <thead><tr><th className="text-left">Sales</th><th className="text-right">Revenue</th><th className="text-right">Rate</th><th className="text-right">Earnings</th></tr></thead>
          <tbody>{scenarios.map((s) => <tr key={s.v} className="border-t"><td>{s.v}</td><td className="text-right">${s.revenue.toLocaleString()}</td><td className="text-right">{s.rate}%</td><td className="text-right font-semibold">${s.earn.toFixed(2)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
function tierRate(volume: number) { let r = DEFAULT_TIERS[0].rate; for (const t of DEFAULT_TIERS) if (volume >= t.min) r = t.rate; return r; }
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}