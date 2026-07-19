import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

const BENCH = [
  { label: "SaaS", gross: 75, op: 20, net: 15 },
  { label: "Retail", gross: 30, op: 8, net: 4 },
  { label: "Manufacturing", gross: 25, op: 10, net: 6 },
  { label: "Restaurant", gross: 65, op: 12, net: 5 },
];

export default function ProfitMarginCalculator() {
  const [revenue, setRevenue] = useState(500000);
  const [cogs, setCogs] = useState(200000);
  const [opex, setOpex] = useState(150000);
  const [tax, setTax] = useState(20);

  const r = useMemo(() => {
    const gross = revenue - cogs;
    const grossM = revenue > 0 ? (gross / revenue) * 100 : 0;
    const op = gross - opex;
    const opM = revenue > 0 ? (op / revenue) * 100 : 0;
    const taxAmt = Math.max(0, op) * (tax / 100);
    const net = op - taxAmt;
    const netM = revenue > 0 ? (net / revenue) * 100 : 0;
    return { gross, grossM, op, opM, net, netM };
  }, [revenue, cogs, opex, tax]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Revenue</Label><Input type="number" value={revenue} onChange={(e) => setRevenue(+e.target.value)} className="mt-1" /></div>
        <div><Label>COGS</Label><Input type="number" value={cogs} onChange={(e) => setCogs(+e.target.value)} className="mt-1" /></div>
        <div><Label>Operating expenses</Label><Input type="number" value={opex} onChange={(e) => setOpex(+e.target.value)} className="mt-1" /></div>
        <div><Label>Tax rate (%)</Label><Input type="number" step="0.1" value={tax} onChange={(e) => setTax(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-3 text-sm">
        <S label="Gross margin" v={`${fmt(r.grossM, 2)}%`} sub={fmt(r.gross)} />
        <S label="Operating margin" v={`${fmt(r.opM, 2)}%`} sub={fmt(r.op)} />
        <S label="Net margin" v={`${fmt(r.netM, 2)}%`} sub={fmt(r.net)} h />
      </div>
      <div>
        <div className="text-sm font-semibold mb-2">Industry benchmarks (net margin)</div>
        <div className="space-y-2">
          {BENCH.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex justify-between text-xs"><span>{b.label}</span><span>{b.net}%</span></div>
              <div className="relative h-3 rounded bg-muted overflow-hidden">
                <div className="h-full bg-muted-foreground/40" style={{ width: `${b.net}%` }} />
                {r.netM > 0 && r.netM < 100 && <div className="absolute top-0 h-full w-0.5 bg-primary" style={{ left: `${Math.min(100, r.netM)}%` }} title={`You: ${fmt(r.netM, 1)}%`} />}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Vertical line = your net margin ({fmt(r.netM, 2)}%).</p>
      </div>
      <Button size="sm" onClick={() => { copy(`Gross ${fmt(r.grossM, 2)}% · Op ${fmt(r.opM, 2)}% · Net ${fmt(r.netM, 2)}%`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, sub, h }: { label: string; v: string; sub?: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div>{sub && <div className="text-xs text-muted-foreground">{sub}</div>}</div>;
}