import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = { date: string; sys: number; dia: number; pulse: number };

export default function Tool() {
  const [rows, setRows] = useState<Row[]>([{ date: new Date().toISOString().slice(0, 10), sys: 120, dia: 80, pulse: 72 }]);
  const add = () => setRows((r) => [...r, { date: new Date().toISOString().slice(0, 10), sys: 120, dia: 80, pulse: 72 }]);
  const upd = (i: number, k: keyof Row, v: string) => setRows((r) => r.map((x, j) => j === i ? { ...x, [k]: k === "date" ? v : (+v || 0) } : x));
  const del = (i: number) => setRows((r) => r.filter((_, j) => j !== i));

  const cat = (s: number, d: number) => s < 120 && d < 80 ? "Normal" : s < 130 && d < 80 ? "Elevated" : s < 140 || d < 90 ? "Stage 1 HTN" : s < 180 || d < 120 ? "Stage 2 HTN" : "Crisis";
  const color = (c: string) => c === "Normal" ? "text-emerald-500" : c === "Elevated" ? "text-yellow-500" : c === "Crisis" ? "text-red-500" : "text-orange-500";
  const avg = useMemo(() => rows.length ? { s: rows.reduce((a, x) => a + x.sys, 0) / rows.length, d: rows.reduce((a, x) => a + x.dia, 0) / rows.length } : null, [rows]);

  const exportCsv = () => {
    const csv = "date,systolic,diastolic,pulse\n" + rows.map((r) => `${r.date},${r.sys},${r.dia},${r.pulse}`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "bp-log.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {rows.map((r, i) => {
        const c = cat(r.sys, r.dia);
        return (
          <div key={i} className="grid grid-cols-[140px_80px_80px_80px_160px_40px] items-center gap-2 rounded-lg border p-2">
            <Input type="date" value={r.date} onChange={(e) => upd(i, "date", e.target.value)}/>
            <Input type="number" value={r.sys} onChange={(e) => upd(i, "sys", e.target.value)} placeholder="SYS"/>
            <Input type="number" value={r.dia} onChange={(e) => upd(i, "dia", e.target.value)} placeholder="DIA"/>
            <Input type="number" value={r.pulse} onChange={(e) => upd(i, "pulse", e.target.value)} placeholder="Pulse"/>
            <div className={`text-sm font-medium ${color(c)}`}>{c}</div>
            <Button size="sm" variant="ghost" onClick={() => del(i)}>✕</Button>
          </div>
        );
      })}
      <div className="flex gap-2"><Button size="sm" variant="outline" onClick={add}>+ Add reading</Button><Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button></div>
      {avg && <div className="rounded-lg border bg-muted/30 p-3">Average: <strong>{avg.s.toFixed(0)} / {avg.d.toFixed(0)}</strong> mmHg</div>}
    </div>
  );
}