import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Disclaimer, Stat, round } from "./_health";

function categorize(sbp: number, dbp: number) {
  if (sbp > 180 || dbp > 120) return { label: "Hypertensive crisis", color: "text-red-700", pct: 100 };
  if (sbp >= 140 || dbp >= 90) return { label: "Hypertension stage 2", color: "text-red-600", pct: 85 };
  if (sbp >= 130 || dbp >= 80) return { label: "Hypertension stage 1", color: "text-orange-600", pct: 65 };
  if (sbp >= 120 && dbp < 80) return { label: "Elevated", color: "text-amber-600", pct: 45 };
  if (sbp < 90 || dbp < 60) return { label: "Low (hypotension)", color: "text-sky-600", pct: 15 };
  return { label: "Normal", color: "text-emerald-600", pct: 30 };
}

export default function BloodPressureCalculator() {
  const [sbp, setSbp] = useState(120);
  const [dbp, setDbp] = useState(80);

  const r = useMemo(() => {
    if (sbp <= 0 || dbp <= 0 || sbp <= dbp) return null;
    const map = (sbp + 2 * dbp) / 3;
    const pp = sbp - dbp;
    const cat = categorize(sbp, dbp);
    return { map, pp, cat };
  }, [sbp, dbp]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Systolic (mmHg)</Label><Input type="number" value={sbp} onChange={(e) => setSbp(+e.target.value)} className="mt-1" /></div>
        <div><Label>Diastolic (mmHg)</Label><Input type="number" value={dbp} onChange={(e) => setDbp(+e.target.value)} className="mt-1" /></div>
      </div>

      {!r && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Enter valid readings — systolic must be greater than diastolic.
        </p>
      )}

      {r && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-3">
            <Stat label="Reading" value={`${sbp} / ${dbp} mmHg`} />
            <Stat label="MAP" value={`${round(r.map, 0)} mmHg`} hint="Mean arterial pressure = (SBP + 2·DBP) / 3" />
            <Stat label="Pulse pressure" value={`${r.pp} mmHg`} hint="Difference between systolic and diastolic" />
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">AHA category</span>
              <span className={`text-sm font-semibold ${r.cat.color}`}>{r.cat.label}</span>
            </div>
            <div className="relative h-4 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 via-orange-500 to-red-700">
              <div
                className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded bg-foreground"
                style={{ left: `${r.cat.pct}%` }}
              />
            </div>
            <div className="mt-2 grid grid-cols-5 text-[10px] text-muted-foreground">
              <span>Low</span><span>Normal</span><span>Elevated</span><span>Stage 1/2</span><span className="text-right">Crisis</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {r.cat.label === "Hypertensive crisis"
              ? "A reading above 180/120 mmHg with symptoms is a medical emergency — call your local emergency number now."
              : "A single reading is not a diagnosis. Take multiple readings on different days, at rest, to assess your baseline."}
          </p>
        </>
      )}

      <Disclaimer />
    </div>
  );
}