import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Trade = { name: string; hours: number; rate: number };

export default function Tool() {
  const [rows, setRows] = useState<Trade[]>([
    { name: "Framing", hours: 80, rate: 45 },
    { name: "Drywall", hours: 40, rate: 40 },
    { name: "Electrical", hours: 30, rate: 70 },
    { name: "Plumbing", hours: 25, rate: 75 },
    { name: "Painting", hours: 35, rate: 35 },
  ]);
  const upd = (i: number, k: keyof Trade, v: string) => setRows((r) => r.map((x, j) => j === i ? { ...x, [k]: k === "name" ? v : +v || 0 } : x));
  const add = () => setRows((r) => [...r, { name: "New trade", hours: 8, rate: 40 }]);
  const del = (i: number) => setRows((r) => r.filter((_, j) => j !== i));

  const total = useMemo(() => rows.reduce((s, r) => s + r.hours * r.rate, 0), [rows]);
  const totalHours = useMemo(() => rows.reduce((s, r) => s + r.hours, 0), [rows]);

  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_100px_100px_120px_40px] items-center gap-2 rounded-lg border p-2">
          <Input value={r.name} onChange={(e) => upd(i, "name", e.target.value)} placeholder="Trade"/>
          <Input type="number" value={r.hours} onChange={(e) => upd(i, "hours", e.target.value)} placeholder="Hours"/>
          <Input type="number" value={r.rate} onChange={(e) => upd(i, "rate", e.target.value)} placeholder="$/hr"/>
          <div className="text-right font-semibold">${(r.hours * r.rate).toFixed(0)}</div>
          <Button size="sm" variant="ghost" onClick={() => del(i)}>✕</Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={add}>+ Add trade</Button>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Total hours</div><div className="mt-1 text-2xl font-bold">{totalHours}</div></div>
        <div className="rounded-lg border bg-primary/5 p-3"><div className="text-xs text-muted-foreground">Total labor cost</div><div className="mt-1 text-2xl font-bold text-primary">${total.toFixed(0)}</div></div>
      </div>
    </div>
  );
}