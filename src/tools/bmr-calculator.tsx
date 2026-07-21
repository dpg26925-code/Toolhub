import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Disclaimer, Stat, ftInToCm, lbsToKg, round } from "./_health";

type Unit = "metric" | "imperial";

export default function BmrCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [cm, setCm] = useState(170);
  const [ft, setFt] = useState(5);
  const [inches, setInches] = useState(7);
  const [kg, setKg] = useState(70);
  const [lbs, setLbs] = useState(154);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<"male" | "female">("male");

  const bmr = useMemo(() => {
    const h = unit === "metric" ? cm : ftInToCm(ft, inches);
    const w = unit === "metric" ? kg : lbsToKg(lbs);
    if (h <= 0 || w <= 0 || age <= 0) return null;
    const base = 10 * w + 6.25 * h - 5 * age;
    return gender === "male" ? base + 5 : base - 161;
  }, [unit, cm, ft, inches, kg, lbs, age, gender]);

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

      {bmr !== null && (
        <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-2">
          <Stat label="BMR" value={`${round(bmr, 0)} kcal/day`} highlight />
          <Stat
            label="Formula"
            value="Mifflin–St Jeor"
            hint="BMR = 10·weight(kg) + 6.25·height(cm) − 5·age ± sex offset (+5 male / −161 female)."
          />
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Your BMR is the number of calories your body burns at rest. Use the{" "}
        <a href="/tools/tdee-calculator" className="text-primary hover:underline">TDEE Calculator</a>{" "}
        to factor in activity and get a daily calorie target.
      </p>

      <Disclaimer />
    </div>
  );
}