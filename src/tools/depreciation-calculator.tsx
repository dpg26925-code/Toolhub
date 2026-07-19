import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

type Method = "SL" | "DDB" | "SYD";

export default function DepreciationCalculator() {
  const [cost, setCost] = useState(10000);
  const [salvage, setSalvage] = useState(1000);
  const [life, setLife] = useState(5);
  const [method, setMethod] = useState<Method>("SL");

  const rows = useMemo(() => {
    const out: { year: number; dep: number; acc: number; book: number }[] = [];
    let book = cost;
    let acc = 0;
    const dep0 = (cost - salvage) / life;
    const sydSum = (life * (life + 1)) / 2;
    for (let y = 1; y <= life; y++) {
      let dep = 0;
      if (method === "SL") dep = dep0;
      else if (method === "DDB") { dep = Math.max(0, Math.min(book * (2 / life), book - salvage)); }
      else { dep = ((cost - salvage) * (life - y + 1)) / sydSum; }
      book -= dep;
      acc += dep;
      out.push({ year: y, dep, acc, book });
    }
    return out;
  }, [cost, salvage, life, method]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Cost</Label><Input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} className="mt-1" /></div>
        <div><Label>Salvage</Label><Input type="number" value={salvage} onChange={(e) => setSalvage(+e.target.value)} className="mt-1" /></div>
        <div><Label>Life (years)</Label><Input type="number" value={life} onChange={(e) => setLife(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Method</Label>
          <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="SL">Straight-line</option><option value="DDB">Double-declining</option><option value="SYD">Sum-of-years-digits</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="p-2 text-left">Year</th><th className="p-2 text-right">Depreciation</th><th className="p-2 text-right">Accumulated</th><th className="p-2 text-right">Book value</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.year} className="border-t border-border"><td className="p-2">{r.year}</td><td className="p-2 text-right">{fmt(r.dep)}</td><td className="p-2 text-right">{fmt(r.acc)}</td><td className="p-2 text-right">{fmt(r.book)}</td></tr>)}</tbody>
        </table>
      </div>
      <Button size="sm" onClick={() => {
        const csv = "Year,Depreciation,Accumulated,Book Value\n" + rows.map((r) => [r.year, r.dep.toFixed(2), r.acc.toFixed(2), r.book.toFixed(2)].join(",")).join("\n");
        copy(csv); toast.success("CSV copied");
      }}>Copy CSV</Button>
    </div>
  );
}