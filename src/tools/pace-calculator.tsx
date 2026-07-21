import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Disclaimer, Stat, round } from "./_health";

type Unit = "km" | "mi";

const PRESETS: { label: string; km: number }[] = [
  { label: "100 m", km: 0.1 },
  { label: "400 m", km: 0.4 },
  { label: "1 mile", km: 1.609344 },
  { label: "5K", km: 5 },
  { label: "10K", km: 10 },
  { label: "Half marathon", km: 21.0975 },
  { label: "Marathon", km: 42.195 },
];

function fmtPace(secPerUnit: number) {
  if (!isFinite(secPerUnit) || secPerUnit <= 0) return "—";
  const m = Math.floor(secPerUnit / 60);
  const s = Math.round(secPerUnit - m * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
function fmtTime(sec: number) {
  if (!isFinite(sec) || sec <= 0) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec - h * 3600) / 60);
  const s = Math.round(sec - h * 3600 - m * 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export default function PaceCalculator() {
  const [unit, setUnit] = useState<Unit>("km");
  const [distance, setDistance] = useState<number>(5);
  const [h, setH] = useState(0);
  const [m, setM] = useState(25);
  const [s, setS] = useState(0);

  const totalSec = Math.max(0, h * 3600 + m * 60 + s);
  const km = unit === "km" ? distance : distance * 1.609344;

  const r = useMemo(() => {
    if (km <= 0 || totalSec <= 0) return null;
    const paceSecPerKm = totalSec / km;
    const paceSecPerMi = paceSecPerKm * 1.609344;
    const kph = km / (totalSec / 3600);
    const mph = kph / 1.609344;
    return { paceSecPerKm, paceSecPerMi, kph, mph };
  }, [km, totalSec]);

  const splits = useMemo(() => {
    if (!r) return [];
    const perUnit = unit === "km" ? r.paceSecPerKm : r.paceSecPerMi;
    const rows: { label: string; cum: number }[] = [];
    const n = Math.min(Math.ceil(distance), 42);
    for (let i = 1; i <= n; i++) rows.push({ label: `${i} ${unit}`, cum: perUnit * i });
    return rows;
  }, [r, unit, distance]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={unit === "km" ? "default" : "outline"} onClick={() => setUnit("km")}>Kilometres</Button>
        <Button size="sm" variant={unit === "mi" ? "default" : "outline"} onClick={() => setUnit("mi")}>Miles</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.label} variant="outline" size="sm" onClick={() => { setUnit("km"); setDistance(p.km); }}>
            {p.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <Label>Distance ({unit})</Label>
          <Input type="number" step="0.01" value={distance} onChange={(e) => setDistance(+e.target.value)} className="mt-1" />
        </div>
        <div><Label>Hours</Label><Input type="number" value={h} onChange={(e) => setH(+e.target.value)} className="mt-1" /></div>
        <div><Label>Minutes</Label><Input type="number" value={m} onChange={(e) => setM(+e.target.value)} className="mt-1" /></div>
        <div><Label>Seconds</Label><Input type="number" value={s} onChange={(e) => setS(+e.target.value)} className="mt-1" /></div>
      </div>

      {r && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-4">
            <Stat label="Pace / km" value={`${fmtPace(r.paceSecPerKm)} /km`} highlight />
            <Stat label="Pace / mile" value={`${fmtPace(r.paceSecPerMi)} /mi`} highlight />
            <Stat label="Speed" value={`${round(r.kph, 2)} km/h`} hint={`${round(r.mph, 2)} mph`} />
            <Stat label="Total time" value={fmtTime(totalSec)} />
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Predicted finish time at this pace</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {PRESETS.map((p) => {
                const t = r.paceSecPerKm * p.km;
                return (
                  <div key={p.label} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-semibold">{fmtTime(t)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {splits.length > 1 && (
            <div className="rounded-xl border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold">Cumulative splits</h3>
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr><th className="py-1 text-left">Marker</th><th className="py-1 text-right">Elapsed</th></tr>
                  </thead>
                  <tbody>
                    {splits.map((row) => (
                      <tr key={row.label} className="border-t border-border">
                        <td className="py-1">{row.label}</td>
                        <td className="py-1 text-right font-medium">{fmtTime(row.cum)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <Disclaimer extra="Predicted finish times assume constant effort. Real races vary with terrain, weather, fatigue and pacing strategy." />
    </div>
  );
}