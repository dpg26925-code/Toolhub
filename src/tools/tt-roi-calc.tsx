import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TtRoiCalc() {
  const [revenue, setRevenue] = useState(2500);
  const [cost, setCost] = useState(800);
  const profit = revenue - cost;
  const roi = cost ? (profit / cost) * 100 : 0;
  const roas = cost ? revenue / cost : 0;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Revenue ($)</Label><Input type="number" min={0} value={revenue} onChange={(e) => setRevenue(+e.target.value || 0)} className="mt-1" /></div>
        <div><Label>Cost ($)</Label><Input type="number" min={0} value={cost} onChange={(e) => setCost(+e.target.value || 0)} className="mt-1" /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Box l="Profit" v={`$${profit.toFixed(2)}`} bad={profit < 0} />
        <Box l="ROI" v={`${roi.toFixed(1)}%`} bad={roi < 0} />
        <Box l="ROAS" v={`${roas.toFixed(2)}×`} bad={roas < 1} />
      </div>
    </div>
  );
}
function Box({ l, v, bad }: { l: string; v: string; bad?: boolean }) {
  return <div className={`rounded-xl border p-4 ${bad ? "border-destructive/50 bg-destructive/5" : "bg-card"}`}><div className="text-xs text-muted-foreground">{l}</div><div className="mt-1 text-3xl font-bold">{v}</div></div>;
}