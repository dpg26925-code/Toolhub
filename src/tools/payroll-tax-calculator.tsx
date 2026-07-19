import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

type Bracket = { up: number | null; rate: number };
const REGIMES: Record<string, Bracket[]> = {
  "US Federal 2024 (single)": [
    { up: 11600, rate: 10 }, { up: 47150, rate: 12 }, { up: 100525, rate: 22 },
    { up: 191950, rate: 24 }, { up: 243725, rate: 32 }, { up: 609350, rate: 35 }, { up: null, rate: 37 },
  ],
  "UK 2024/25": [
    { up: 12570, rate: 0 }, { up: 50270, rate: 20 }, { up: 125140, rate: 40 }, { up: null, rate: 45 },
  ],
  "Vietnam PIT (resident)": [
    { up: 60_000_000, rate: 5 }, { up: 120_000_000, rate: 10 }, { up: 216_000_000, rate: 15 },
    { up: 384_000_000, rate: 20 }, { up: 624_000_000, rate: 25 }, { up: 960_000_000, rate: 30 }, { up: null, rate: 35 },
  ],
};

function calc(taxable: number, br: Bracket[]) {
  const rows: { from: number; to: number; rate: number; tax: number }[] = [];
  let prev = 0, total = 0;
  for (const b of br) {
    const cap = b.up ?? Infinity;
    if (taxable <= prev) break;
    const inThis = Math.min(taxable, cap) - prev;
    const tax = (inThis * b.rate) / 100;
    rows.push({ from: prev, to: cap === Infinity ? taxable : cap, rate: b.rate, tax });
    total += tax;
    prev = cap;
    if (taxable <= cap) break;
  }
  return { rows, total };
}

export default function PayrollTaxCalculator() {
  const [gross, setGross] = useState(90000);
  const [deductions, setDeductions] = useState(0);
  const [regime, setRegime] = useState<keyof typeof REGIMES>("US Federal 2024 (single)");
  const r = useMemo(() => {
    const taxable = Math.max(0, gross - deductions);
    const c = calc(taxable, REGIMES[regime]);
    const net = gross - c.total;
    const eff = gross > 0 ? (c.total / gross) * 100 : 0;
    return { taxable, ...c, net, eff };
  }, [gross, deductions, regime]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Gross salary (annual)</Label><Input type="number" value={gross} onChange={(e) => setGross(+e.target.value)} className="mt-1" /></div>
        <div><Label>Pre-tax deductions</Label><Input type="number" value={deductions} onChange={(e) => setDeductions(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Tax regime</Label>
          <select value={regime} onChange={(e) => setRegime(e.target.value as keyof typeof REGIMES)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {Object.keys(REGIMES).map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Taxable" v={fmt(r.taxable, 0)} />
        <S label="Tax total" v={fmt(r.total, 0)} />
        <S label="Net" v={fmt(r.net, 0)} h />
        <S label="Effective" v={`${fmt(r.eff, 2)}%`} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="p-2 text-left">Bracket</th><th className="p-2 text-right">Rate</th><th className="p-2 text-right">Tax</th></tr></thead>
          <tbody>
            {r.rows.map((row, i) => (
              <tr key={i} className="border-t border-border"><td className="p-2">{fmt(row.from, 0)} – {fmt(row.to, 0)}</td><td className="p-2 text-right">{row.rate}%</td><td className="p-2 text-right">{fmt(row.tax, 0)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button size="sm" onClick={() => { copy(`Gross ${fmt(gross, 0)} → Net ${fmt(r.net, 0)} (tax ${fmt(r.total, 0)})`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}