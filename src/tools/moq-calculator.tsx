import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [unit, setUnit] = useState(2);
  const [setup, setSetup] = useState(500);
  const [target, setTarget] = useState(3.5);

  const moq = target > unit ? Math.ceil(setup / (target - unit)) : Infinity;
  const rows = [10, 50, 100, 500, 1000, 5000, 10000].map((q) => ({ q, per: unit + setup / q, margin: target > 0 ? ((target - (unit + setup / q)) / target) * 100 : 0 }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Unit cost ($)</Label><Input type="number" step="0.01" value={unit} onChange={(e) => setUnit(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Setup / mold cost ($)</Label><Input type="number" value={setup} onChange={(e) => setSetup(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Target sell price ($)</Label><Input type="number" step="0.01" value={target} onChange={(e) => setTarget(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="text-xs text-muted-foreground">Minimum Order Quantity (break-even)</div>
        <div className="mt-1 text-3xl font-bold text-primary">{isFinite(moq) ? moq.toLocaleString() : "Impossible"}</div>
        <div className="mt-1 text-xs text-muted-foreground">Below this MOQ, unit cost exceeds target price.</div>
      </div>
      <div className="rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Cost per unit at different MOQs</h3>
        <table className="mt-2 w-full text-sm"><thead><tr><th className="text-left">Qty</th><th className="text-right">Cost/unit</th><th className="text-right">Margin at target</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.q} className="border-t"><td>{r.q.toLocaleString()}</td><td className="text-right">${r.per.toFixed(2)}</td><td className={`text-right ${r.margin >= 0 ? "text-emerald-500" : "text-destructive"}`}>{r.margin.toFixed(1)}%</td></tr>)}</tbody></table>
      </div>
      <div className="rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Cost curve</h3>
        <div className="mt-2 flex h-32 items-end gap-1">
          {rows.map((r) => <div key={r.q} className="flex-1 bg-primary/70 rounded-t" style={{ height: `${Math.min(100, (r.per / (target * 2)) * 100)}%` }} title={`${r.q}: $${r.per.toFixed(2)}`}/>)}
        </div>
        <div className="mt-1 flex gap-1 text-xs text-muted-foreground">{rows.map((r) => <div key={r.q} className="flex-1 text-center">{r.q >= 1000 ? `${r.q / 1000}k` : r.q}</div>)}</div>
      </div>
    </div>
  );
}