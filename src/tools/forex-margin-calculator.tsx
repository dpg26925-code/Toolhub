import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [units, setUnits] = useState(100000);
  const [rate, setRate] = useState(1.1);
  const [leverage, setLeverage] = useState("100");
  const r = useMemo(() => (units * rate) / +leverage, [units, rate, leverage]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Position size (units)</Label><Input type="number" value={units} onChange={(e) => setUnits(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Base to account rate</Label><Input type="number" step="0.0001" value={rate} onChange={(e) => setRate(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Leverage</Label><Select value={leverage} onValueChange={setLeverage}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{["10", "20", "30", "50", "100", "200", "500"].map((l) => <SelectItem key={l} value={l}>1:{l}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="rounded-lg border bg-primary/5 p-3"><div className="text-xs text-muted-foreground">Margin required</div><div className="mt-1 text-3xl font-bold text-primary">${r.toFixed(2)}</div></div>
    </div>
  );
}