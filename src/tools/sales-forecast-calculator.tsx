import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [monthly, setMonthly] = useState(10000);
  const [growth, setGrowth] = useState(8);
  const [months, setMonths] = useState(12);

  const rows = useMemo(() => {
    const r: { m: number; sales: number; cum: number }[] = [];
    let cum = 0;
    for (let i = 1; i <= months; i++) {
      const s = monthly * Math.pow(1 + growth / 100, i - 1);
      cum += s;
      r.push({ m: i, sales: s, cum });
    }
    return r;
  }, [monthly, growth, months]);
  const max = Math.max(...rows.map((r) => r.sales), 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Current monthly ($)</Label><Input type="number" value={monthly} onChange={(e) => setMonthly(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Monthly growth (%)</Label><Input type="number" step="0.1" value={growth} onChange={(e) => setGrowth(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Forecast months</Label><Input type="number" value={months} onChange={(e) => setMonths(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border p-3">
        <div className="flex h-40 items-end gap-1">{rows.map((r) => <div key={r.m} className="flex-1 rounded-t bg-primary" style={{ height: `${(r.sales / max) * 100}%` }} title={`M${r.m}: $${r.sales.toFixed(0)}`}/>)}</div>
      </div>
      <div className="rounded-lg border">
        <table className="w-full text-sm"><thead className="bg-muted"><tr><th className="p-2 text-left">Month</th><th className="p-2 text-right">Sales</th><th className="p-2 text-right">Cumulative</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.m} className="border-t"><td className="p-2">Month {r.m}</td><td className="p-2 text-right">${r.sales.toFixed(0)}</td><td className="p-2 text-right font-semibold">${r.cum.toFixed(0)}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}