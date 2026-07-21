import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Disclaimer, Stat, ftInToCm, lbsToKg, inToCm, round } from "./_health";

type Unit = "metric" | "imperial";

function category(bf: number, gender: "male" | "female") {
  const scale = gender === "male"
    ? [
        { max: 6, label: "Essential fat" },
        { max: 14, label: "Athletes" },
        { max: 18, label: "Fitness" },
        { max: 25, label: "Average" },
        { max: Infinity, label: "Obese" },
      ]
    : [
        { max: 14, label: "Essential fat" },
        { max: 21, label: "Athletes" },
        { max: 25, label: "Fitness" },
        { max: 32, label: "Average" },
        { max: Infinity, label: "Obese" },
      ];
  return scale.find((s) => bf < s.max)!.label;
}

export default function BodyFatCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [heightCm, setHeightCm] = useState(175);
  const [waistCm, setWaistCm] = useState(85);
  const [neckCm, setNeckCm] = useState(38);
  const [hipsCm, setHipsCm] = useState(95);
  const [weightKg, setWeightKg] = useState(75);
  // imperial (inches / lbs)
  const [heightIn, setHeightIn] = useState(69);
  const [waistIn, setWaistIn] = useState(34);
  const [neckIn, setNeckIn] = useState(15);
  const [hipsIn, setHipsIn] = useState(37);
  const [weightLbs, setWeightLbs] = useState(165);

  const r = useMemo(() => {
    const h = unit === "metric" ? heightCm : inToCm(heightIn);
    const w = unit === "metric" ? waistCm : inToCm(waistIn);
    const n = unit === "metric" ? neckCm : inToCm(neckIn);
    const hp = unit === "metric" ? hipsCm : inToCm(hipsIn);
    const kg = unit === "metric" ? weightKg : lbsToKg(weightLbs);
    if (h <= 0 || w <= 0 || n <= 0 || (gender === "female" && hp <= 0)) return null;
    let bf: number;
    if (gender === "male") {
      const d = w - n;
      if (d <= 0) return { error: "Waist must be greater than neck." };
      bf = 495 / (1.0324 - 0.19077 * Math.log10(d) + 0.15456 * Math.log10(h)) - 450;
    } else {
      const d = w + hp - n;
      if (d <= 0) return { error: "Waist + hips must be greater than neck." };
      bf = 495 / (1.29579 - 0.35004 * Math.log10(d) + 0.221 * Math.log10(h)) - 450;
    }
    if (!isFinite(bf) || bf < 2 || bf > 60) return { error: "Result out of range — please recheck measurements." };
    const fatKg = (bf / 100) * kg;
    const leanKg = kg - fatKg;
    return { bf, cat: category(bf, gender), fatKg, leanKg };
  }, [unit, gender, heightCm, waistCm, neckCm, hipsCm, weightKg, heightIn, waistIn, neckIn, hipsIn, weightLbs]);

  const suffix = unit === "metric" ? "cm" : "in";
  const wSuffix = unit === "metric" ? "kg" : "lbs";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={unit === "metric" ? "default" : "outline"} onClick={() => setUnit("metric")}>Metric</Button>
        <Button size="sm" variant={unit === "imperial" ? "default" : "outline"} onClick={() => setUnit("imperial")}>Imperial</Button>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant={gender === "male" ? "default" : "outline"} onClick={() => setGender("male")}>Male</Button>
          <Button size="sm" variant={gender === "female" ? "default" : "outline"} onClick={() => setGender("female")}>Female</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NumField label={`Height (${suffix})`} value={unit === "metric" ? heightCm : heightIn} onChange={(v) => (unit === "metric" ? setHeightCm(v) : setHeightIn(v))} />
        <NumField label={`Weight (${wSuffix})`} value={unit === "metric" ? weightKg : weightLbs} onChange={(v) => (unit === "metric" ? setWeightKg(v) : setWeightLbs(v))} />
        <NumField label={`Waist (${suffix})`} value={unit === "metric" ? waistCm : waistIn} onChange={(v) => (unit === "metric" ? setWaistCm(v) : setWaistIn(v))} />
        <NumField label={`Neck (${suffix})`} value={unit === "metric" ? neckCm : neckIn} onChange={(v) => (unit === "metric" ? setNeckCm(v) : setNeckIn(v))} />
        {gender === "female" && (
          <NumField label={`Hips (${suffix})`} value={unit === "metric" ? hipsCm : hipsIn} onChange={(v) => (unit === "metric" ? setHipsCm(v) : setHipsIn(v))} />
        )}
      </div>

      {r && "error" in r && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{r.error}</p>
      )}
      {r && !("error" in r) && (
        <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-3">
          <Stat label="Body fat" value={`${round(r.bf, 1)} %`} highlight />
          <Stat label="Category" value={r.cat} />
          <Stat label="Lean mass" value={unit === "metric" ? `${round(r.leanKg, 1)} kg` : `${round(r.leanKg / 0.45359237, 1)} lbs`} hint={`Fat mass ≈ ${unit === "metric" ? round(r.fatKg, 1) + " kg" : round(r.fatKg / 0.45359237, 1) + " lbs"}`} />
        </div>
      )}

      <Disclaimer extra="US Navy circumference method — expect ±3% error vs DEXA. Measure at the natural waist (narrowest point), just below the larynx (neck), and at the widest point of the hips (women)." />
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(+e.target.value)} className="mt-1" />
    </div>
  );
}