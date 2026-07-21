import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";
import { US_FEDERAL_BRACKETS, US_STATE_RATE, FilingStatus, calcProgressive } from "./_tax";

export default function IncomeTaxCalculator() {
  const [income, setIncome] = useState(85000);
  const [status, setStatus] = useState<FilingStatus>("single");
  const [year, setYear] = useState<"2024" | "2025">("2025");
  const [state, setState] = useState<string>("CA");

  const r = useMemo(() => {
    const brackets = US_FEDERAL_BRACKETS[year][status];
    const fed = calcProgressive(income, brackets);
    const stateRate = US_STATE_RATE[state] ?? 0;
    const stateTax = income * (stateRate / 100);
    const total = fed.total + stateTax;
    const eff = income > 0 ? (total / income) * 100 : 0;
    return { fed, stateTax, stateRate, total, eff, brackets };
  }, [income, status, year, state]);

  const maxBracket = Math.max(...r.brackets.map((b) => b.up ?? income * 1.5), income);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><Label>Taxable income ($)</Label><Input type="number" min={0} value={income} onChange={(e) => setIncome(Math.max(0, +e.target.value))} className="mt-1" /></div>
        <div>
          <Label>Filing status</Label>
          <select value={status} onChange={(e) => setStatus(e.target.value as FilingStatus)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="single">Single</option>
            <option value="married">Married filing jointly</option>
            <option value="hoh">Head of household</option>
          </select>
        </div>
        <div>
          <Label>Tax year</Label>
          <select value={year} onChange={(e) => setYear(e.target.value as any)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
        <div>
          <Label>State</Label>
          <select value={state} onChange={(e) => setState(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {Object.keys(US_STATE_RATE).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Federal tax" v={`$${fmt(r.fed.total, 0)}`} />
        <S label={`State tax (${r.stateRate}%)`} v={`$${fmt(r.stateTax, 0)}`} />
        <S label="Total tax" v={`$${fmt(r.total, 0)}`} h />
        <S label="Effective rate" v={`${fmt(r.eff, 2)}%`} />
      </div>

      <div className="rounded-xl border border-border p-4 space-y-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Bracket breakdown</div>
        <div className="space-y-2">
          {r.brackets.map((b, i) => {
            const from = i === 0 ? 0 : (r.brackets[i - 1].up ?? 0);
            const to = b.up ?? maxBracket;
            const hit = income > from;
            const filled = Math.max(0, Math.min(income, to) - from);
            const span = to - from || 1;
            const pct = (filled / span) * 100;
            const row = r.fed.rows[i];
            return (
              <div key={i} className={`text-xs ${hit ? "" : "opacity-40"}`}>
                <div className="flex justify-between mb-1">
                  <span>{fmt(from, 0)} – {b.up ? fmt(b.up, 0) : "∞"}</span>
                  <span>{b.rate}% · {row ? `$${fmt(row.tax, 0)}` : "—"}</span>
                </div>
                <div className="h-3 rounded bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          Marginal rate: <span className="font-semibold text-foreground">{r.fed.marginal}%</span> · You can earn <span className="font-semibold text-foreground">${fmt(r.fed.roomToNext, 0)}</span> more before jumping to the next bracket.
        </div>
      </div>

      <p className="text-xs text-muted-foreground">For estimation only. Consult a tax professional. Excludes FICA, credits, deductions and AMT.</p>
      <Button size="sm" onClick={() => { copy(`Income $${fmt(income, 0)} → Tax $${fmt(r.total, 0)} (${fmt(r.eff, 2)}% eff, ${r.fed.marginal}% marginal)`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}