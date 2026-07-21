import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";
import { monthlyPayment } from "./loan-amortization";

type DownMode = "amount" | "percent";

export default function MortgageCalculator() {
  const [price, setPrice] = useState(400000);
  const [downMode, setDownMode] = useState<DownMode>("amount");
  const [downAmount, setDownAmount] = useState(80000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.75);
  const [years, setYears] = useState(30);
  const [taxAnnual, setTaxAnnual] = useState(4800);
  const [insAnnual, setInsAnnual] = useState(1200);
  const [hoa, setHoa] = useState(0);
  const [pmiRate, setPmiRate] = useState(0.55); // % of loan/yr
  const [showFull, setShowFull] = useState(true);

  const down = downMode === "amount" ? downAmount : (price * downPct) / 100;

  const r = useMemo(() => {
    const loan = Math.max(0, price - down);
    const pi = monthlyPayment(loan, rate, years * 12);
    const tax = taxAnnual / 12;
    const ins = insAnnual / 12;
    const downPercentActual = price > 0 ? (down / price) * 100 : 0;
    const pmi = downPercentActual < 20 ? (loan * pmiRate / 100) / 12 : 0;
    const total = pi + tax + ins + hoa + pmi;
    const totalMonths = years * 12;
    const totalPaid = pi * totalMonths;
    const interest = totalPaid - loan;
    return { loan, pi, tax, ins, pmi, total, interest, downPercentActual, totalPaid };
  }, [price, down, rate, years, taxAnnual, insAnnual, hoa, pmiRate]);

  // Yearly amortization summary
  const yearly = useMemo(() => {
    const monthsN = years * 12;
    const rM = rate / 100 / 12;
    let bal = r.loan;
    const rows: { year: number; interest: number; principal: number; balance: number }[] = [];
    for (let y = 1; y <= years; y++) {
      let yi = 0, yp = 0;
      for (let m = 0; m < 12; m++) {
        const idx = (y - 1) * 12 + m + 1;
        if (idx > monthsN || bal <= 0) break;
        const interest = bal * rM;
        const principal = Math.min(bal, r.pi - interest);
        bal -= principal;
        yi += interest;
        yp += principal;
      }
      rows.push({ year: y, interest: yi, principal: yp, balance: Math.max(0, bal) });
    }
    return rows;
  }, [r.loan, r.pi, rate, years]);

  const parts = [
    { label: "Principal & Interest", val: r.pi, color: "hsl(var(--primary))", tw: "bg-primary" },
    { label: "Property tax", val: r.tax, color: "rgb(16 185 129)", tw: "bg-emerald-500" },
    { label: "Insurance", val: r.ins, color: "rgb(245 158 11)", tw: "bg-amber-500" },
    { label: "HOA", val: hoa, color: "rgb(168 85 247)", tw: "bg-purple-500" },
    { label: "PMI", val: r.pmi, color: "rgb(239 68 68)", tw: "bg-red-500" },
  ].filter((p) => p.val > 0);

  const denom = showFull ? r.total : r.pi;
  // Pie chart calculation
  let acc = 0;
  const pieSegs = parts.map((p) => {
    const share = p.val / denom;
    const start = acc; acc += share;
    const startA = start * Math.PI * 2 - Math.PI / 2;
    const endA = acc * Math.PI * 2 - Math.PI / 2;
    const large = share > 0.5 ? 1 : 0;
    const x1 = 60 + 55 * Math.cos(startA);
    const y1 = 60 + 55 * Math.sin(startA);
    const x2 = 60 + 55 * Math.cos(endA);
    const y2 = 60 + 55 * Math.sin(endA);
    return { ...p, d: `M 60 60 L ${x1} ${y1} A 55 55 0 ${large} 1 ${x2} ${y2} Z` };
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Home price</Label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Down payment</Label>
          <div className="mt-1 flex gap-2">
            <Input
              type="number"
              value={downMode === "amount" ? downAmount : downPct}
              onChange={(e) => downMode === "amount" ? setDownAmount(+e.target.value) : setDownPct(+e.target.value)}
            />
            <Button size="sm" variant="outline" onClick={() => setDownMode((m) => m === "amount" ? "percent" : "amount")}>
              {downMode === "amount" ? "$" : "%"}
            </Button>
          </div>
        </div>
        <div><Label>Rate (%)</Label><Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
        <div><Label>Term (years)</Label><Input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="mt-1" /></div>
        <div><Label>Property tax / yr</Label><Input type="number" value={taxAnnual} onChange={(e) => setTaxAnnual(+e.target.value)} className="mt-1" /></div>
        <div><Label>Insurance / yr</Label><Input type="number" value={insAnnual} onChange={(e) => setInsAnnual(+e.target.value)} className="mt-1" /></div>
        <div><Label>HOA / mo</Label><Input type="number" value={hoa} onChange={(e) => setHoa(+e.target.value)} className="mt-1" /></div>
        <div><Label>PMI rate (%/yr)</Label><Input type="number" step="0.01" value={pmiRate} onChange={(e) => setPmiRate(+e.target.value)} className="mt-1" /></div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={showFull ? "default" : "outline"} onClick={() => setShowFull(true)}>Full PITI+HOA{r.pmi > 0 ? "+PMI" : ""}</Button>
        <Button size="sm" variant={!showFull ? "default" : "outline"} onClick={() => setShowFull(false)}>P&I only</Button>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm sm:grid-cols-4">
        <S label="Monthly (total)" v={fmt(showFull ? r.total : r.pi)} h />
        <S label="Loan amount" v={fmt(r.loan)} />
        <S label="Total interest" v={fmt(r.interest)} />
        <S label="Total cost" v={fmt(r.totalPaid + down)} />
        <S label="Down payment" v={`${fmt(down)} (${fmt(r.downPercentActual, 1)}%)`} />
        <S label="Payoff date" v={new Date(new Date().setFullYear(new Date().getFullYear() + years)).toLocaleDateString(undefined, { year: "numeric", month: "short" })} />
        {r.pmi > 0 && <S label="PMI /mo" v={fmt(r.pmi)} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <div className="mb-3 text-sm font-semibold">Monthly payment breakdown</div>
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 120 120" width="140" height="140">
              {pieSegs.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
              <circle cx="60" cy="60" r="30" fill="hsl(var(--background))" />
              <text x="60" y="58" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">Monthly</text>
              <text x="60" y="70" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">{fmt(denom, 0)}</text>
            </svg>
            <div className="flex-1 space-y-1 text-xs">
              {parts.map((p) => (
                <div key={p.label} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><span className={`inline-block h-3 w-3 rounded ${p.tw}`} />{p.label}</span>
                  <span className="font-medium">{fmt(p.val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="mb-3 text-sm font-semibold">Yearly amortization summary</div>
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/80 text-muted-foreground">
                <tr>
                  <th className="p-1 text-left">Yr</th>
                  <th className="p-1 text-right">Principal</th>
                  <th className="p-1 text-right">Interest</th>
                  <th className="p-1 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {yearly.map((row) => (
                  <tr key={row.year} className="border-t border-border">
                    <td className="p-1">{row.year}</td>
                    <td className="p-1 text-right">{fmt(row.principal, 0)}</td>
                    <td className="p-1 text-right">{fmt(row.interest, 0)}</td>
                    <td className="p-1 text-right">{fmt(row.balance, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Button size="sm" onClick={() => { copy(`Monthly ${fmt(r.total)} on ${fmt(r.loan)} @ ${rate}% (${years}y)`); toast.success("Copied"); }}>Copy summary</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}