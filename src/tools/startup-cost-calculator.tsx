import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

type Item = { cat: string; name: string; amt: number };
const CATS = ["Equipment", "Inventory", "Licensing", "Marketing", "Rent", "Utilities", "Insurance", "Other"];
const COLORS = ["bg-primary", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-pink-500", "bg-sky-500", "bg-orange-500", "bg-gray-500"];

export default function StartupCostCalculator() {
  const [items, setItems] = useState<Item[]>([
    { cat: "Equipment", name: "Laptop", amt: 2000 },
    { cat: "Marketing", name: "Launch campaign", amt: 3000 },
    { cat: "Rent", name: "First 3 months", amt: 6000 },
  ]);
  const [monthlyBurn, setMonthlyBurn] = useState(3000);

  const setItem = (i: number, p: Partial<Item>) => setItems(items.map((it, k) => k === i ? { ...it, ...p } : it));
  const total = items.reduce((s, i) => s + i.amt, 0);
  const byCat = CATS.map((c) => ({ cat: c, amt: items.filter(i => i.cat === c).reduce((s, i) => s + i.amt, 0) })).filter(x => x.amt > 0);
  const reserve = monthlyBurn * 6;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[140px_1fr_120px_auto]">
            <select value={it.cat} onChange={(e) => setItem(i, { cat: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <Input value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} placeholder="Item name" />
            <Input type="number" value={it.amt} onChange={(e) => setItem(i, { amt: +e.target.value })} />
            <Button variant="ghost" size="sm" onClick={() => setItems(items.filter((_, k) => k !== i))}>✕</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setItems([...items, { cat: "Other", name: "", amt: 0 }])}>+ Add item</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-border bg-secondary/40 p-4">
        <div><div className="text-xs uppercase text-muted-foreground">Total startup cost</div><div className="mt-1 text-2xl font-semibold text-primary">{fmt(total)}</div></div>
        <div>
          <label className="text-xs uppercase text-muted-foreground">Monthly burn</label>
          <Input type="number" value={monthlyBurn} onChange={(e) => setMonthlyBurn(+e.target.value)} className="mt-1" />
          <div className="mt-1 text-xs text-muted-foreground">Recommended 6-month cash reserve: <span className="font-semibold text-foreground">{fmt(reserve)}</span></div>
        </div>
      </div>
      <div className="space-y-2">
        {byCat.map((c, i) => {
          const pct = total > 0 ? (c.amt / total) * 100 : 0;
          return (
            <div key={c.cat}>
              <div className="mb-1 flex justify-between text-xs"><span>{c.cat}</span><span>{fmt(c.amt)} · {fmt(pct, 1)}%</span></div>
              <div className="h-3 rounded bg-muted overflow-hidden"><div className={`h-full ${COLORS[i % COLORS.length]}`} style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>
      <Button size="sm" onClick={() => { copy(`Startup cost: ${fmt(total)} + ${fmt(reserve)} reserve = ${fmt(total + reserve)}`); toast.success("Copied"); }}>Copy summary</Button>
    </div>
  );
}