import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PAIRS, LOT_UNITS, LotType, pipSize, pipValueUSD, fmt, copy } from "./_trading";

export default function BreakEvenCalculator() {
  const [pair, setPair] = useState("EUR/USD");
  const [entry, setEntry] = useState(1.10);
  const [lots, setLots] = useState(1);
  const [lotType, setLotType] = useState<LotType>("standard");
  const [commission, setCommission] = useState(7);
  const [spread, setSpread] = useState(1.5);
  const [side, setSide] = useState<"long" | "short">("long");

  const r = useMemo(() => {
    const units = lots * LOT_UNITS[lotType];
    const pv = pipValueUSD(pair, units, entry);
    const costUSD = commission;
    const commPips = pv > 0 ? costUSD / pv : 0;
    const totalPips = commPips + spread;
    const dir = side === "long" ? 1 : -1;
    const be = entry + dir * totalPips * pipSize(pair);
    return { commPips, totalPips, be, pv };
  }, [pair, entry, lots, lotType, commission, spread, side]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Pair</Label>
          <select value={pair} onChange={(e) => setPair(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{PAIRS.map((p) => <option key={p}>{p}</option>)}</select>
        </div>
        <div>
          <Label>Side</Label>
          <div className="mt-1 flex gap-2">
            <Button size="sm" variant={side === "long" ? "default" : "outline"} onClick={() => setSide("long")}>Long</Button>
            <Button size="sm" variant={side === "short" ? "default" : "outline"} onClick={() => setSide("short")}>Short</Button>
          </div>
        </div>
        <div><Label>Entry price</Label><Input type="number" step="0.00001" value={entry} onChange={(e) => setEntry(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Lot size</Label>
          <div className="mt-1 flex gap-2">
            <Input type="number" step="0.01" value={lots} onChange={(e) => setLots(+e.target.value)} />
            <select value={lotType} onChange={(e) => setLotType(e.target.value as LotType)} className="rounded-md border border-input bg-background px-2 text-sm">
              <option value="standard">std</option><option value="mini">mini</option><option value="micro">micro</option>
            </select>
          </div>
        </div>
        <div><Label>Commission per lot ($)</Label><Input type="number" step="0.1" value={commission} onChange={(e) => setCommission(+e.target.value)} className="mt-1" /></div>
        <div><Label>Spread (pips)</Label><Input type="number" step="0.1" value={spread} onChange={(e) => setSpread(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div><div className="text-xs uppercase text-muted-foreground">Commission cost</div><div className="mt-1 font-semibold">{fmt(r.commPips, 2)} pips</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Break-even move</div><div className="mt-1 font-semibold">{fmt(r.totalPips, 2)} pips</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Break-even price</div><div className="mt-1 text-lg font-semibold text-primary">{fmt(r.be, 5)}</div></div>
        </div>
        <Button size="sm" className="mt-3" onClick={() => { copy(`Break-even at ${fmt(r.be, 5)} (${fmt(r.totalPips, 2)} pips)`); toast.success("Copied"); }}>Copy result</Button>
      </div>
    </div>
  );
}