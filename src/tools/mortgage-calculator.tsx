import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";
import { monthlyPayment } from "./loan-amortization";

export default function MortgageCalculator() {
  const [price, setPrice] = useState(400000);
  const [down, setDown] = useState(80000);
  const [rate, setRate] = useState(6.75);
  const [years, setYears] = useState(30);
  const [taxAnnual, setTaxAnnual] = useState(4800);
  const [insAnnual, setInsAnnual] = useState(1200);
  const [hoa, setHoa] = useState(0);
  const [showFull, setShowFull] = useState(true);

  const r = useMemo(() => {
    const loan = price - down;
    const pi = monthlyPayment(loan, rate, years * 12);
    const tax = taxAnnual / 12;
    const ins = insAnnual / 12;
    const total = pi + tax + ins + hoa;
    const interest = pi * years * 12 - loan;
    return { loan, pi, tax, ins, total, interest };
  }, [price, down, rate, years, taxAnnual, insAnnual, hoa]);

  const parts = [
    { label: "Principal & Interest", val: r.pi, color: "bg-primary" },
    { label: "Property tax", val: r.tax, color: "bg-emerald-500" },
    { label: "Insurance", val: r.ins, color: "bg-amber-500" },
    { label: "HOA", val: hoa, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Home price</Label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-1" /></div>
        <div><Label>Down payment</Label><Input type="number" value={down} onChange={(e) => setDown(+e.target.value)} className="mt-1" /></div>
        <div><Label>Rate (%)</Label><Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
        <div><Label>Term (years)</Label><Input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="mt-1" /></div>
        <div><Label>Property tax / yr</Label><Input type="number" value={taxAnnual} onChange={(e) => setTaxAnnual(+e.target.value)} className="mt-1" /></div>
        <div><Label>Insurance / yr</Label><Input type="number" value={insAnnual} onChange={(e) => setInsAnnual(+e.target.value)} className="mt-1" /></div>
        <div><Label>HOA / mo</Label><Input type="number" value={hoa} onChange={(e) => setHoa(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant={showFull ? "default" : "outline"} onClick={() => setShowFull(true)}>Full PITI+HOA</Button>
        <Button size="sm" variant={!showFull ? "default" : "outline"} onClick={() => setShowFull(false)}>P&I only</Button>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Monthly (total)" v={fmt(showFull ? r.total : r.pi)} h />
        <S label="Loan amount" v={fmt(r.loan)} />
        <S label="Total interest" v={fmt(r.interest)} />
        <S label="Down %" v={`${fmt((down / price) * 100, 1)}%`} />
      </div>
      <div className="space-y-2">
        {parts.filter(p => p.val > 0).map((p) => {
          const pct = showFull ? (p.val / r.total) * 100 : (p.val / r.pi) * 100;
          return (
            <div key={p.label}>
              <div className="mb-1 flex justify-between text-xs"><span>{p.label}</span><span>{fmt(p.val)}</span></div>
              <div className="h-3 rounded bg-muted overflow-hidden"><div className={`h-full ${p.color}`} style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>
      <Button size="sm" onClick={() => { copy(`Monthly ${fmt(r.total)} on ${fmt(r.loan)} @ ${rate}%`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}