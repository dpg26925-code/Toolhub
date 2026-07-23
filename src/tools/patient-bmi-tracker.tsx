import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Row = { date: string; weight: number; height: number };

export default function Tool() {
  const [rows, setRows] = useState<Row[]>([{ date: new Date().toISOString().slice(0, 10), weight: 70, height: 170 }]);
  const add = () => setRows((r) => [...r, { date: new Date().toISOString().slice(0, 10), weight: 70, height: r[r.length - 1]?.height || 170 }]);
  const upd = (i: number, k: keyof Row, v: string) => setRows((r) => r.map((x, j) => j === i ? { ...x, [k]: k === "date" ? v : (+v || 0) } : x));
  const del = (i: number) => setRows((r) => r.filter((_, j) => j !== i));

  const bmi = (r: Row) => r.weight / ((r.height / 100) ** 2);
  const cat = (b: number) => b < 18.5 ? "Underweight" : b < 25 ? "Normal" : b < 30 ? "Overweight" : "Obese";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rows.map((r, i) => {
          const b = bmi(r);
          return (
            <div key={i} className="grid grid-cols-[140px_100px_100px_140px_80px_40px] items-center gap-2 rounded-lg border p-2">
              <Input type="date" value={r.date} onChange={(e) => upd(i, "date", e.target.value)}/>
              <Input type="number" value={r.weight} onChange={(e) => upd(i, "weight", e.target.value)} placeholder="kg"/>
              <Input type="number" value={r.height} onChange={(e) => upd(i, "height", e.target.value)} placeholder="cm"/>
              <div className="text-sm"><strong>BMI:</strong> {b.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">{cat(b)}</div>
              <Button size="sm" variant="ghost" onClick={() => del(i)}>✕</Button>
            </div>
          );
        })}
        <Button size="sm" variant="outline" onClick={add}>+ Add measurement</Button>
      </div>
      <div className="rounded-lg border bg-muted/30 p-3 text-xs">Data is stored only in this session. Refresh clears the table.</div>
    </div>
  );
}