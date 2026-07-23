import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Row = { name: string; price: number; url: string };

export default function Tool() {
  const [rows, setRows] = useState<Row[]>([
    { name: "Competitor A", price: 120, url: "" },
    { name: "Competitor B", price: 135, url: "" },
    { name: "Competitor C", price: 99, url: "" },
  ]);
  const [mine, setMine] = useState(115);

  const upd = (i: number, k: keyof Row, v: string | number) => setRows((r) => r.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const add = () => setRows((r) => [...r, { name: "New", price: 0, url: "" }]);
  const del = (i: number) => setRows((r) => r.filter((_, j) => j !== i));

  const min = Math.min(...rows.map((r) => r.price));
  const avg = rows.length ? rows.reduce((s, r) => s + r.price, 0) / rows.length : 0;
  const suggest = Math.max(0, min - 1);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Manual entry only in demo mode — Shopee doesn't allow scraping without a merchant API key.</div>
      <div><Label>Your price ($)</Label><Input type="number" value={mine} onChange={(e) => setMine(+e.target.value || 0)} className="mt-1 max-w-xs"/></div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_120px_1fr_auto] gap-2">
            <Input value={row.name} onChange={(e) => upd(i, "name", e.target.value)} placeholder="Competitor name"/>
            <Input type="number" value={row.price} onChange={(e) => upd(i, "price", +e.target.value || 0)} placeholder="Price"/>
            <Input value={row.url} onChange={(e) => upd(i, "url", e.target.value)} placeholder="URL (optional)"/>
            <Button size="sm" variant="ghost" onClick={() => del(i)}>✕</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={add}>+ Add competitor</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Min competitor" value={`$${min.toFixed(2)}`}/>
        <Stat label="Avg competitor" value={`$${avg.toFixed(2)}`}/>
        <Stat label="Suggested undercut" value={`$${suggest.toFixed(2)}`} highlight/>
      </div>
      <div className="rounded-lg border p-3 text-sm">
        {mine < min ? <p className="text-emerald-500">✓ You're the cheapest by ${(min - mine).toFixed(2)}</p> : <p className="text-amber-500">⚠ Cheaper competitor by ${(mine - min).toFixed(2)} — consider undercut.</p>}
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}