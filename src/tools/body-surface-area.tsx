import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Disclaimer, Stat, ftInToCm, lbsToKg, round } from "./_health";

type Unit = "metric" | "imperial";

function mosteller(hCm: number, wKg: number) { return Math.sqrt((hCm * wKg) / 3600); }
function duBois(hCm: number, wKg: number) { return 0.007184 * Math.pow(hCm, 0.725) * Math.pow(wKg, 0.425); }
function haycock(hCm: number, wKg: number) { return 0.024265 * Math.pow(hCm, 0.3964) * Math.pow(wKg, 0.5378); }
function gehanGeorge(hCm: number, wKg: number) { return 0.0235 * Math.pow(hCm, 0.42246) * Math.pow(wKg, 0.51456); }

export default function BodySurfaceArea() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [cm, setCm] = useState(170);
  const [ft, setFt] = useState(5);
  const [inches, setInches] = useState(7);
  const [kg, setKg] = useState(70);
  const [lbs, setLbs] = useState(154);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<"male" | "female">("male");

  const r = useMemo(() => {
    const hCm = unit === "metric" ? cm : ftInToCm(ft, inches);
    const wKg = unit === "metric" ? kg : lbsToKg(lbs);
    if (hCm <= 0 || wKg <= 0) return null;
    const formulas = [
      { name: "Mosteller", v: mosteller(hCm, wKg) },
      { name: "Du Bois", v: duBois(hCm, wKg) },
      { name: "Haycock", v: haycock(hCm, wKg) },
      { name: "Gehan & George", v: gehanGeorge(hCm, wKg) },
    ];
    const avg = formulas.reduce((a, b) => a + b.v, 0) / formulas.length;
    const hM = hCm / 100;
    const bmi = wKg / (hM * hM);
    // Devine ideal body weight
    const hIn = hCm / 2.54;
    const over5ft = Math.max(0, hIn - 60);
    const ibwKg = (gender === "male" ? 50 : 45.5) + 2.3 * over5ft;
    return { formulas, avg, bmi, ibwKg, hCm, wKg };
  }, [unit, cm, ft, inches, kg, lbs, gender]);

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
            <Stat label="BSA (Mosteller)" value={`${round(r.formulas[0].v, 2)} m²`} highlight />
            <Stat label="BMI" value={round(r.bmi, 1)} />
            <Stat label="Ideal body weight (Devine)" value={unit === "metric" ? `${round(r.ibwKg, 1)} kg` : `${round(r.ibwKg / 0.45359237, 1)} lbs`} />
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">All formulas</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {r.formulas.map((f) => {
                const max = Math.max(...r.formulas.map((x) => x.v));
                const pct = (f.v / max) * 100;
                return (
                  <div key={f.name}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{f.name}</span>
                      <span className="font-semibold text-foreground">{round(f.v, 3)} m²</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Average across formulas: <strong className="text-foreground">{round(r.avg, 3)} m²</strong></div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Body surface diagram</h3>
            <div className="flex items-end justify-center gap-6">
              <svg viewBox="0 0 100 200" className="h-48 w-auto text-primary">
                <ellipse cx="50" cy="20" rx="12" ry="14" fill="currentColor" opacity="0.7" />
                <path d="M30 40 Q50 32 70 40 L74 120 Q70 128 50 128 Q30 128 26 120 Z" fill="currentColor" opacity="0.5" />
                <path d="M28 42 L18 110 L22 112 L34 48 Z" fill="currentColor" opacity="0.5" />
                <path d="M72 42 L82 110 L78 112 L66 48 Z" fill="currentColor" opacity="0.5" />
                <path d="M34 128 L30 195 L40 195 L46 130 Z" fill="currentColor" opacity="0.6" />
                <path d="M66 128 L70 195 L60 195 L54 130 Z" fill="currentColor" opacity="0.6" />
              </svg>
              <div className="text-sm">
                <div className="text-xs uppercase text-muted-foreground">Estimated skin area</div>
                <div className="mt-1 text-3xl font-bold text-primary">{round(r.formulas[0].v, 2)} m²</div>
                <div className="mt-1 text-xs text-muted-foreground">≈ {round(r.formulas[0].v * 10.7639, 1)} sq ft</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Common uses:</strong> chemotherapy dosing (mg/m²), cardiac index, glomerular filtration rate normalisation and burn estimation.
          </div>
        </>
      )}

      <Disclaimer extra="BSA is used clinically for medication dosing. Never self-dose based on this estimate — dosing must be prescribed by a qualified physician." />
    </div>
  );
}