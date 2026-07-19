import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt } from "./_acc";

export function monthlyPayment(P: number, annualRate: number, months: number) {
  const r = annualRate / 100 / 12;
  if (r === 0) return P / months;
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

export default function LoanAmortization() {
  const [amount, setAmount] = useState(200000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [extra, setExtra] = useState(0);

  const base = useMemo(() => schedule(amount, rate, years * 12, 0), [amount, rate, years]);
  const withExtra = useMemo(() => schedule(amount, rate, years * 12, extra), [amount, rate, years, extra]);
  const totalInterest = base.rows.reduce((s, r) => s + r.interest, 0);
  const totalExtraInterest = withExtra.rows.reduce((s, r) => s + r.interest, 0);
  const saved = totalInterest - totalExtraInterest;
  const monthsSaved = base.rows.length - withExtra.rows.length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Loan amount</Label><Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="mt-1" /></div>
        <div><Label>Rate (% annual)</Label><Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
        <div><Label>Term (years)</Label><Input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="mt-1" /></div>
        <div><Label>Extra / month</Label><Input type="number" value={extra} onChange={(e) => setExtra(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Monthly payment" v={fmt(base.pmt)} h />
        <S label="Total interest" v={fmt(totalInterest)} />
        <S label="Interest saved" v={extra > 0 ? fmt(saved) : "—"} />
        <S label="Months saved" v={extra > 0 ? `${monthsSaved}` : "—"} />
      </div>
      <Button size="sm" onClick={() => {
        const csv = "Month,Interest,Principal,Balance\n" + withExtra.rows.map((r) => [r.m, r.interest.toFixed(2), r.principal.toFixed(2), r.balance.toFixed(2)].join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "amortization.csv"; a.click();
        toast.success("CSV downloaded");
      }}>Download CSV</Button>
      <div className="overflow-x-auto rounded-xl border border-border max-h-96">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 text-xs uppercase text-muted-foreground"><tr><th className="p-2 text-left">#</th><th className="p-2 text-right">Interest</th><th className="p-2 text-right">Principal</th><th className="p-2 text-right">Balance</th></tr></thead>
          <tbody>{withExtra.rows.slice(0, 360).map((r) => <tr key={r.m} className="border-t border-border"><td className="p-2">{r.m}</td><td className="p-2 text-right">{fmt(r.interest)}</td><td className="p-2 text-right">{fmt(r.principal)}</td><td className="p-2 text-right">{fmt(r.balance)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}