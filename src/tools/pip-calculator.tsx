import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PAIRS, LOT_UNITS, LotType, pipSize, pipValueUSD, priceDiffPips, fmt, copy } from "./_trading";

export default function PipCalculator() {
  const [pair, setPair] = useState("EUR/USD");
  const [lots, setLots] = useState(1);
  const [lotType, setLotType] = useState<LotType>("standard");
  const [entry, setEntry] = useState(1.1);
  const [exit, setExit] = useState(1.105);

  const r = useMemo(() => {
    const units = lots * LOT_UNITS[lotType];
    const pips = priceDiffPips(pair, entry, exit) * (exit >= entry ? 1 : -1);
    const pv = pipValueUSD(pair, units, entry);
    const pl = pips * pv;
    return { pips, pv, pl, units, ps: pipSize(pair) };
  }, [pair, lots, lotType, entry, exit]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Pair</Label>
          <select value={pair} onChange={(e) => setPair(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {PAIRS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <Label>Lot size</Label>
          <div className="mt-1 flex gap-2">
            <Input type="number" step="0.01" value={lots} onChange={(e) => setLots(+e.target.value)} />
            <select value={lotType} onChange={(e) => setLotType(e.target.value as LotType)} className="rounded-md border border-input bg-background px-2 text-sm">
              <option value="standard">std</option><option value="mini">mini</option><option value="micro">micro</option>
            </select>
          </div>
        </div>
        <div><Label>Entry</Label><Input type="number" step="0.00001" value={entry} onChange={(e) => setEntry(+e.target.value)} className="mt-1" /></div>
        <div><Label>Exit</Label><Input type="number" step="0.00001" value={exit} onChange={(e) => setExit(+e.target.value)} className="mt-1" /></div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="grid gap-3 sm:grid-cols-4 text-sm">
          <Stat label="Pip size" value={r.ps.toString()} />
          <Stat label="Pips" value={`${r.pips >= 0 ? "+" : ""}${fmt(r.pips, 1)}`} />
          <Stat label="Pip value" value={`$${fmt(r.pv)}`} />
          <Stat label="Total P/L" value={`${r.pl >= 0 ? "+" : "-"}$${fmt(Math.abs(r.pl))}`} highlight />
        </div>
        <Button size="sm" className="mt-3" onClick={() => { copy(`${pair} ${fmt(r.pips, 1)} pips = $${fmt(r.pl)}`); toast.success("Copied"); }}>Copy result</Button>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-semibold ${highlight ? "text-primary text-lg" : "text-foreground"}`}>{value}</div>
    </div>
  );
}