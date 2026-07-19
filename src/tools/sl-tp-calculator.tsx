import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PAIRS, LOT_UNITS, LotType, pipSize, pipValueUSD, fmt, copy } from "./_trading";

type Side = "long" | "short";

export default function SlTpCalculator() {
  const [pair, setPair] = useState("EUR/USD");
  const [side, setSide] = useState<Side>("long");
  const [entry, setEntry] = useState(1.1);
  const [risk, setRisk] = useState(100);
  const [rr, setRr] = useState(2);
  const [slPips, setSlPips] = useState(50);
  const [lotType, setLotType] = useState<LotType>("standard");

  const r = useMemo(() => {
    const ps = pipSize(pair);
    const dir = side === "long" ? 1 : -1;
    const sl = entry - dir * slPips * ps;
    const tp = entry + dir * slPips * rr * ps;
    const pv1lot = pipValueUSD(pair, LOT_UNITS[lotType], entry);
    const lots = slPips > 0 && pv1lot > 0 ? risk / (slPips * pv1lot) : 0;
    const profit = risk * rr;
    return { sl, tp, lots, profit, pv1lot };
  }, [pair, side, entry, risk, rr, slPips, lotType]);

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
          <Label>Direction</Label>
          <div className="mt-1 flex gap-2">
            <Button size="sm" variant={side === "long" ? "default" : "outline"} onClick={() => setSide("long")}>Long</Button>
            <Button size="sm" variant={side === "short" ? "default" : "outline"} onClick={() => setSide("short")}>Short</Button>
          </div>
        </div>
        <div><Label>Entry price</Label><Input type="number" step="0.00001" value={entry} onChange={(e) => setEntry(+e.target.value)} className="mt-1" /></div>
        <div><Label>Risk amount ($)</Label><Input type="number" value={risk} onChange={(e) => setRisk(+e.target.value)} className="mt-1" /></div>
        <div><Label>Stop-loss distance (pips)</Label><Input type="number" value={slPips} onChange={(e) => setSlPips(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>R : R</Label>
          <div className="mt-1 flex gap-2">
            <Input type="number" step="0.1" value={rr} onChange={(e) => setRr(+e.target.value)} />
            {[1, 2, 3].map((n) => <Button key={n} size="sm" variant={rr === n ? "default" : "outline"} onClick={() => setRr(n)}>1:{n}</Button>)}
          </div>
        </div>
        <div>
          <Label>Lot type</Label>
          <select value={lotType} onChange={(e) => setLotType(e.target.value as LotType)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="standard">Standard</option><option value="mini">Mini</option><option value="micro">Micro</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="grid gap-3 sm:grid-cols-4 text-sm">
          <Stat label="Stop loss" value={fmt(r.sl, 5)} />
          <Stat label="Take profit" value={fmt(r.tp, 5)} />
          <Stat label="Lot size" value={`${fmt(r.lots, 2)} ${lotType}`} highlight />
          <Stat label="Target profit" value={`$${fmt(r.profit)}`} />
        </div>
        <Button size="sm" className="mt-3" onClick={() => { copy(`Entry ${fmt(entry, 5)} / SL ${fmt(r.sl, 5)} / TP ${fmt(r.tp, 5)} / ${fmt(r.lots, 2)} lots`); toast.success("Copied"); }}>Copy plan</Button>
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