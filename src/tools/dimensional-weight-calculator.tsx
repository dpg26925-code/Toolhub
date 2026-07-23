import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DIM: Record<string, number> = { "DHL/FedEx/UPS (5000)": 5000, "USPS/EMS (6000)": 6000, "Ground/LTL (7000)": 7000 };

export default function Tool() {
  const [l, setL] = useState(40);
  const [w, setW] = useState(30);
  const [h, setH] = useState(20);
  const [weight, setWeight] = useState(3);
  const [factorKey, setFactorKey] = useState("DHL/FedEx/UPS (5000)");

  const r = useMemo(() => {
    const f = DIM[factorKey];
    const dim = (l * w * h) / f;
    const chargeable = Math.max(dim, weight);
    const which = dim > weight ? "Dimensional" : "Actual";
    return { dim, chargeable, which };
  }, [l, w, h, weight, factorKey]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-5">
        <div><Label>Length (cm)</Label><Input type="number" value={l} onChange={(e) => setL(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Width (cm)</Label><Input type="number" value={w} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Height (cm)</Label><Input type="number" value={h} onChange={(e) => setH(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Actual weight (kg)</Label><Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>DIM factor</Label><Select value={factorKey} onValueChange={setFactorKey}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{Object.keys(DIM).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Dimensional weight" value={`${r.dim.toFixed(2)} kg`}/>
        <Stat label="Actual weight" value={`${weight.toFixed(2)} kg`}/>
        <Stat label={`Chargeable (${r.which})`} value={`${r.chargeable.toFixed(2)} kg`} highlight/>
      </div>
      <div className="rounded-lg border p-3 text-sm">Carriers bill the greater of actual and dimensional weight. Formula: <code className="rounded bg-muted px-1">DIM = L × W × H ÷ factor</code></div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}