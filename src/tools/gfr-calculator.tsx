import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [age, setAge] = useState(50);
  const [sex, setSex] = useState<"m" | "f">("m");
  const [race, setRace] = useState<"other" | "black">("other");
  const [cr, setCr] = useState(1.0);

  const r = useMemo(() => {
    // CKD-EPI 2009 (mg/dL creatinine)
    const k = sex === "f" ? 0.7 : 0.9;
    const a = sex === "f" ? -0.329 : -0.411;
    const minR = Math.min(cr / k, 1);
    const maxR = Math.max(cr / k, 1);
    let egfr = 141 * Math.pow(minR, a) * Math.pow(maxR, -1.209) * Math.pow(0.993, age);
    if (sex === "f") egfr *= 1.018;
    if (race === "black") egfr *= 1.159;
    const stage = egfr >= 90 ? "G1 – Normal" : egfr >= 60 ? "G2 – Mildly decreased" : egfr >= 45 ? "G3a – Mild-mod" : egfr >= 30 ? "G3b – Mod-severe" : egfr >= 15 ? "G4 – Severe" : "G5 – Kidney failure";
    return { egfr, stage };
  }, [age, sex, race, cr]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">CKD-EPI 2009 formula. Clinical decisions must involve a qualified physician.</div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Age</Label><Input type="number" value={age} onChange={(e) => setAge(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Sex</Label><Select value={sex} onValueChange={(v) => setSex(v as typeof sex)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="m">Male</SelectItem><SelectItem value="f">Female</SelectItem></SelectContent></Select></div>
        <div><Label>Race</Label><Select value={race} onValueChange={(v) => setRace(v as typeof race)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="other">Other</SelectItem><SelectItem value="black">Black</SelectItem></SelectContent></Select></div>
        <div><Label>Serum creatinine (mg/dL)</Label><Input type="number" step="0.01" value={cr} onChange={(e) => setCr(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="eGFR" value={`${r.egfr.toFixed(1)} mL/min/1.73m²`} highlight/>
        <Stat label="CKD stage" value={r.stage}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}