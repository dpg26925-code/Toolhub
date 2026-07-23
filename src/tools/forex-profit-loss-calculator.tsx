import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [side, setSide] = useState<"long" | "short">("long");
  const [units, setUnits] = useState(100000);
  const [entry, setEntry] = useState(1.1);
  const [exit, setExit] = useState(1.11);

  const r = useMemo(() => {
    const diff = side === "long" ? exit - entry : entry - exit;
    const pnl = diff * units;
    const pips = (diff / entry) * 10000;
    return { pnl, pips };
  }, [side, units, entry, exit]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Position</Label><Select value={side} onValueChange={(v) => setSide(v as typeof side)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="long">Long</SelectItem><SelectItem value="short">Short</SelectItem></SelectContent></Select></div>
        <div><Label>Units</Label><Input type="number" value={units} onChange={(e) => setUnits(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Entry</Label><Input type="number" step="0.0001" value={entry} onChange={(e) => setEntry(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Exit</Label><Input type="number" step="0.0001" value={exit} onChange={(e) => setExit(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`rounded-lg border p-3 ${r.pnl >= 0 ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"}`}><div className="text-xs text-muted-foreground">Profit / loss</div><div className={`mt-1 text-2xl font-bold ${r.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>${r.pnl.toFixed(2)}</div></div>
        <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Pips</div><div className="mt-1 text-2xl font-bold">{r.pips.toFixed(1)}</div></div>
      </div>
    </div>
  );
}