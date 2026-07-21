import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Disclaimer, Stat, round } from "./_health";

const ZONES = [
  { z: 1, lo: 50, hi: 60, label: "Very light — warm-up / recovery", color: "bg-sky-400" },
  { z: 2, lo: 60, hi: 70, label: "Light — fat burn, aerobic base", color: "bg-emerald-400" },
  { z: 3, lo: 70, hi: 80, label: "Moderate — aerobic endurance", color: "bg-amber-400" },
  { z: 4, lo: 80, hi: 90, label: "Hard — anaerobic threshold", color: "bg-orange-500" },
  { z: 5, lo: 90, hi: 100, label: "Maximum — VO₂max, sprint", color: "bg-red-600" },
];

export default function HeartRateZones() {
  const [age, setAge] = useState(30);
  const [rest, setRest] = useState<number | "">("");

  const r = useMemo(() => {
    if (age <= 0 || age > 120) return null;
    const hrmax = 220 - age;
    const useKarvonen = typeof rest === "number" && rest > 0 && rest < hrmax;
    const hrr = useKarvonen ? hrmax - (rest as number) : 0;
    const bpm = (pct: number) =>
      useKarvonen ? Math.round((pct / 100) * hrr + (rest as number)) : Math.round((pct / 100) * hrmax);
    return { hrmax, useKarvonen, bpm };
  }, [age, rest]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
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
      </div>

      {r && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-2">
            <Stat label="HR max (220 − age)" value={`${r.hrmax} bpm`} highlight />
            <Stat label="Method" value={r.useKarvonen ? "Karvonen (HR reserve)" : "Percentage of HR max"} />
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Training zones</h3>
            <ul className="space-y-2">
              {ZONES.map((z) => (
                <li key={z.z} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${z.color}`}>Z{z.z}</span>
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

          <p className="text-sm text-muted-foreground">
            <strong>Fat-burn zone:</strong> roughly {r.bpm(60)}–{r.bpm(70)} bpm (Zone 2).
            You'll burn more total calories in higher zones — the "fat-burn" label just refers to the fuel mix.
          </p>
        </>
      )}

      <Disclaimer extra="The 220 − age formula is a rough estimate; individual HRmax can vary by ±10–15 bpm. Consult your doctor before starting intense exercise, especially if you have a heart condition." />
    </div>
  );
}