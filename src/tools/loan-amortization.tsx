import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt } from "./_acc";

export function monthlyPayment(P: number, annualRate: number, months: number) {
  const r = annualRate / 100 / 12;
  if (r === 0) return months > 0 ? P / months : 0;
  return (P * r) / (1 - Math.pow(1 + r, -months));
}

function schedule(P: number, annualRate: number, months: number, extra = 0) {
  const r = annualRate / 100 / 12;
  const pmt = monthlyPayment(P, annualRate, months);
  const rows: { m: number; interest: number; principal: number; balance: number }[] = [];
  let bal = P;
  for (let m = 1; m <= months && bal > 0.01; m++) {
    const interest = bal * r;
    let principal = pmt - interest + extra;
    if (principal > bal) principal = bal;
    bal -= principal;
    rows.push({ m, interest, principal, balance: Math.max(0, bal) });
  }
  return { pmt, rows };
}

function addMonths(d: Date, m: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
}

export default function LoanAmortization() {
  const [amount, setAmount] = useState(200000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [extra, setExtra] = useState(0);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));

  const start = useMemo(() => new Date(startDate), [startDate]);
  const base = useMemo(() => schedule(amount, rate, years * 12, 0), [amount, rate, years]);
  const withExtra = useMemo(() => schedule(amount, rate, years * 12, extra), [amount, rate, years, extra]);
  const totalInterest = base.rows.reduce((s, r) => s + r.interest, 0);
  const totalExtraInterest = withExtra.rows.reduce((s, r) => s + r.interest, 0);
  const saved = totalInterest - totalExtraInterest;
  const monthsSaved = base.rows.length - withExtra.rows.length;
  const payoffDate = addMonths(start, withExtra.rows.length);

  // Balance chart data (sample every N months for perf)
  const step = Math.max(1, Math.floor(withExtra.rows.length / 120));
  const points = withExtra.rows.filter((_, i) => i % step === 0 || i === withExtra.rows.length - 1);
  const W = 600, H = 180, pad = 24;
  const maxB = Math.max(1, amount);
  const xy = (i: number, v: number) => {
    const x = pad + (i / Math.max(1, points.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / maxB) * (H - pad * 2);
    return `${x},${y}`;
  };
  const path = points.map((p, i) => xy(i, p.balance)).join(" ");

  const downloadCSV = () => {
    const header = "Payment #,Date,Interest,Principal,Balance\n";
    const body = withExtra.rows.map((r) => {
      const d = addMonths(start, r.m).toISOString().slice(0, 10);
      return [r.m, d, r.interest.toFixed(2), r.principal.toFixed(2), r.balance.toFixed(2)].join(",");
    }).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "amortization.csv"; a.click();
    URL.revokeObjectURL(a.href);
    toast.success("CSV downloaded");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-5">
        <div><Label>Loan amount</Label><Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="mt-1" /></div>
        <div><Label>Rate (% annual)</Label><Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
        <div><Label>Term (years)</Label><Input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="mt-1" /></div>
        <div><Label>Extra / month</Label><Input type="number" value={extra} onChange={(e) => setExtra(+e.target.value)} className="mt-1" /></div>
        <div><Label>Start date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Monthly payment" v={fmt(base.pmt)} h />
        <S label="Total interest" v={fmt(totalExtraInterest)} />
        <S label="Interest saved" v={extra > 0 ? fmt(saved) : "—"} />
        <S label="Payoff date" v={payoffDate.toLocaleDateString(undefined, { year: "numeric", month: "short" })} hint={extra > 0 ? `${monthsSaved} mo earlier` : undefined} />
      </div>

      <div className="rounded-xl border border-border p-4">
        <div className="mb-2 text-sm font-semibold">Balance over time</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="currentColor" opacity="0.2" />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="currentColor" opacity="0.2" />
          <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="2" points={path} />
          <text x={pad} y={pad - 4} fontSize="9" fill="currentColor" opacity="0.6">{fmt(maxB, 0)}</text>
        </svg>
      </div>

      <Button size="sm" onClick={downloadCSV}>Download CSV</Button>

      <div className="overflow-x-auto rounded-xl border border-border max-h-96">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-right">Interest</th>
              <th className="p-2 text-right">Principal</th>
              <th className="p-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {withExtra.rows.slice(0, 480).map((r) => (
              <tr key={r.m} className="border-t border-border">
                <td className="p-2">{r.m}</td>
                <td className="p-2">{addMonths(start, r.m).toISOString().slice(0, 7)}</td>
                <td className="p-2 text-right">{fmt(r.interest)}</td>
                <td className="p-2 text-right">{fmt(r.principal)}</td>
                <td className="p-2 text-right">{fmt(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function S({ label, v, h, hint }: { label: string; v: string; h?: boolean; hint?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div>
      {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}