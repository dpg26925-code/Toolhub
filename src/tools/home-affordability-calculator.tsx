import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmt } from "./_acc";
import { monthlyPayment } from "./loan-amortization";

// Given a max total monthly housing payment (PITI + HOA), solve for max home price.
// Assume tax %/yr and insurance $/yr; iterate because tax scales with price.
function solveMaxPrice(opts: {
  maxPITI: number; downPayment: number; rate: number; term: number;
  taxPct: number; insAnnual: number; hoa: number;
}) {
  const { maxPITI, downPayment, rate, term, taxPct, insAnnual, hoa } = opts;
  const monthsN = term * 12;
  let price = downPayment + 100000; // seed
  for (let i = 0; i < 40; i++) {
    const loan = Math.max(0, price - downPayment);
    const pi = monthlyPayment(loan, rate, monthsN);
    const tax = (price * taxPct / 100) / 12;
    const ins = insAnnual / 12;
    const total = pi + tax + ins + hoa;
    const err = maxPITI - total;
    if (Math.abs(err) < 1) break;
    // adjust price roughly proportional
    price += err * 150;
    if (price < downPayment) price = downPayment;
  }
  const loan = Math.max(0, price - downPayment);
  const pi = monthlyPayment(loan, rate, monthsN);
  const tax = (price * taxPct / 100) / 12;
  const ins = insAnnual / 12;
  return { price, loan, pi, tax, ins, hoa, total: pi + tax + ins + hoa };
}

export default function HomeAffordabilityCalculator() {
  const [income, setIncome] = useState(120000);
  const [debts, setDebts] = useState(500);
  const [down, setDown] = useState(60000);
  const [rate, setRate] = useState(6.75);
  const [term, setTerm] = useState(30);
  const [dtiTarget, setDtiTarget] = useState(36);
  const [taxPct, setTaxPct] = useState(1.1);
  const [insAnnual, setInsAnnual] = useState(1500);
  const [hoa, setHoa] = useState(0);

  const r = useMemo(() => {
    const monthlyIncome = income / 12;
    // 28 rule: housing <= 28% of gross monthly income
    const rule28 = monthlyIncome * 0.28;
    // 36 rule (or custom): total debts (incl housing) <= X% of income
    const ruleTotal = monthlyIncome * (dtiTarget / 100) - debts;
    const maxPITI = Math.max(0, Math.min(rule28, ruleTotal));
    const conservative = solveMaxPrice({ maxPITI: monthlyIncome * 0.25 - debts, downPayment: down, rate, term, taxPct, insAnnual, hoa });
    const recommended = solveMaxPrice({ maxPITI: Math.max(0, rule28 - Math.max(0, debts - (monthlyIncome * 0.08))), downPayment: down, rate, term, taxPct, insAnnual, hoa });
    const max = solveMaxPrice({ maxPITI, downPayment: down, rate, term, taxPct, insAnnual, hoa });
    const totalDebtRatio = ((max.total + debts) / monthlyIncome) * 100;
    return { monthlyIncome, rule28, maxPITI, conservative, recommended, max, totalDebtRatio };
  }, [income, debts, down, rate, term, dtiTarget, taxPct, insAnnual, hoa]);

  // gauge: 0-45% DTI arc
  const dti = Math.max(0, Math.min(45, r.totalDebtRatio));
  const gaugePct = dti / 45;
  const angle = -90 + gaugePct * 180;
  const gaugeColor = dti < 28 ? "text-emerald-500" : dti < 36 ? "text-amber-500" : "text-destructive";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <F l="Annual income" v={income} on={setIncome} />
        <F l="Monthly debt payments" v={debts} on={setDebts} />
        <F l="Down payment saved" v={down} on={setDown} />
        <F l="Interest rate (%)" v={rate} on={setRate} step="0.01" />
        <F l="Loan term (years)" v={term} on={setTerm} />
        <F l="DTI target (%)" v={dtiTarget} on={setDtiTarget} />
        <F l="Property tax (%/yr)" v={taxPct} on={setTaxPct} step="0.01" />
        <F l="Insurance (/yr)" v={insAnnual} on={setInsAnnual} />
        <F l="HOA (/mo)" v={hoa} on={setHoa} />
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm sm:grid-cols-4">
        <S label="Max home price" v={fmt(r.max.price, 0)} h />
        <S label="Max loan amount" v={fmt(r.max.loan, 0)} />
        <S label="Monthly (PITI+HOA)" v={fmt(r.max.total, 0)} />
        <S label="Max housing budget" v={fmt(r.maxPITI, 0)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Range label="Conservative (25% rule)" price={r.conservative.price} monthly={r.conservative.total} tone="text-emerald-600" />
        <Range label="Recommended (28% rule)" price={r.recommended.price} monthly={r.recommended.total} tone="text-primary" />
        <Range label="Maximum (36% DTI)" price={r.max.price} monthly={r.max.total} tone="text-amber-600" />
      </div>

      <div className="rounded-xl border border-border p-4">
        <div className="mb-3 text-sm font-semibold">Debt-to-Income at max price: {fmt(r.totalDebtRatio, 1)}%</div>
        <div className="relative mx-auto" style={{ width: 260, height: 150 }}>
          <svg viewBox="0 0 200 110" width="260" height="150">
            <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="16" />
            <path d="M 10 100 A 90 90 0 0 1 66 26" fill="none" stroke="rgb(16 185 129)" strokeWidth="16" />
            <path d="M 66 26 A 90 90 0 0 1 134 26" fill="none" stroke="rgb(245 158 11)" strokeWidth="16" />
            <path d="M 134 26 A 90 90 0 0 1 190 100" fill="none" stroke="rgb(239 68 68)" strokeWidth="16" />
            <line x1="100" y1="100" x2="100" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
              transform={`rotate(${angle} 100 100)`} />
            <circle cx="100" cy="100" r="5" fill="currentColor" />
          </svg>
          <div className={`mt-2 text-center text-sm font-semibold ${gaugeColor}`}>
            {dti < 28 ? "Comfortable" : dti < 36 ? "Manageable" : "Stretched"}
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          The 28/36 rule caps housing at 28% of gross income and total debt at 36%.
        </p>
      </div>
    </div>
  );
}

function F({ l, v, on, step }: { l: string; v: number; on: (n: number) => void; step?: string }) {
  return (
    <div>
      <Label>{l}</Label>
      <Input className="mt-1" type="number" step={step ?? "1"} value={v} onChange={(e) => on(+e.target.value)} />
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div>
    </div>
  );
}
function Range({ label, price, monthly, tone }: { label: string; price: number; monthly: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${tone}`}>{fmt(price, 0)}</div>
      <div className="text-xs text-muted-foreground">{fmt(monthly, 0)}/mo</div>
    </div>
  );
}