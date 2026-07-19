import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

type Mode = "fromPrice" | "fromMargin";

export default function SalesMarginCalculator() {
  const [mode, setMode] = useState<Mode>("fromPrice");
  const [cost, setCost] = useState(50);
  const [price, setPrice] = useState(100);
  const [targetMargin, setTargetMargin] = useState(40);

  const r = useMemo(() => {
    if (mode === "fromPrice") {
      const profit = price - cost;
      const margin = price > 0 ? (profit / price) * 100 : 0;
      const markup = cost > 0 ? (profit / cost) * 100 : 0;
      return { profit, margin, markup, price };
    }
    const p = targetMargin < 100 ? cost / (1 - targetMargin / 100) : 0;
    const profit = p - cost;
    const markup = cost > 0 ? (profit / cost) * 100 : 0;
    return { profit, margin: targetMargin, markup, price: p };
  }, [mode, cost, price, targetMargin]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "fromPrice" ? "default" : "outline"} onClick={() => setMode("fromPrice")}>From cost + price</Button>
        <Button size="sm" variant={mode === "fromMargin" ? "default" : "outline"} onClick={() => setMode("fromMargin")}>Reverse (target margin)</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Cost</Label><Input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} className="mt-1" /></div>
        {mode === "fromPrice" ? (
          <div><Label>Selling price</Label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-1" /></div>
        ) : (
          <div><Label>Target margin (%)</Label><Input type="number" step="0.1" value={targetMargin} onChange={(e) => setTargetMargin(+e.target.value)} className="mt-1" /></div>
        )}
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Price" v={fmt(r.price)} />
        <S label="Profit" v={fmt(r.profit)} />
        <S label="Margin" v={`${fmt(r.margin, 2)}%`} h />
        <S label="Markup" v={`${fmt(r.markup, 2)}%`} />
      </div>
      <Button size="sm" onClick={() => { copy(`Price ${fmt(r.price)}, cost ${fmt(cost)}, margin ${fmt(r.margin, 2)}%`); toast.success("Copied"); }}>Copy</Button>
      <p className="text-xs text-muted-foreground">Margin = profit ÷ price · Markup = profit ÷ cost.</p>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}