import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [pair, setPair] = useState("EURUSD");
  const [lots, setLots] = useState(1);
  const [pips, setPips] = useState(20);
  const [quote, setQuote] = useState(1.1);

  const r = useMemo(() => {
    const isJpy = pair.endsWith("JPY");
    const pipSize = isJpy ? 0.01 : 0.0001;
    const unitsPerLot = 100000;
    const pipValueUsd = (pipSize * unitsPerLot * lots) / (isJpy ? quote : 1);
    const total = pipValueUsd * pips;
    return { pipValueUsd, total };
  }, [pair, lots, pips, quote]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Pair</Label><Select value={pair} onValueChange={setPair}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "EURJPY"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Lots (1 = 100k)</Label><Input type="number" step="0.01" value={lots} onChange={(e) => setLots(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Pips</Label><Input type="number" value={pips} onChange={(e) => setPips(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Quote rate</Label><Input type="number" step="0.0001" value={quote} onChange={(e) => setQuote(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Pip value" value={`$${r.pipValueUsd.toFixed(2)}`}/>
        <Stat label="Total P/L" value={`$${r.total.toFixed(2)}`} highlight/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}