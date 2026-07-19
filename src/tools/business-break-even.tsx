import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";
import { LineChart } from "./_chart";

export default function BusinessBreakEven() {
  const [fixed, setFixed] = useState(10000);
  const [variable, setVariable] = useState(5);
  const [price, setPrice] = useState(15);

  const r = useMemo(() => {
    const contribution = price - variable;
    const units = contribution > 0 ? fixed / contribution : 0;
    const revenue = units * price;
    const margin = price > 0 ? (contribution / price) * 100 : 0;
    return { contribution, units, revenue, margin };
  }, [fixed, variable, price]);

  const chart = useMemo(() => {
    const maxU = Math.ceil((r.units || 100) * 2);
    const n = 40;
    const xs = Array.from({ length: n + 1 }, (_, i) => (i / n) * maxU);
    return {
      revenue: xs.map((u) => u * price),
      totalCost: xs.map((u) => fixed + u * variable),
      fixed: xs.map(() => fixed),
    };
  }, [fixed, variable, price, r.units]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Fixed costs</Label><Input type="number" value={fixed} onChange={(e) => setFixed(+e.target.value)} className="mt-1" /></div>
        <div><Label>Variable cost / unit</Label><Input type="number" step="0.01" value={variable} onChange={(e) => setVariable(+e.target.value)} className="mt-1" /></div>
        <div><Label>Price / unit</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Break-even units" v={fmt(r.units, 0)} h />
        <S label="Break-even revenue" v={fmt(r.revenue)} />
        <S label="Contribution margin" v={fmt(r.contribution)} />
        <S label="Margin ratio" v={`${fmt(r.margin, 1)}%`} />
      </div>
      {r.contribution <= 0 && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">Price must exceed variable cost.</p>}
      <div className="rounded-xl border border-border bg-card p-4">
        <LineChart series={[
          { name: "Revenue", color: "#22c55e", data: chart.revenue },
          { name: "Total cost", color: "#ef4444", data: chart.totalCost },
          { name: "Fixed cost", color: "#6b7280", data: chart.fixed },
        ]} height={220} />
      </div>
      <Button size="sm" onClick={() => { copy(`Break-even: ${fmt(r.units, 0)} units / ${fmt(r.revenue)}`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}