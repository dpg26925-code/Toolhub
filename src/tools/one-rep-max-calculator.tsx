import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Disclaimer, Stat, round } from "./_health";

type Formula = "epley" | "brzycki" | "lombardi" | "oconner";

const FORMULAS: { key: Formula; label: string; fn: (w: number, r: number) => number }[] = [
  { key: "epley", label: "Epley", fn: (w, r) => w * (1 + r / 30) },
  { key: "brzycki", label: "Brzycki", fn: (w, r) => w * (36 / (37 - r)) },
  { key: "lombardi", label: "Lombardi", fn: (w, r) => w * Math.pow(r, 0.1) },
  { key: "oconner", label: "O'Conner", fn: (w, r) => w * (1 + r / 40) },
];

// Percent of 1RM for a given target rep count (Epley inverse, standard training table)
const REP_PCT: Record<number, number> = {
  1: 100, 2: 95, 3: 93, 4: 90, 5: 87, 6: 85, 7: 83, 8: 80, 9: 77, 10: 75, 12: 70, 15: 65,
};

const TRAINING = [
  { goal: "Strength", pct: [85, 100], reps: "1–5" },
  { goal: "Hypertrophy", pct: [67, 85], reps: "6–12" },
  { goal: "Endurance", pct: [50, 67], reps: "12+" },
];

export default function OneRepMaxCalculator() {
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);
  const [formula, setFormula] = useState<Formula>("epley");

  const r = useMemo(() => {
    if (weight <= 0 || reps < 1 || reps > 12) return null;
    const all = FORMULAS.map((f) => ({ key: f.key, label: f.label, orm: f.fn(weight, reps) }));
    const primary = all.find((x) => x.key === formula)!.orm;
    const avg = all.reduce((a, b) => a + b.orm, 0) / all.length;
    return { all, primary, avg };
  }, [weight, reps, formula]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={unit === "kg" ? "default" : "outline"} onClick={() => setUnit("kg")}>kg</Button>
        <Button size="sm" variant={unit === "lbs" ? "default" : "outline"} onClick={() => setUnit("lbs")}>lbs</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Weight lifted ({unit})</Label><Input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="mt-1" /></div>
        <div><Label>Reps performed (1–12)</Label><Input type="number" min={1} max={12} value={reps} onChange={(e) => setReps(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Formula</Label>
          <select value={formula} onChange={(e) => setFormula(e.target.value as Formula)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {FORMULAS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>
      </div>

      {r && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-3">
            <Stat label={`1RM (${FORMULAS.find((f) => f.key === formula)!.label})`} value={`${round(r.primary, 1)} ${unit}`} highlight />
            <Stat label="Average of 4 formulas" value={`${round(r.avg, 1)} ${unit}`} />
            <Stat label="Range" value={`${round(Math.min(...r.all.map((x) => x.orm)), 1)} – ${round(Math.max(...r.all.map((x) => x.orm)), 1)} ${unit}`} />
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">All formulas</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {r.all.map((x) => (
                <div key={x.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{x.label}</span>
                  <span className="font-semibold">{round(x.orm, 1)} {unit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Training loads (based on {round(r.primary, 1)} {unit} 1RM)</h3>
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr><th className="py-1 text-left">Reps</th><th className="py-1 text-right">% 1RM</th><th className="py-1 text-right">Working weight</th></tr>
                </thead>
                <tbody>
                  {Object.entries(REP_PCT).map(([rep, pct]) => (
                    <tr key={rep} className="border-t border-border">
                      <td className="py-1">{rep}RM</td>
                      <td className="py-1 text-right">{pct}%</td>
                      <td className="py-1 text-right font-medium">{round((r.primary * pct) / 100, 1)} {unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Training zones</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {TRAINING.map((t) => (
                <div key={t.goal} className="rounded-lg border border-border p-3">
                  <div className="text-xs uppercase text-muted-foreground">{t.goal}</div>
                  <div className="mt-1 font-semibold">{round((r.primary * t.pct[0]) / 100, 1)} – {round((r.primary * t.pct[1]) / 100, 1)} {unit}</div>
                  <div className="text-xs text-muted-foreground">{t.pct[0]}–{t.pct[1]}% · {t.reps} reps</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-2 text-sm font-semibold">Strength curve</h3>
            <div className="flex h-32 items-end gap-1">
              {Object.entries(REP_PCT).map(([rep, pct]) => (
                <div key={rep} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-primary/70" style={{ height: `${pct}%` }} title={`${rep}RM · ${pct}%`} />
                  <div className="text-[10px] text-muted-foreground">{rep}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Disclaimer extra="Safety: always warm up, use proper form and have a spotter for heavy lifts. Estimated 1RM formulas are most accurate for 1–10 reps to failure; beyond 12 reps the estimate becomes unreliable." />
    </div>
  );
}