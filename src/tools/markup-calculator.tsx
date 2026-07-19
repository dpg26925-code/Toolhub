import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

type Mode = "fromMarkup" | "fromProfit";

export default function MarkupCalculator() {
  const [mode, setMode] = useState<Mode>("fromMarkup");
  const [cost, setCost] = useState(50);
  const [markup, setMarkup] = useState(60);
  const [targetProfit, setTargetProfit] = useState(30);

  const r = useMemo(() => {
    if (mode === "fromMarkup") {
      const profit = (cost * markup) / 100;
      const price = cost + profit;
      const margin = price > 0 ? (profit / price) * 100 : 0;
      return { profit, price, markup, margin };
    }
    const m = cost > 0 ? (targetProfit / cost) * 100 : 0;
    const price = cost + targetProfit;
    const margin = price > 0 ? (targetProfit / price) * 100 : 0;
    return { profit: targetProfit, price, markup: m, margin };
  }, [mode, cost, markup, targetProfit]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "fromMarkup" ? "default" : "outline"} onClick={() => setMode("fromMarkup")}>From markup %</Button>
        <Button size="sm" variant={mode === "fromProfit" ? "default" : "outline"} onClick={() => setMode("fromProfit")}>Reverse (target profit)</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Cost</Label><Input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} className="mt-1" /></div>
        {mode === "fromMarkup" ? (
          <div><Label>Markup (%)</Label><Input type="number" step="0.1" value={markup} onChange={(e) => setMarkup(+e.target.value)} className="mt-1" /></div>
        ) : (
          <div><Label>Target profit</Label><Input type="number" value={targetProfit} onChange={(e) => setTargetProfit(+e.target.value)} className="mt-1" /></div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">{[25, 50, 75, 100, 150].map(v => <Button key={v} size="sm" variant="outline" onClick={() => { setMode("fromMarkup"); setMarkup(v); }}>{v}%</Button>)}</div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Price" v={fmt(r.price)} h />
        <S label="Profit" v={fmt(r.profit)} />
        <S label="Markup" v={`${fmt(r.markup, 2)}%`} />
        <S label="Margin" v={`${fmt(r.margin, 2)}%`} />
      </div>
      <Button size="sm" onClick={() => { copy(`Cost ${fmt(cost)} + ${fmt(r.markup, 2)}% markup = ${fmt(r.price)}`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}