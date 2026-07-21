import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

type Region = "Philippines" | "Vietnam" | "Brazil" | "Argentina" | "Custom";
const NOTES: Record<Region, string> = {
  Philippines: "Mandatory 13th month: total basic salary earned ÷ 12. Excludes overtime & allowances.",
  Vietnam: "Not legally required — customarily one month's salary, pro-rated by months worked.",
  Brazil: "Décimo terceiro: monthly salary × months worked ÷ 12; paid in two halves (Nov 30 & Dec 20).",
  Argentina: "Aguinaldo (SAC): half of highest monthly salary of the semester, paid in June & December.",
  Custom: "Custom formula: (monthly × months worked) − (daily rate × unpaid days) + allowances.",
};

export default function ThirteenthMonthPay() {
  const [region, setRegion] = useState<Region>("Philippines");
  const [monthly, setMonthly] = useState(1500);
  const [months, setMonths] = useState(12);
  const [unpaid, setUnpaid] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [daysPerMonth, setDaysPerMonth] = useState(22);

  const r = useMemo(() => {
    const daily = daysPerMonth > 0 ? monthly / daysPerMonth : 0;
    const totalEarned = monthly * months - daily * unpaid;
    let base = 0;
    if (region === "Philippines" || region === "Brazil") base = totalEarned / 12;
    else if (region === "Argentina") base = monthly / 2; // half of highest month, per semester
    else if (region === "Vietnam") base = (totalEarned / 12);
    else base = totalEarned / 12;
    const amount = base + allowances;
    const avg = amount / 12;
    return { daily, totalEarned, base, amount, avg };
  }, [region, monthly, months, unpaid, allowances, daysPerMonth]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(NOTES) as Region[]).map((k) => (
          <Button key={k} size="sm" variant={region === k ? "default" : "outline"} onClick={() => setRegion(k)}>{k}</Button>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">{NOTES[region]}</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div><Label>Monthly salary ($)</Label><Input type="number" min={0} value={monthly} onChange={(e) => setMonthly(Math.max(0, +e.target.value))} className="mt-1" /></div>
        <div><Label>Months worked</Label><Input type="number" min={0} max={12} step="0.5" value={months} onChange={(e) => setMonths(Math.min(12, Math.max(0, +e.target.value)))} className="mt-1" /></div>
        <div><Label>Unpaid days</Label><Input type="number" min={0} value={unpaid} onChange={(e) => setUnpaid(Math.max(0, +e.target.value))} className="mt-1" /></div>
        <div><Label>Working days / month</Label><Input type="number" min={1} max={31} value={daysPerMonth} onChange={(e) => setDaysPerMonth(Math.max(1, +e.target.value))} className="mt-1" /></div>
        <div><Label>Bonus / allowances</Label><Input type="number" min={0} value={allowances} onChange={(e) => setAllowances(Math.max(0, +e.target.value))} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Daily rate" v={`$${fmt(r.daily)}`} />
        <S label="Basic total earned" v={`$${fmt(r.totalEarned)}`} />
        <S label="13th month amount" v={`$${fmt(r.amount)}`} h />
        <S label="Effective monthly avg" v={`$${fmt(r.avg)}`} />
      </div>
      <p className="text-xs text-muted-foreground">For estimation only. Regional labor laws vary — consult HR or a local tax professional.</p>
      <Button size="sm" onClick={() => { copy(`${region} 13th month: $${fmt(r.amount)} (${months} months worked, ${unpaid} unpaid days)`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}