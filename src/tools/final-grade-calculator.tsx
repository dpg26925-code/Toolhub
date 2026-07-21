import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stat, round } from "./_edu";

export default function FinalGradeCalculator() {
  const [current, setCurrent] = useState(82);
  const [weight, setWeight] = useState(30);
  const [target, setTarget] = useState(90);

  const r = useMemo(() => {
    const w = weight / 100;
    if (w <= 0 || w > 1) return { error: "Final exam weight must be between 0 and 100%." };
    const needed = (target - current * (1 - w)) / w;
    const feasible = needed <= 100;
    const impossible = needed > 100;
    const alreadyPassed = needed <= 0;
    return { needed, feasible, impossible, alreadyPassed };
  }, [current, weight, target]);

  const gradeLetter = (pct: number) => (pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Current grade (%)</Label><Input type="number" value={current} onChange={(e) => setCurrent(+e.target.value)} className="mt-1" /></div>
        <div><Label>Final exam weight (%)</Label><Input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="mt-1" /></div>
        <div><Label>Desired final grade (%)</Label><Input type="number" value={target} onChange={(e) => setTarget(+e.target.value)} className="mt-1" /></div>
      </div>

      {"error" in r ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{r.error}</p>
      ) : (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-2">
            <Stat
              label="Required exam score"
              value={r.alreadyPassed ? "0% (already there)" : `${round(r.needed, 1)} %`}
              highlight
              hint={
                r.impossible
                  ? "Not achievable with a 0–100 exam score."
                  : r.alreadyPassed
                  ? "Your current grade already meets or exceeds the target."
                  : `You need ${round(r.needed, 1)}% (letter ~${gradeLetter(r.needed)}) on the final to get ${round(target, 1)}% (${gradeLetter(target)}).`
              }
            />
            <Stat
              label="Formula"
              value={<span className="font-mono text-sm">needed = (target − current × (1 − w)) ÷ w</span>}
            />
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Grade curve — final score vs course grade</h3>
            <div className="space-y-2">
              {[0, 25, 50, 60, 70, 80, 90, 100].map((exam) => {
                const final = current * (1 - weight / 100) + exam * (weight / 100);
                const pct = Math.max(0, Math.min(100, final));
                const isRequired = !r.impossible && !r.alreadyPassed && Math.abs(exam - r.needed) < 5;
                return (
                  <div key={exam}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Exam {exam}%</span>
                      <span className={`font-medium ${isRequired ? "text-primary" : "text-foreground"}`}>
                        → Course {round(final, 1)}% ({gradeLetter(final)})
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className={`h-full ${isRequired ? "bg-primary" : "bg-muted-foreground/40"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}