import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [rise, setRise] = useState(4);
  const [run, setRun] = useState(12);

  const r = useMemo(() => {
    const angle = Math.atan(rise / run) * (180 / Math.PI);
    const slope = Math.sqrt(rise * rise + run * run);
    const factor = slope / run;
    const ratio = `${rise}:${run}`;
    return { angle, slope, factor, ratio };
  }, [rise, run]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Rise</Label><Input type="number" step="0.1" value={rise} onChange={(e) => setRise(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Run</Label><Input type="number" step="0.1" value={run} onChange={(e) => setRun(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Ratio" value={r.ratio}/>
        <Stat label="Angle" value={`${r.angle.toFixed(1)}°`} highlight/>
        <Stat label="Slope length" value={r.slope.toFixed(2)}/>
        <Stat label="Roof factor" value={r.factor.toFixed(3)}/>
      </div>
      <div className="rounded-lg border p-3 text-xs">Multiply the plan area by <strong>roof factor</strong> to get actual roof surface area for material estimates.</div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}