import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";
import { US_FEDERAL_BRACKETS, US_STATE_RATE, FilingStatus, calcProgressive } from "./_tax";

type Freq = "weekly" | "biweekly" | "semimonthly" | "monthly";
const PERIODS: Record<Freq, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };
const HOURS: Record<Freq, number> = { weekly: 40, biweekly: 80, semimonthly: 86.67, monthly: 173.33 };

export default function PaycheckCalculator() {
  const [gross, setGross] = useState(3000);
  const [freq, setFreq] = useState<Freq>("biweekly");
  const [status, setStatus] = useState<FilingStatus>("single");
  const [state, setState] = useState<string>("CA");
  const [preTax, setPreTax] = useState(200);
  const [postTax, setPostTax] = useState(0);

  const r = useMemo(() => {
    const periods = PERIODS[freq];
    const grossAnnual = gross * periods;
    const preTaxAnnual = preTax * periods;
    const postTaxAnnual = postTax * periods;
    const taxable = Math.max(0, grossAnnual - preTaxAnnual);
    const federal = calcProgressive(taxable, US_FEDERAL_BRACKETS["2025"][status]).total;
    const stateTax = taxable * ((US_STATE_RATE[state] ?? 0) / 100);
    const ss = Math.min(grossAnnual, 168600) * 0.062;
    const medicare = grossAnnual * 0.0145;
    const fica = ss + medicare;
    const totalTaxes = federal + stateTax + fica;
    const netAnnual = grossAnnual - preTaxAnnual - totalTaxes - postTaxAnnual;
    const net = netAnnual / periods;
    const eff = HOURS[freq] > 0 ? net / HOURS[freq] : 0;
    return {
      periods, grossAnnual,
      federal: federal / periods,
      stateTax: stateTax / periods,
      ss: ss / periods,
      medicare: medicare / periods,
      fica: fica / periods,
      totalTaxes: totalTaxes / periods,
      net, netAnnual, eff, preTax, postTax,
    };
  }, [gross, freq, status, state, preTax, postTax]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div><Label>Gross pay (per period, $)</Label><Input type="number" min={0} value={gross} onChange={(e) => setGross(Math.max(0, +e.target.value))} className="mt-1" /></div>
        <div>
          <Label>Pay frequency</Label>
          <select value={freq} onChange={(e) => setFreq(e.target.value as Freq)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="weekly">Weekly (52)</option>
            <option value="biweekly">Biweekly (26)</option>
            <option value="semimonthly">Semi-monthly (24)</option>
            <option value="monthly">Monthly (12)</option>
          </select>
        </div>
        <div>
          <Label>Filing status</Label>
          <select value={status} onChange={(e) => setStatus(e.target.value as FilingStatus)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="single">Single</option>
            <option value="married">Married filing jointly</option>
            <option value="hoh">Head of household</option>
          </select>
        </div>
        <div>
          <Label>State</Label>
          <select value={state} onChange={(e) => setState(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {Object.keys(US_STATE_RATE).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div><Label>Pre-tax (401k, insurance)</Label><Input type="number" min={0} value={preTax} onChange={(e) => setPreTax(Math.max(0, +e.target.value))} className="mt-1" /></div>
        <div><Label>Post-tax deductions</Label><Input type="number" min={0} value={postTax} onChange={(e) => setPostTax(Math.max(0, +e.target.value))} className="mt-1" /></div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-2 text-sm">
        <Row label="Gross pay" v={gross} />
        <Row label="Pre-tax deductions" v={preTax} neg />
        <Row label="Federal tax" v={r.federal} neg />
        <Row label={`State tax (${US_STATE_RATE[state]}%)`} v={r.stateTax} neg />
        <Row label="Social Security" v={r.ss} neg />
        <Row label="Medicare" v={r.medicare} neg />
        <Row label="Post-tax deductions" v={postTax} neg />
        <div className="border-t border-border pt-2 grid grid-cols-2 gap-3">
          <Row label="Total deductions" v={r.totalTaxes + preTax + postTax} bold />
          <Row label="Net paycheck" v={r.net} bold hi />
        </div>
        <div className="text-xs text-muted-foreground mt-1">Effective hourly rate: <span className="font-semibold text-foreground">${fmt(r.eff)}</span> · Annual net: <span className="font-semibold text-foreground">${fmt(r.netAnnual, 0)}</span></div>
      </div>
      <p className="text-xs text-muted-foreground">For estimation only. Consult a tax professional for personalized advice.</p>
      <Button size="sm" onClick={() => { copy(`Gross $${fmt(gross)} → Net $${fmt(r.net)} (${freq}, annual $${fmt(r.netAnnual, 0)})`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}

function Row({ label, v, neg, bold, hi }: { label: string; v: number; neg?: boolean; bold?: boolean; hi?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-semibold" : ""} ${hi ? "text-primary text-lg" : ""} font-mono`}>{neg ? "−" : ""}${fmt(v)}</span>
    </div>
  );
}