import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

// Approximate effective property tax rates by major US metros (%/yr of assessed value).
// Sources: Tax Foundation / county assessor summaries; user can override.
const PRESETS: { city: string; state: string; rate: number }[] = [
  { city: "Custom", state: "", rate: 1.1 },
  { city: "New York", state: "NY", rate: 0.88 },
  { city: "Los Angeles", state: "CA", rate: 0.75 },
  { city: "Chicago", state: "IL", rate: 2.10 },
  { city: "Houston", state: "TX", rate: 2.03 },
  { city: "Phoenix", state: "AZ", rate: 0.63 },
  { city: "Philadelphia", state: "PA", rate: 1.34 },
  { city: "San Antonio", state: "TX", rate: 1.97 },
  { city: "San Diego", state: "CA", rate: 0.73 },
  { city: "Dallas", state: "TX", rate: 1.81 },
  { city: "Austin", state: "TX", rate: 1.80 },
  { city: "Miami", state: "FL", rate: 0.97 },
  { city: "Seattle", state: "WA", rate: 0.94 },
  { city: "Denver", state: "CO", rate: 0.55 },
  { city: "Boston", state: "MA", rate: 1.04 },
  { city: "Atlanta", state: "GA", rate: 0.95 },
  { city: "Newark", state: "NJ", rate: 2.49 },
  { city: "Detroit", state: "MI", rate: 2.35 },
];

export default function PropertyTaxCalculator() {
  const [value, setValue] = useState(400000);
  const [rate, setRate] = useState(1.1);
  const [preset, setPreset] = useState("Custom");
  const [homestead, setHomestead] = useState(0);
  const [supplemental, setSupplemental] = useState(0);

  const r = useMemo(() => {
    const taxable = Math.max(0, value - homestead);
    const county = (taxable * rate) / 100;
    // Rough breakdown: county 45%, city 25%, school 25%, special 5%
    const breakdown = [
      { name: "County", pct: 0.45, color: "bg-primary" },
      { name: "City", pct: 0.25, color: "bg-emerald-500" },
      { name: "School district", pct: 0.25, color: "bg-amber-500" },
      { name: "Special assessments", pct: 0.05, color: "bg-purple-500" },
    ].map((b) => ({ ...b, amount: county * b.pct }));
    const annual = county + supplemental;
    const monthly = annual / 12;
    const effective = value > 0 ? (annual / value) * 100 : 0;
    return { taxable, annual, monthly, effective, breakdown };
  }, [value, rate, homestead, supplemental]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label>City preset</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={preset}
            onChange={(e) => {
              const p = PRESETS.find((x) => x.city === e.target.value);
              if (p) { setPreset(p.city); if (p.city !== "Custom") setRate(p.rate); }
            }}
          >
            {PRESETS.map((p) => (
              <option key={p.city} value={p.city}>
                {p.city}{p.state ? `, ${p.state} — ${p.rate}%` : ""}
              </option>
            ))}
          </select>
        </div>
        <div><Label>Property value</Label><Input className="mt-1" type="number" value={value} onChange={(e) => setValue(+e.target.value)} /></div>
        <div><Label>Tax rate (%)</Label><Input className="mt-1" type="number" step="0.01" value={rate} onChange={(e) => { setRate(+e.target.value); setPreset("Custom"); }} /></div>
        <div><Label>Homestead exemption</Label><Input className="mt-1" type="number" value={homestead} onChange={(e) => setHomestead(+e.target.value)} /></div>
        <div><Label>Supplemental tax /yr</Label><Input className="mt-1" type="number" value={supplemental} onChange={(e) => setSupplemental(+e.target.value)} /></div>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-sm sm:grid-cols-4">
        <S label="Annual property tax" v={fmt(r.annual)} h />
        <S label="Monthly (escrow)" v={fmt(r.monthly)} />
        <S label="Effective rate" v={`${fmt(r.effective, 2)}%`} />
        <S label="Taxable value" v={fmt(r.taxable)} />
      </div>

      <div className="rounded-xl border border-border p-4">
        <div className="mb-3 text-sm font-semibold">Estimated breakdown by jurisdiction</div>
        <div className="space-y-2">
          {r.breakdown.map((b) => (
            <div key={b.name}>
              <div className="mb-1 flex justify-between text-xs"><span>{b.name} ({Math.round(b.pct * 100)}%)</span><span>{fmt(b.amount)}</span></div>
              <div className="h-3 rounded bg-muted overflow-hidden"><div className={`h-full ${b.color}`} style={{ width: `${b.pct * 100}%` }} /></div>
            </div>
          ))}
          {supplemental > 0 && (
            <div className="pt-2 text-xs text-muted-foreground">+ {fmt(supplemental)} supplemental tax (e.g. school bond, Mello-Roos)</div>
          )}
        </div>
      </div>

      <Button size="sm" onClick={() => { copy(`Property tax: ${fmt(r.annual)}/yr (${fmt(r.monthly)}/mo) on ${fmt(value)} @ ${rate}%`); toast.success("Copied"); }}>Copy summary</Button>
      <p className="text-xs text-muted-foreground">Estimates only. Real tax bills include local millage rates, assessment ratios and exemptions that vary by parcel. Verify with your county assessor.</p>
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