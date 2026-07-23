import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANES: Record<string, { seaPerCbm: number; airPerKg: number; transitSea: number; transitAir: number; label: string }> = {
  "asia-us": { seaPerCbm: 180, airPerKg: 4.5, transitSea: 30, transitAir: 5, label: "Asia → US West Coast" },
  "asia-useast": { seaPerCbm: 240, airPerKg: 5, transitSea: 40, transitAir: 6, label: "Asia → US East Coast" },
  "asia-eu": { seaPerCbm: 210, airPerKg: 5.2, transitSea: 32, transitAir: 6, label: "Asia → EU" },
  "asia-uk": { seaPerCbm: 220, airPerKg: 5.5, transitSea: 35, transitAir: 6, label: "Asia → UK" },
  "asia-au": { seaPerCbm: 160, airPerKg: 4.8, transitSea: 22, transitAir: 4, label: "Asia → Australia" },
};

export default function Tool() {
  const [lane, setLane] = useState("asia-us");
  const [mode, setMode] = useState<"sea" | "air">("sea");
  const [cbm, setCbm] = useState(2);
  const [kg, setKg] = useState(500);

  const r = useMemo(() => {
    const l = LANES[lane];
    const cost = mode === "sea" ? cbm * l.seaPerCbm : kg * l.airPerKg;
    const transit = mode === "sea" ? l.transitSea : l.transitAir;
    return { cost, transit, lane: l };
  }, [lane, mode, cbm, kg]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Demo rates for estimation only. Real freight quotes vary by season, container availability and surcharges.</div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Route</Label><Select value={lane} onValueChange={setLane}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(LANES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Mode</Label><Select value={mode} onValueChange={(v) => setMode(v as "sea" | "air")}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sea">Sea (LCL)</SelectItem><SelectItem value="air">Air</SelectItem></SelectContent></Select></div>
        <div><Label>Volume (CBM)</Label><Input type="number" step="0.1" value={cbm} onChange={(e) => setCbm(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Weight (kg)</Label><Input type="number" value={kg} onChange={(e) => setKg(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Estimated freight cost" value={`$${r.cost.toFixed(2)}`} highlight/>
        <Stat label="Transit time" value={`${r.transit} days`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}