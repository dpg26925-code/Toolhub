import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Item = { name: string; l: number; w: number; h: number; qty: number };
type Box = { name: string; l: number; w: number; h: number };

const DEFAULT_BOXES: Box[] = [
  { name: "Small", l: 20, w: 15, h: 10 },
  { name: "Medium", l: 30, w: 25, h: 20 },
  { name: "Large", l: 40, w: 30, h: 30 },
  { name: "XL", l: 60, w: 40, h: 40 },
];

export default function Tool() {
  const [items, setItems] = useState<Item[]>([{ name: "Widget", l: 10, w: 8, h: 5, qty: 6 }]);
  const upd = (i: number, k: keyof Item, v: string | number) => setItems((r) => r.map((x, j) => j === i ? { ...x, [k]: k === "name" ? String(v) : +v || 0 } : x));
  const add = () => setItems((r) => [...r, { name: "Item", l: 10, w: 10, h: 10, qty: 1 }]);
  const del = (i: number) => setItems((r) => r.filter((_, j) => j !== i));

  const result = useMemo(() => {
    const totalVol = items.reduce((s, it) => s + it.l * it.w * it.h * it.qty, 0);
    const results = DEFAULT_BOXES.map((b) => {
      const boxVol = b.l * b.w * b.h;
      // simple heuristic: each item must fit in box (max dim ≤ max box dim)
      const fits = items.every((it) => Math.max(it.l, it.w, it.h) <= Math.max(b.l, b.w, b.h) && it.l * it.w * it.h <= boxVol);
      const boxes = fits ? Math.ceil(totalVol / (boxVol * 0.85)) : Infinity;
      const util = fits ? (totalVol / (boxes * boxVol)) * 100 : 0;
      return { box: b, boxes, util, fits };
    }).filter((r) => r.fits).sort((a, b) => a.boxes * a.box.l * a.box.w * a.box.h - b.boxes * b.box.l * b.box.w * b.box.h);
    return { totalVol, results };
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-3">
        <div className="text-sm font-semibold mb-2">Items to pack</div>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_60px_60px_60px_60px_40px] gap-2 mb-2">
            <Input value={it.name} onChange={(e) => upd(i, "name", e.target.value)} placeholder="Name"/>
            <Input type="number" value={it.l} onChange={(e) => upd(i, "l", e.target.value)} placeholder="L"/>
            <Input type="number" value={it.w} onChange={(e) => upd(i, "w", e.target.value)} placeholder="W"/>
            <Input type="number" value={it.h} onChange={(e) => upd(i, "h", e.target.value)} placeholder="H"/>
            <Input type="number" value={it.qty} onChange={(e) => upd(i, "qty", e.target.value)} placeholder="Qty"/>
            <Button size="sm" variant="ghost" onClick={() => del(i)}>✕</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={add}>+ Add item</Button>
      </div>
      <div className="rounded-lg border bg-muted/30 p-3 text-sm">Total volume: <strong>{result.totalVol.toLocaleString()}</strong> cm³</div>
      <div className="space-y-2">
        {result.results.map((r, i) => (
          <div key={r.box.name} className={`rounded-lg border p-3 ${i === 0 ? "border-primary bg-primary/5" : ""}`}>
            <div className="flex justify-between">
              <div><strong>{r.box.name}</strong> ({r.box.l}×{r.box.w}×{r.box.h} cm){i === 0 && <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">OPTIMAL</span>}</div>
              <div className="text-right"><div className="font-semibold">{r.boxes} box{r.boxes > 1 ? "es" : ""}</div><div className="text-xs text-muted-foreground">{r.util.toFixed(1)}% utilization</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}