import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";
import { monthlyPayment } from "./loan-amortization";

export default function LoanCalculator() {
  const [amount, setAmount] = useState(20000);
  const [rate, setRate] = useState(7.5);
  const [months, setMonths] = useState(60);
  const r = useMemo(() => {
    const pmt = monthlyPayment(amount, rate, months);
    const totalPay = pmt * months;
    const interest = totalPay - amount;
    return { pmt, totalPay, interest };
  }, [amount, rate, months]);
  const pctInterest = r.totalPay > 0 ? (r.interest / r.totalPay) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Loan amount</Label><Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="mt-1" /></div>
        <div><Label>Annual rate (%)</Label><Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
        <div><Label>Term (months)</Label><Input type="number" value={months} onChange={(e) => setMonths(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[12, 24, 36, 60, 84, 120].map((m) => <Button key={m} size="sm" variant="outline" onClick={() => setMonths(m)}>{m}mo</Button>)}
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-3 text-sm">
        <S label="Monthly payment" v={fmt(r.pmt)} h />
        <S label="Total interest" v={fmt(r.interest)} />
        <S label="Total paid" v={fmt(r.totalPay)} />
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-1">Principal vs interest</div>
        <div className="flex h-4 rounded overflow-hidden">
          <div className="bg-primary" style={{ width: `${100 - pctInterest}%` }} title="Principal" />
          <div className="bg-destructive/70" style={{ width: `${pctInterest}%` }} title="Interest" />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Principal {fmt(amount)}</span><span>Interest {fmt(r.interest)}</span>
        </div>
      </div>
      <Button size="sm" onClick={() => { copy(`Monthly ${fmt(r.pmt)} · Interest ${fmt(r.interest)}`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}