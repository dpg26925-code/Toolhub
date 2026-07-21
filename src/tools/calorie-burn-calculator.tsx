import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Disclaimer, Stat, lbsToKg, round } from "./_health";

type Intensity = "light" | "moderate" | "vigorous";

// MET values by activity and intensity (Compendium of Physical Activities, rounded)
const ACTIVITIES: { key: string; label: string; met: Record<Intensity, number> }[] = [
  { key: "walking", label: "Walking", met: { light: 2.8, moderate: 3.5, vigorous: 5.0 } },
  { key: "running", label: "Running", met: { light: 6.0, moderate: 9.8, vigorous: 12.8 } },
  { key: "cycling", label: "Cycling", met: { light: 4.0, moderate: 7.5, vigorous: 10.5 } },
  { key: "swimming", label: "Swimming", met: { light: 4.5, moderate: 7.0, vigorous: 10.0 } },
  { key: "hiit", label: "HIIT", met: { light: 6.0, moderate: 8.0, vigorous: 12.0 } },
  { key: "yoga", label: "Yoga", met: { light: 2.5, moderate: 3.3, vigorous: 4.0 } },
  { key: "weightlifting", label: "Weightlifting", met: { light: 3.5, moderate: 5.0, vigorous: 6.0 } },
  { key: "basketball", label: "Basketball", met: { light: 4.5, moderate: 6.5, vigorous: 8.0 } },
  { key: "soccer", label: "Soccer", met: { light: 5.0, moderate: 7.0, vigorous: 10.0 } },
];

const FOODS: { label: string; kcal: number }[] = [
  { label: "banana", kcal: 105 },
  { label: "slice of pizza", kcal: 285 },
  { label: "cheeseburger", kcal: 300 },
  { label: "chocolate bar", kcal: 230 },
  { label: "can of soda", kcal: 140 },
  { label: "glass of wine", kcal: 125 },
];

export default function CalorieBurnCalculator() {
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [kg, setKg] = useState(70);
  const [lbs, setLbs] = useState(154);
  const [minutes, setMinutes] = useState(30);
  const [activity, setActivity] = useState(ACTIVITIES[1].key);
  const [intensity, setIntensity] = useState<Intensity>("moderate");

  const weightKg = unit === "kg" ? kg : lbsToKg(lbs);
  const act = ACTIVITIES.find((a) => a.key === activity)!;

  const r = useMemo(() => {
    if (weightKg <= 0 || minutes <= 0) return null;
    const met = act.met[intensity];
    const kcal = met * weightKg * (minutes / 60);
    return { met, kcal };
  }, [weightKg, minutes, act, intensity]);

  const compare = useMemo(() => {
    if (!r) return null;
    return FOODS.map((f) => ({ ...f, units: r.kcal / f.kcal })).sort((a, b) => b.units - a.units);
  }, [r]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={unit === "kg" ? "default" : "outline"} onClick={() => setUnit("kg")}>kg</Button>
        <Button size="sm" variant={unit === "lbs" ? "default" : "outline"} onClick={() => setUnit("lbs")}>lbs</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Activity</Label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {ACTIVITIES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </div>
        <div>
          <Label>Intensity</Label>
          <select value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="vigorous">Vigorous</option>
          </select>
        </div>
        <div><Label>Duration (min)</Label><Input type="number" value={minutes} onChange={(e) => setMinutes(+e.target.value)} className="mt-1" /></div>
        {unit === "kg" ? (
          <div><Label>Weight (kg)</Label><Input type="number" value={kg} onChange={(e) => setKg(+e.target.value)} className="mt-1" /></div>
        ) : (
          <div><Label>Weight (lbs)</Label><Input type="number" value={lbs} onChange={(e) => setLbs(+e.target.value)} className="mt-1" /></div>
        )}
      </div>

      {r && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-3">
            <Stat label="Calories burned" value={`${round(r.kcal, 0)} kcal`} highlight />
            <Stat label="MET value" value={round(r.met, 1)} hint="Metabolic equivalent of task" />
            <Stat label="Per hour" value={`${round((r.kcal / minutes) * 60, 0)} kcal/h`} />
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Compared to other activities (60 min, same weight)</h3>
            <div className="space-y-2">
              {ACTIVITIES.map((a) => {
                const kcal = a.met[intensity] * weightKg;
                const max = Math.max(...ACTIVITIES.map((x) => x.met[intensity] * weightKg));
                const pct = (kcal / max) * 100;
                return (
                  <div key={a.key}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className={a.key === activity ? "font-semibold text-foreground" : "text-muted-foreground"}>{a.label}</span>
                      <span className="text-muted-foreground">{round(kcal, 0)} kcal</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className={a.key === activity ? "h-full bg-primary" : "h-full bg-muted-foreground/40"} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {compare && (
            <div className="rounded-xl border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold">Equivalent food</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {compare.slice(0, 6).map((f) => (
                  <div key={f.label} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{f.label} ({f.kcal} kcal)</span>
                    <span className="font-semibold">{round(f.units, 2)}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Disclaimer extra="Calorie estimates use standard MET values from the Compendium of Physical Activities. Actual burn varies by individual fitness level, technique, body composition and effort." />
    </div>
  );
}