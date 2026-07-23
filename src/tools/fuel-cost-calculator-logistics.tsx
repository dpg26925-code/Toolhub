import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VEHICLES: Record<string, number> = { "Sedan (7L/100km)": 7, "SUV (10L/100km)": 10, "Van (13L/100km)": 13, "Truck 3.5t (20L/100km)": 20, "Truck 10t (28L/100km)": 28, "Heavy truck 40t (35L/100km)": 35 };

export default function Tool() {
  const [dist, setDist] = useState(500);
  const [unit, setUnit] = useState<"km" | "mi">("km");
  const [vehicle, setVehicle] = useState("Truck 3.5t (20L/100km)");
  const [price, setPrice] = useState(1.5);

  const r = useMemo(() => {
    const km = unit === "mi" ? dist * 1.60934 : dist;
    const consumption = VEHICLES[vehicle];
    const litres = (km / 100) * consumption;
    const total = litres * price;
    const perUnit = total / (dist || 1);
    return { km, litres, total, perUnit };
  }, [dist, unit, vehicle, price]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Distance</Label><Input type="number" value={dist} onChange={(e) => setDist(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Unit</Label><Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="km">km</SelectItem><SelectItem value="mi">mi</SelectItem></SelectContent></Select></div>
        <div className="sm:col-span-2"><Label>Vehicle</Label><Select value={vehicle} onValueChange={setVehicle}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{Object.keys(VEHICLES).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Fuel price ($/L)</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Fuel used" value={`${r.litres.toFixed(1)} L`}/>
        <Stat label="Total cost" value={`$${r.total.toFixed(2)}`} highlight/>
        <Stat label={`Cost per ${unit}`} value={`$${r.perUnit.toFixed(3)}`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}