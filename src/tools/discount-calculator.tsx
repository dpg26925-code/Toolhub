import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

export default function DiscountCalculator() {
  const [price, setPrice] = useState(100);
  const [d1, setD1] = useState(20);
  const [d2, setD2] = useState(0);
  const r = useMemo(() => {
    const after1 = price * (1 - d1 / 100);
    const final = after1 * (1 - d2 / 100);
    const saved = price - final;
    const eff = price > 0 ? (saved / price) * 100 : 0;
    return { final, saved, eff };
  }, [price, d1, d2]);
  const pct = Math.min(100, Math.max(0, r.eff));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Original price</Label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-1" /></div>
        <div><Label>Discount (%)</Label><Input type="number" step="0.1" value={d1} onChange={(e) => setD1(+e.target.value)} className="mt-1" /></div>
        <div><Label>Extra discount (%)</Label><Input type="number" step="0.1" value={d2} onChange={(e) => setD2(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[10, 20, 25, 33, 50, 70].map((v) => <Button key={v} size="sm" variant="outline" onClick={() => setD1(v)}>{v}% off</Button>)}
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div><div className="text-xs uppercase text-muted-foreground">Final price</div><div className="mt-1 text-lg font-semibold text-primary">{fmt(r.final)}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">You save</div><div className="mt-1 font-semibold text-emerald-600">{fmt(r.saved)}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Effective</div><div className="mt-1 font-semibold">{fmt(r.eff, 1)}%</div></div>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <Button size="sm" onClick={() => { copy(`${fmt(price)} - ${fmt(r.eff, 1)}% = ${fmt(r.final)} (save ${fmt(r.saved)})`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}