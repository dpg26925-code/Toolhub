import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Disclaimer, Stat } from "./_health";

type MaxFormula = "fox" | "tanaka" | "gulati" | "nes";

const FORMULAS: { key: MaxFormula; label: string; fn: (age: number, gender: "male" | "female") => number }[] = [
  { key: "fox", label: "Fox (220 − age)", fn: (a) => 220 - a },
  { key: "tanaka", label: "Tanaka (208 − 0.7·age)", fn: (a) => 208 - 0.7 * a },
  { key: "gulati", label: "Gulati (women, 206 − 0.88·age)", fn: (a) => 206 - 0.88 * a },
  { key: "nes", label: "Nes (211 − 0.64·age)", fn: (a) => 211 - 0.64 * a },
];

const ZONES = [
  { z: 1, lo: 50, hi: 60, label: "Very light — warm-up / recovery", color: "bg-sky-400" },
  { z: 2, lo: 60, hi: 70, label: "Light — fat burn, aerobic base", color: "bg-emerald-400" },
  { z: 3, lo: 70, hi: 80, label: "Moderate — aerobic endurance", color: "bg-amber-400" },
  { z: 4, lo: 80, hi: 90, label: "Hard — anaerobic threshold", color: "bg-orange-500" },
  { z: 5, lo: 90, hi: 100, label: "Maximum — VO₂max, sprint", color: "bg-red-600" },
];

const GOALS: { key: string; label: string; zone: number; hint: string }[] = [
  { key: "fatloss", label: "Fat loss", zone: 2, hint: "Long, easy sessions in Zone 2 maximise fat oxidation." },
  { key: "endurance", label: "Endurance", zone: 3, hint: "Zone 2–3 builds aerobic capacity and stroke volume." },
  { key: "hiit", label: "HIIT", zone: 4, hint: "Short intervals in Zone 4–5 boost VO₂max and anaerobic power." },
  { key: "recovery", label: "Recovery", zone: 1, hint: "Very easy Zone 1 flushes blood and aids adaptation." },
];

export default function HeartRateZones() {
  const [age, setAge] = useState(30);
  const [rest, setRest] = useState<number | "">("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [formulaKey, setFormulaKey] = useState<MaxFormula>("fox");

  const r = useMemo(() => {
    if (age <= 0 || age > 120) return null;
    const f = FORMULAS.find((x) => x.key === formulaKey)!;
    const hrmax = Math.round(f.fn(age, gender));
    const useKarvonen = typeof rest === "number" && rest > 0 && rest < hrmax;
    const hrr = useKarvonen ? hrmax - (rest as number) : 0;
    const bpm = (pct: number) =>
      useKarvonen ? Math.round((pct / 100) * hrr + (rest as number)) : Math.round((pct / 100) * hrmax);
    return { hrmax, useKarvonen, bpm, formulaLabel: f.label };
  }, [age, rest, formulaKey, gender]);

  // Circular donut segments (each zone = 10% of circumference)
  const RADIUS = 60;
  const C = 2 * Math.PI * RADIUS;
  const ZONE_COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#f97316", "#dc2626"];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><Label>Age (years)</Label><Input type="number" value={age} onChange={(e) => setAge(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Resting HR (bpm) — optional</Label>
          <Input
            type="number"
            value={rest}
            placeholder="e.g. 60"
            onChange={(e) => setRest(e.target.value === "" ? "" : +e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Gender</Label>
          <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <Label>HR max formula</Label>
          <select value={formulaKey} onChange={(e) => setFormulaKey(e.target.value as MaxFormula)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {FORMULAS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>
      </div>

      {r && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-2">
            <Stat label={`HR max — ${r.formulaLabel}`} value={`${r.hrmax} bpm`} highlight />
            <Stat label="Method" value={r.useKarvonen ? "Karvonen (HR reserve)" : "Percentage of HR max"} />
          </div>

          <div className="grid gap-4 rounded-xl border border-border p-4 lg:grid-cols-[auto,1fr]">
            <div className="flex justify-center">
              <svg viewBox="0 0 160 160" className="h-48 w-48 -rotate-90">
                {ZONES.map((z, i) => {
                  const seg = C * 0.18;
                  const gap = C * 0.02;
                  const offset = i * (seg + gap);
                  return (
                    <circle
                      key={z.z}
                      cx="80"
                      cy="80"
                      r={RADIUS}
                      fill="none"
                      stroke={ZONE_COLORS[i]}
                      strokeWidth="18"
                      strokeDasharray={`${seg} ${C - seg}`}
                      strokeDashoffset={-offset}
                    />
                  );
                })}
                <text x="80" y="78" textAnchor="middle" className="rotate-90 fill-foreground text-xs" transform="rotate(90 80 80)">HR max</text>
                <text x="80" y="92" textAnchor="middle" className="fill-foreground text-lg font-bold" transform="rotate(90 80 80)">{r.hrmax}</text>
              </svg>
            </div>
            <ul className="space-y-2">
              {ZONES.map((z, i) => (
                <li key={z.z} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: ZONE_COLORS[i] }}>Z{z.z}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{z.label}</div>
                    <div className="text-xs text-muted-foreground">{z.lo}–{z.hi}% intensity</div>
                  </div>
                  <div className="whitespace-nowrap text-sm font-semibold text-foreground">
                    {r.bpm(z.lo)} – {r.bpm(z.hi)} bpm
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Target heart rate by goal</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {GOALS.map((g) => {
                const z = ZONES.find((x) => x.z === g.zone)!;
                return (
                  <div key={g.key} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-foreground">{g.label}</div>
                      <div className="text-xs text-muted-foreground">Zone {g.zone}</div>
                    </div>
                    <div className="mt-1 text-base font-semibold text-primary">{r.bpm(z.lo)} – {r.bpm(z.hi)} bpm</div>
                    <div className="mt-1 text-xs text-muted-foreground">{g.hint}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <Disclaimer extra="Age-based HR max formulas are rough estimates; individual HRmax can vary by ±10–15 bpm. Consult your doctor before starting a new exercise program, especially if you have a heart condition." />
    </div>
  );
}