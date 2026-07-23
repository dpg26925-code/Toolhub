import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [cost, setCost] = useState(20);
  const [price, setPrice] = useState(50);
  const [demandBase, setDemandBase] = useState(1000);
  const [elasticity, setElasticity] = useState(1.5);

  const rows = useMemo(() => {
    return [-30, -15, 0, 15, 30, 50].map((pct) => {
      const p = price * (1 + pct / 100);
      const q = demandBase * Math.pow(price / p, elasticity);
      const rev = p * q;
      const profit = (p - cost) * q;
      return { pct, p, q, rev, profit };
    });
  }, [cost, price, demandBase, elasticity]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Unit cost ($)</Label><Input type="number" value={cost} onChange={(e) => setCost(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Current price ($)</Label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Base demand (units)</Label><Input type="number" value={demandBase} onChange={(e) => setDemandBase(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Elasticity</Label><Input type="number" step="0.1" value={elasticity} onChange={(e) => setElasticity(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border">
        <table className="w-full text-sm"><thead className="bg-muted"><tr><th className="p-2 text-left">Price change</th><th className="p-2 text-right">New price</th><th className="p-2 text-right">Est. units</th><th className="p-2 text-right">Revenue</th><th className="p-2 text-right">Profit</th></tr></thead>
        <tbody>{rows.map((r) => {
          const best = r.profit === Math.max(...rows.map((x) => x.profit));
          return <tr key={r.pct} className={`border-t ${best ? "bg-emerald-500/5" : ""}`}>
            <td className="p-2">{r.pct > 0 ? "+" : ""}{r.pct}%{best && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-500">BEST PROFIT</span>}</td>
            <td className="p-2 text-right">${r.p.toFixed(2)}</td>
            <td className="p-2 text-right">{r.q.toFixed(0)}</td>
            <td className="p-2 text-right">${r.rev.toFixed(0)}</td>
            <td className="p-2 text-right font-semibold">${r.profit.toFixed(0)}</td>
          </tr>;
        })}</tbody></table>
      </div>
    </div>
  );
}