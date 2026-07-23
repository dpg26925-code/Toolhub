import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [method, setMethod] = useState<"weight" | "bsa" | "age">("weight");
  const [adult, setAdult] = useState(500);
  const [weight, setWeight] = useState(20);
  const [height, setHeight] = useState(120);
  const [age, setAge] = useState(6);

  const r = useMemo(() => {
    let dose = 0; let note = "";
    if (method === "weight") { dose = (weight / 70) * adult; note = "Clark's rule (weight/70 kg)"; }
    else if (method === "age") { dose = (age / (age + 12)) * adult; note = "Young's rule (age/(age+12))"; }
    else { const bsa = Math.sqrt((height * weight) / 3600); dose = (bsa / 1.73) * adult; note = "BSA (Mosteller) / 1.73"; }
    return { dose, note };
  }, [method, adult, weight, height, age]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Educational estimates only. Confirm pediatric dosing with a pharmacist and current guidelines.</div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Method</Label><Select value={method} onValueChange={(v) => setMethod(v as typeof method)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="weight">By weight (Clark)</SelectItem><SelectItem value="age">By age (Young)</SelectItem><SelectItem value="bsa">By BSA</SelectItem></SelectContent></Select></div>
        <div><Label>Adult dose (mg)</Label><Input type="number" value={adult} onChange={(e) => setAdult(+e.target.value || 0)} className="mt-1"/></div>
        {method !== "age" && <div><Label>Child weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(+e.target.value || 0)} className="mt-1"/></div>}
        {method === "bsa" && <div><Label>Child height (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(+e.target.value || 0)} className="mt-1"/></div>}
        {method === "age" && <div><Label>Age (years)</Label><Input type="number" value={age} onChange={(e) => setAge(+e.target.value || 0)} className="mt-1"/></div>}
      </div>
      <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Pediatric dose ({r.note})</div><div className="mt-1 text-2xl font-bold text-primary">{r.dose.toFixed(1)} mg</div></div>
    </div>
  );
}