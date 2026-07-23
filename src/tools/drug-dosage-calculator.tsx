import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [weight, setWeight] = useState(70);
  const [dosePerKg, setDosePerKg] = useState(10);
  const [freq, setFreq] = useState(3);
  const [conc, setConc] = useState(100);
  const [unit, setUnit] = useState<"mg" | "mcg">("mg");

  const r = useMemo(() => {
    const total = weight * dosePerKg;
    const perDose = total / freq;
    const ml = perDose / conc;
    return { total, perDose, ml };
  }, [weight, dosePerKg, freq, conc]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">⚕️ Educational reference only. Verify all dosages against pharmacy guidance and prescribing labels.</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Patient weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Dose per kg</Label><Input type="number" step="0.1" value={dosePerKg} onChange={(e) => setDosePerKg(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Unit</Label><Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="mg">mg/kg</SelectItem><SelectItem value="mcg">mcg/kg</SelectItem></SelectContent></Select></div>
        <div><Label>Doses per day</Label><Input type="number" value={freq} onChange={(e) => setFreq(+e.target.value || 0)} className="mt-1"/></div>
        <div className="sm:col-span-2"><Label>Concentration ({unit}/mL)</Label><Input type="number" value={conc} onChange={(e) => setConc(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Daily total" value={`${r.total.toFixed(2)} ${unit}`}/>
        <Stat label="Per dose" value={`${r.perDose.toFixed(2)} ${unit}`} highlight/>
        <Stat label="Volume per dose" value={`${r.ml.toFixed(2)} mL`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}