import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Disclaimer, Stat, Bar, ftInToCm, lbsToKg, round } from "./_health";

type Unit = "metric" | "imperial";

function categoryOf(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600" };
  if (bmi < 25) return { label: "Normal", color: "text-emerald-600" };
  if (bmi < 30) return { label: "Overweight", color: "text-amber-600" };
  if (bmi < 35) return { label: "Obese Class I", color: "text-orange-600" };
  if (bmi < 40) return { label: "Obese Class II", color: "text-red-600" };
  return { label: "Obese Class III", color: "text-red-700" };
}

export default function BmiCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [cm, setCm] = useState(170);
  const [ft, setFt] = useState(5);
  const [inches, setInches] = useState(7);
  const [kg, setKg] = useState(70);
  const [lbs, setLbs] = useState(154);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<"male" | "female">("male");

  const r = useMemo(() => {
    const heightCm = unit === "metric" ? cm : ftInToCm(ft, inches);
    const weightKg = unit === "metric" ? kg : lbsToKg(lbs);
    if (heightCm <= 0 || weightKg <= 0) return null;
    const h = heightCm / 100;
    const bmi = weightKg / (h * h);
    const cat = categoryOf(bmi);
    const minKg = 18.5 * h * h;
    const maxKg = 24.9 * h * h;
    return { bmi, cat, minKg, maxKg };
  }, [unit, cm, ft, inches, kg, lbs]);

  const marker = r ? Math.max(0, Math.min(100, ((r.bmi - 15) / (40 - 15)) * 100)) : 0;

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

      {r && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-3">
            <Stat label="BMI" value={round(r.bmi, 1)} highlight />
            <Stat label="Category" value={<span className={r.cat.color}>{r.cat.label}</span>} />
            <Stat
              label="Healthy weight range"
              value={
                unit === "metric"
                  ? `${round(r.minKg, 1)} – ${round(r.maxKg, 1)} kg`
                  : `${round(r.minKg / 0.45359237, 1)} – ${round(r.maxKg / 0.45359237, 1)} lbs`
              }
            />
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 text-xs text-muted-foreground">BMI scale (15 – 40)</div>
            <div className="relative h-4 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 via-orange-500 to-red-600">
              <div
                className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded bg-foreground"
                style={{ left: `${marker}%` }}
                aria-label="BMI marker"
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>15</span><span>18.5</span><span>25</span><span>30</span><span>35</span><span>40</span>
            </div>
          </div>
        </>
      )}

      <Disclaimer extra="BMI does not distinguish between muscle and fat, and may not be accurate for athletes, elderly people, pregnant women or children." />
    </div>
  );
}