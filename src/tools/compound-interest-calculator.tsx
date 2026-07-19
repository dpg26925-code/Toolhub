import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_trading";
import { LineChart } from "./_chart";

export default function CompoundInterestCalculator() {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(3);
  const [months, setMonths] = useState(24);

  const rows = useMemo(() => {
    const r = rate / 100;
    let bal = initial;
    const out = [{ month: 0, deposit: initial, interest: 0, balance: bal }];
    for (let m = 1; m <= months; m++) {
      const interest = bal * r;
      bal = bal + interest + monthly;
      out.push({ month: m, deposit: monthly, interest, balance: bal });
    }
    return out;
  }, [initial, monthly, rate, months]);

  const last = rows[rows.length - 1];
  const contributions = initial + monthly * months;
  const profit = last.balance - contributions;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Initial ($)</Label><Input type="number" value={initial} onChange={(e) => setInitial(+e.target.value)} className="mt-1" /></div>
        <div><Label>Monthly deposit ($)</Label><Input type="number" value={monthly} onChange={(e) => setMonthly(+e.target.value)} className="mt-1" /></div>
        <div><Label>Monthly return %</Label><Input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
        <div><Label>Duration (months)</Label><Input type="number" value={months} onChange={(e) => setMonths(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div><div className="text-xs uppercase text-muted-foreground">Final balance</div><div className="mt-1 text-lg font-semibold text-primary">${fmt(last.balance)}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Total contributions</div><div className="mt-1 font-semibold">${fmt(contributions)}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Total profit</div><div className="mt-1 font-semibold">${fmt(profit)}</div></div>
        </div>
        <div className="mt-4"><LineChart series={[{ name: "Balance", color: "#3b82f6", data: rows.map((r) => r.balance) }]} height={200} /></div>
        <Button size="sm" className="mt-3" variant="outline" onClick={() => {
          const csv = "month,deposit,interest,balance\n" + rows.map((r) => `${r.month},${fmt(r.deposit)},${fmt(r.interest)},${fmt(r.balance)}`).join("\n");
          copy(csv); toast.success("CSV copied");
        }}>Copy month-by-month CSV</Button>
      </div>
      <div className="max-h-72 overflow-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead className="bg-secondary sticky top-0"><tr><th className="p-2 text-left">Month</th><th className="p-2 text-right">Deposit</th><th className="p-2 text-right">Interest</th><th className="p-2 text-right">Balance</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.month} className="border-t border-border/40"><td className="p-2">{r.month}</td><td className="p-2 text-right">${fmt(r.deposit)}</td><td className="p-2 text-right">${fmt(r.interest)}</td><td className="p-2 text-right font-medium">${fmt(r.balance)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}