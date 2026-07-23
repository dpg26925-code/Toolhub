import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Kpi = { name: string; target: number; actual: number };

export default function Tool() {
  const [rows, setRows] = useState<Kpi[]>([
    { name: "MRR", target: 50000, actual: 42000 },
    { name: "New signups", target: 200, actual: 168 },
    { name: "Churn %", target: 3, actual: 4.2 },
    { name: "NPS", target: 50, actual: 44 },
  ]);
  const upd = (i: number, k: keyof Kpi, v: string) => setRows((r) => r.map((x, j) => j === i ? { ...x, [k]: k === "name" ? v : +v || 0 } : x));
  const add = () => setRows((r) => [...r, { name: "New KPI", target: 100, actual: 0 }]);
  const del = (i: number) => setRows((r) => r.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      {rows.map((r, i) => {
        const pct = r.target ? (r.actual / r.target) * 100 : 0;
        const good = pct >= 100;
        return (
          <div key={i} className="rounded-lg border p-3">
            <div className="grid grid-cols-[1fr_100px_100px_40px] items-center gap-2 mb-2">
              <Input value={r.name} onChange={(e) => upd(i, "name", e.target.value)} placeholder="KPI name"/>
              <Input type="number" value={r.target} onChange={(e) => upd(i, "target", e.target.value)} placeholder="Target"/>
              <Input type="number" value={r.actual} onChange={(e) => upd(i, "actual", e.target.value)} placeholder="Actual"/>
              <Button size="sm" variant="ghost" onClick={() => del(i)}>✕</Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 flex-1 rounded-full bg-muted"><div className={`h-3 rounded-full ${good ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${Math.min(pct, 100)}%` }}/></div>
              <div className={`w-16 text-right text-sm font-semibold ${good ? "text-emerald-500" : ""}`}>{pct.toFixed(0)}%</div>
            </div>
          </div>
        );
      })}
      <Button size="sm" variant="outline" onClick={add}>+ Add KPI</Button>
    </div>
  );
}