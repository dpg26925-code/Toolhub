import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";
import { US_FEDERAL_BRACKETS, US_STATE_RATE, FilingStatus, calcProgressive } from "./_tax";

export default function PayrollTaxCalculator() {
  const [gross, setGross] = useState(90000);
  const [year, setYear] = useState<"2024" | "2025">("2024");
  const [status, setStatus] = useState<FilingStatus>("single");
  const [state, setState] = useState<keyof typeof US_STATE_RATE>("CA");
  const [allowances, setAllowances] = useState(0);

  const r = useMemo(() => {
    const allowanceValue = allowances * 4700; // approximate personal allowance
    const taxable = Math.max(0, gross - allowanceValue);
    const federal = calcProgressive(taxable, US_FEDERAL_BRACKETS[year][status]);
    const stateRate = US_STATE_RATE[state] ?? 0;
    const stateTax = taxable * (stateRate / 100);
    const ss = Math.min(gross, 168600) * 0.062;
    const medicare = gross * 0.0145 + Math.max(0, gross - 200000) * 0.009;
    const fica = ss + medicare;
    const total = federal.total + stateTax + fica;
    const net = gross - total;
    const eff = gross > 0 ? (total / gross) * 100 : 0;
    return { taxable, federal, stateTax, ss, medicare, fica, total, net, eff };
  }, [gross, year, status, state, allowances]);

  const pieces = [
    { label: "Net pay", v: r.net, color: "hsl(var(--primary))" },
    { label: "Federal", v: r.federal.total, color: "hsl(220 70% 55%)" },
    { label: "State", v: r.stateTax, color: "hsl(180 60% 50%)" },
    { label: "Social Security", v: r.ss, color: "hsl(30 90% 55%)" },
    { label: "Medicare", v: r.medicare, color: "hsl(340 70% 60%)" },
  ].filter((p) => p.v > 0);
  const sum = pieces.reduce((a, b) => a + b.v, 0) || 1;

  // build conic-gradient
  let acc = 0;
  const stops = pieces.map((p) => {
    const start = (acc / sum) * 360;
    acc += p.v;
    const end = (acc / sum) * 360;
    return `${p.color} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div><Label>Gross salary ($)</Label><Input type="number" min={0} value={gross} onChange={(e) => setGross(Math.max(0, +e.target.value))} className="mt-1" /></div>
        <div>
          <Label>Tax year</Label>
          <select value={year} onChange={(e) => setYear(e.target.value as any)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="2024">2024</option>
            <option value="2025">2025</option>
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
          <select value={state} onChange={(e) => setState(e.target.value as any)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {Object.keys(US_STATE_RATE).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div><Label>Allowances</Label><Input type="number" min={0} value={allowances} onChange={(e) => setAllowances(Math.max(0, +e.target.value))} className="mt-1" /></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-xl border border-border bg-secondary/40 p-4 space_y-3">
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <Row label="Gross pay" v={r.gross ?? gross} />
            <Row label="Federal tax" v={r.federal.total} neg />
            <Row label={`State tax (${US_STATE_RATE[state]}%)`} v={r.stateTax} neg />
            <Row label="Social Security (6.2%)" v={r.ss} neg />
            <Row label="Medicare (1.45%)" v={r.medicare} neg />
            <div className="col-span-full border-t border-border pt-2 grid grid-cols-2 gap-3">
              <Row label="Total deductions" v={r.total} bold />
              <Row label="Net pay" v={r.net} bold hi />
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Effective rate: <span className="font-semibold text-foreground">{fmt(r.eff, 2)}%</span></div>
        </div>
        <div className="rounded-xl border border-border p-4 flex flex-col items-center gap-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Breakdown</div>
          <div className="w-40 h-40 rounded-full" style={{ background: `conic-gradient(${stops})` }} />
          <div className="w-full space-y-1 text-xs">
            {pieces.map((p) => (
              <div key={p.label} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{ background: p.color }} />
                <span className="flex-1">{p.label}</span>
                <span className="font-mono">${fmt(p.v, 0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">For estimation only. Actual withholdings depend on W-4, local taxes and benefits — consult a tax professional.</p>
      <Button size="sm" onClick={() => { copy(`Gross $${fmt(gross, 0)} → Net $${fmt(r.net, 0)} (tax $${fmt(r.total, 0)}, ${fmt(r.eff, 1)}% eff.)`); toast.success("Copied"); }}>Copy summary</Button>
    </div>
  );
}

function Row({ label, v, neg, bold, hi }: { label: string; v: number; neg?: boolean; bold?: boolean; hi?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-semibold" : ""} ${hi ? "text-primary text-lg" : ""} font-mono`}>{neg ? "−" : ""}${fmt(v, 0)}</span>
    </div>
  );
}