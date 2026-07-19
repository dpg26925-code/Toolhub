import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function fmt(n: number) { return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`; }

export default function AffiliateIncomeCalculator() {
  const [traffic, setTraffic] = useState("10000");
  const [cvr, setCvr] = useState("2");
  const [aov, setAov] = useState("50");
  const [rate, setRate] = useState("10");

  const t = parseFloat(traffic) || 0;
  const c = parseFloat(cvr) || 0;
  const a = parseFloat(aov) || 0;
  const r = parseFloat(rate) || 0;

  const scenarios = useMemo(() => {
    const base = t * (c / 100) * a * (r / 100);
    return [
      { name: "Conservative", mult: 0.5, color: "text-muted-foreground" },
      { name: "Realistic", mult: 1, color: "text-primary" },
      { name: "Optimistic", mult: 1.75, color: "text-emerald-600" },
    ].map((s) => ({ ...s, monthly: base * s.mult }));
  }, [t, c, a, r]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Monthly traffic: {t.toLocaleString()}</Label>
          <Input type="range" min="100" max="1000000" step="100" value={traffic} onChange={(e) => setTraffic(e.target.value)} className="mt-2" />
          <Input type="number" value={traffic} onChange={(e) => setTraffic(e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label>Conversion rate: {c}%</Label>
          <Input type="range" min="0.1" max="20" step="0.1" value={cvr} onChange={(e) => setCvr(e.target.value)} className="mt-2" />
          <Input type="number" value={cvr} onChange={(e) => setCvr(e.target.value)} className="mt-2" step="0.1" />
        </div>
        <div>
          <Label>Avg order value: ${a}</Label>
          <Input type="range" min="1" max="1000" step="1" value={aov} onChange={(e) => setAov(e.target.value)} className="mt-2" />
          <Input type="number" value={aov} onChange={(e) => setAov(e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label>Commission rate: {r}%</Label>
          <Input type="range" min="1" max="75" step="1" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-2" />
          <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-2" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {scenarios.map((s) => (
          <div key={s.name} className="rounded-lg border p-4">
            <div className={`text-xs font-semibold uppercase tracking-wide ${s.color}`}>{s.name}</div>
            <div className="mt-2 text-2xl font-bold">{fmt(s.monthly)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div>Daily: {fmt(s.monthly / 30)}</div>
              <div>Weekly: {fmt(s.monthly / 4.33)}</div>
              <div>Yearly: {fmt(s.monthly * 12)}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Projection formula: traffic × conversion rate × order value × commission rate. Real results depend on niche, seasonality and audience quality.
      </p>
    </div>
  );
}