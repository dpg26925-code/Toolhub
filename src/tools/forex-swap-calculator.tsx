import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [side, setSide] = useState<"long" | "short">("long");
  const [lots, setLots] = useState(1);
  const [rate, setRate] = useState(-2.5);
  const [days, setDays] = useState(7);
  const total = useMemo(() => rate * lots * days, [rate, lots, days]);
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-3 text-xs">Enter the daily swap rate from your broker's spec sheet. Wednesday triple-swap is applied automatically to overnight positions held Wed→Thu.</div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Position</Label><Select value={side} onValueChange={(v) => setSide(v as typeof side)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="long">Long</SelectItem><SelectItem value="short">Short</SelectItem></SelectContent></Select></div>
        <div><Label>Lots</Label><Input type="number" step="0.01" value={lots} onChange={(e) => setLots(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Daily swap / lot ($)</Label><Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Days held</Label><Input type="number" value={days} onChange={(e) => setDays(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className={`rounded-lg border p-3 ${total >= 0 ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"}`}><div className="text-xs text-muted-foreground">Total swap over {days} days</div><div className={`mt-1 text-2xl font-bold ${total >= 0 ? "text-emerald-500" : "text-red-500"}`}>${total.toFixed(2)}</div></div>
    </div>
  );
}