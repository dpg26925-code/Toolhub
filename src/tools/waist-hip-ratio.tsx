import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [waist, setWaist] = useState(80);
  const [hip, setHip] = useState(95);
  const [sex, setSex] = useState<"m" | "f">("m");

  const r = useMemo(() => {
    const ratio = waist / hip;
    let risk = "";
    if (sex === "m") risk = ratio < 0.9 ? "Low" : ratio < 1.0 ? "Moderate" : "High";
    else risk = ratio < 0.8 ? "Low" : ratio < 0.85 ? "Moderate" : "High";
    return { ratio, risk };
  }, [waist, hip, sex]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Waist (cm)</Label><Input type="number" value={waist} onChange={(e) => setWaist(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Hip (cm)</Label><Input type="number" value={hip} onChange={(e) => setHip(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Sex</Label><Select value={sex} onValueChange={(v) => setSex(v as typeof sex)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="m">Male</SelectItem><SelectItem value="f">Female</SelectItem></SelectContent></Select></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Waist-to-hip ratio" value={r.ratio.toFixed(2)} highlight/>
        <Stat label="Cardio-metabolic risk" value={r.risk}/>
      </div>
      <div className="rounded-lg border p-3 text-xs">WHO thresholds — Men: &lt;0.90 low, 0.90-0.99 moderate, ≥1.0 high. Women: &lt;0.80 low, 0.80-0.84 moderate, ≥0.85 high.</div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}