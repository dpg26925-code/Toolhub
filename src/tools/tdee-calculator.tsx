import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Disclaimer, Stat, Bar, ftInToCm, lbsToKg, round } from "./_health";

type Unit = "metric" | "imperial";

const ACTIVITY = [
  { key: "sedentary", label: "Sedentary (little to no exercise)", factor: 1.2 },
  { key: "light", label: "Light (1–3 days/week)", factor: 1.375 },
  { key: "moderate", label: "Moderate (3–5 days/week)", factor: 1.55 },
  { key: "active", label: "Active (6–7 days/week)", factor: 1.725 },
  { key: "very", label: "Very Active (twice daily / hard labor)", factor: 1.9 },
];

export default function TdeeCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [cm, setCm] = useState(170);
  const [ft, setFt] = useState(5);
  const [inches, setInches] = useState(7);
  const [kg, setKg] = useState(70);
  const [lbs, setLbs] = useState(154);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [act, setAct] = useState("moderate");

  const r = useMemo(() => {
    const h = unit === "metric" ? cm : ftInToCm(ft, inches);
    const w = unit === "metric" ? kg : lbsToKg(lbs);
    if (h <= 0 || w <= 0 || age <= 0) return null;
    const bmr = 10 * w + 6.25 * h - 5 * age + (gender === "male" ? 5 : -161);
    const factor = ACTIVITY.find((a) => a.key === act)?.factor ?? 1.55;
    const tdee = bmr * factor;
    return {
      bmr,
      tdee,
      maintain: tdee,
      leanBulk: tdee + 250,
      bulk: tdee + 500,
      mildLoss: tdee - 250,
      loss: tdee - 500,
      aggressive: tdee - 750,
    };
  }, [unit, cm, ft, inches, kg, lbs, age, gender, act]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={unit === "metric" ? "default" : "outline"} onClick={() => setUnit("metric")}>Metric</Button>
        <Button size="sm" variant={unit === "imperial" ? "default" : "outline"} onClick={() => setUnit("imperial")}>Imperial</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {unit === "metric" ? (
          <>
            <div><Label>Height (cm)</Label><Input type="number" value={cm} onChange={(e) => setCm(+e.target.value)} className="mt-1" /></div>
            <div><Label>Weight (kg)</Label><Input type="number" value={kg} onChange={(e) => setKg(+e.target.value)} className="mt-1" /></div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Height (ft)</Label><Input type="number" value={ft} onChange={(e) => setFt(+e.target.value)} className="mt-1" /></div>
              <div><Label>in</Label><Input type="number" value={inches} onChange={(e) => setInches(+e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label>Weight (lbs)</Label><Input type="number" value={lbs} onChange={(e) => setLbs(+e.target.value)} className="mt-1" /></div>
          </>
        )}
        <div><Label>Age</Label><Input type="number" value={age} onChange={(e) => setAge(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Gender</Label>
          <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div>
        <Label>Activity level</Label>
        <select value={act} onChange={(e) => setAct(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          {ACTIVITY.map((a) => (
            <option key={a.key} value={a.key}>{a.label} — ×{a.factor}</option>
          ))}
        </select>
      </div>

      {r && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-2">
            <Stat label="BMR" value={`${round(r.bmr, 0)} kcal/day`} />
            <Stat label="TDEE (maintain)" value={`${round(r.tdee, 0)} kcal/day`} highlight />
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Daily calorie targets</h3>
            <div className="space-y-3">
              {[
                { label: "Aggressive loss (~0.75 kg / 1.5 lb per week)", v: r.aggressive, color: "bg-red-500" },
                { label: "Weight loss (~0.5 kg / 1 lb per week)", v: r.loss, color: "bg-orange-500" },
                { label: "Mild loss (~0.25 kg / 0.5 lb per week)", v: r.mildLoss, color: "bg-amber-500" },
                { label: "Maintain", v: r.maintain, color: "bg-emerald-500" },
                { label: "Lean bulk (~0.25 kg / 0.5 lb per week)", v: r.leanBulk, color: "bg-sky-500" },
                { label: "Bulk (~0.5 kg / 1 lb per week)", v: r.bulk, color: "bg-indigo-500" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">{round(row.v, 0)} kcal</span>
                  </div>
                  <Bar percent={(row.v / (r.bulk * 1.1)) * 100} color={row.color} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Disclaimer />
    </div>
  );
}