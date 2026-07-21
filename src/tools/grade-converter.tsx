import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Stat, LETTER_4, pctToLetter, round } from "./_edu";

type System = "percent" | "letter" | "gpa4";

// Percentage -> various systems
function toUK(pct: number) {
  if (pct >= 70) return "First (1st)";
  if (pct >= 60) return "Upper Second (2:1)";
  if (pct >= 50) return "Lower Second (2:2)";
  if (pct >= 40) return "Third (3rd)";
  return "Fail";
}
function toIndia10(pct: number) {
  // CGPA (10-point) ≈ pct / 9.5 (Indian CBSE convention)
  return Math.max(0, Math.min(10, pct / 9.5));
}
function toGermany(pct: number) {
  // Modified Bavarian formula: 1 + 3 * (Nmax - N) / (Nmax - Nmin), Nmax=100, Nmin=50
  if (pct < 50) return 5.0;
  const g = 1 + (3 * (100 - pct)) / 50;
  return Math.max(1.0, Math.min(4.0, g));
}

export default function GradeConverter() {
  const [system, setSystem] = useState<System>("percent");
  const [pctIn, setPctIn] = useState(85);
  const [letterIn, setLetterIn] = useState("A-");
  const [gpaIn, setGpaIn] = useState(3.7);

  const pct = useMemo(() => {
    if (system === "percent") return Math.max(0, Math.min(100, pctIn));
    if (system === "letter") {
      const row = LETTER_4.find((r) => r.l.toUpperCase() === letterIn.toUpperCase());
      return row ? row.pctMin + (row.l === "A+" ? 1.5 : 2) : 0;
    }
    // gpa4 -> percent: find nearest letter mapping
    const g = Math.max(0, Math.min(4, gpaIn));
    const row = LETTER_4.slice().sort((a, b) => Math.abs(a.g - g) - Math.abs(b.g - g))[0];
    return row.pctMin + 2;
  }, [system, pctIn, letterIn, gpaIn]);

  const letter = pctToLetter(pct);
  const gpa4 = LETTER_4.find((r) => r.l === letter)?.g ?? 0;
  const uk = toUK(pct);
  const india = toIndia10(pct);
  const germany = toGermany(pct);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={system === "percent" ? "default" : "outline"} onClick={() => setSystem("percent")}>Percentage</Button>
        <Button size="sm" variant={system === "letter" ? "default" : "outline"} onClick={() => setSystem("letter")}>Letter grade</Button>
        <Button size="sm" variant={system === "gpa4" ? "default" : "outline"} onClick={() => setSystem("gpa4")}>GPA (4.0)</Button>
      </div>

      {system === "percent" && (
        <div>
          <Label>Percentage (0–100)</Label>
          <Input type="number" min={0} max={100} value={pctIn} onChange={(e) => setPctIn(+e.target.value)} className="mt-1 max-w-xs" />
        </div>
      )}
      {system === "letter" && (
        <div>
          <Label>Letter grade</Label>
          <select value={letterIn} onChange={(e) => setLetterIn(e.target.value)} className="mt-1 block w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm">
            {LETTER_4.map((r) => (
              <option key={r.l} value={r.l}>{r.l}</option>
            ))}
          </select>
        </div>
      )}
      {system === "gpa4" && (
        <div>
          <Label>GPA (0.0 – 4.0)</Label>
          <Input type="number" min={0} max={4} step="0.01" value={gpaIn} onChange={(e) => setGpaIn(+e.target.value)} className="mt-1 max-w-xs" />
        </div>
      )}

      <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Percentage" value={`${round(pct, 1)} %`} highlight />
        <Stat label="Letter grade (US)" value={letter} />
        <Stat label="GPA (4.0 scale)" value={round(gpa4, 2)} />
        <Stat label="UK (honours)" value={uk} />
        <Stat label="India (CGPA, 10-pt)" value={round(india, 2)} hint="CBSE: CGPA = % / 9.5" />
        <Stat label="Germany (1.0–5.0)" value={round(germany, 2)} hint="Modified Bavarian formula (1.0 best, 5.0 fail)" />
      </div>

      <p className="text-xs text-muted-foreground">
        Grade conversions vary by institution. These follow common conventions (US +/- letter, WES-style
        UK, CBSE India, Bavarian Germany). Always double-check against your school's official policy.
      </p>
    </div>
  );
}