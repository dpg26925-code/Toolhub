import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PAIRS, LOT_UNITS, LotType, pipSize, pipValueUSD, priceDiffPips, fmt, copy } from "./_trading";

export default function PositionSizeCalculator() {
  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [pair, setPair] = useState("EUR/USD");
  const [entry, setEntry] = useState(1.1);
  const [sl, setSl] = useState(1.095);
  const [lotType, setLotType] = useState<LotType>("standard");

  const r = useMemo(() => {
    const riskUSD = (balance * riskPct) / 100;
    const pips = priceDiffPips(pair, entry, sl);
    const pv1lot = pipValueUSD(pair, LOT_UNITS[lotType], entry);
    const lots = pips > 0 && pv1lot > 0 ? riskUSD / (pips * pv1lot) : 0;
    const units = lots * LOT_UNITS[lotType];
    return { riskUSD, pips, pv1lot, lots, units };
  }, [balance, riskPct, pair, entry, sl, lotType]);

  const summary = `Pair: ${pair}\nRisk: $${fmt(r.riskUSD)} (${riskPct}%)\nSL: ${fmt(r.pips, 1)} pips\nLot size: ${fmt(r.lots, 2)} ${lotType} lots (${fmt(r.units, 0)} units)`;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Account balance ($)</Label><Input type="number" value={balance} onChange={(e) => setBalance(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Risk %</Label>
          <div className="mt-1 flex gap-2">
            <Input type="number" step="0.1" value={riskPct} onChange={(e) => setRiskPct(+e.target.value)} />
            {[1, 2, 5].map((p) => (
              <Button key={p} size="sm" variant={riskPct === p ? "default" : "outline"} onClick={() => setRiskPct(p)}>{p}%</Button>
            ))}
          </div>
        </div>
        <div>
          <Label>Currency pair</Label>
          <select value={pair} onChange={(e) => setPair(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {PAIRS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <Label>Lot type</Label>
          <select value={lotType} onChange={(e) => setLotType(e.target.value as LotType)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="standard">Standard (100k)</option>
            <option value="mini">Mini (10k)</option>
            <option value="micro">Micro (1k)</option>
          </select>
        </div>
        <div><Label>Entry price</Label><Input type="number" step="0.00001" value={entry} onChange={(e) => setEntry(+e.target.value)} className="mt-1" /></div>
        <div><Label>Stop loss price</Label><Input type="number" step="0.00001" value={sl} onChange={(e) => setSl(+e.target.value)} className="mt-1" /></div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="grid gap-3 sm:grid-cols-4 text-sm">
          <Stat label="Risk amount" value={`$${fmt(r.riskUSD)}`} />
          <Stat label="Stop distance" value={`${fmt(r.pips, 1)} pips`} />
          <Stat label="Pip value / lot" value={`$${fmt(r.pv1lot)}`} />
          <Stat label={`Position size`} value={`${fmt(r.lots, 2)} lots`} highlight />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Formula: lots = risk$ / (SL pips × pip value per lot) = {fmt(r.riskUSD)} / ({fmt(r.pips, 1)} × {fmt(r.pv1lot)})
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => { copy(summary); toast.success("Copied"); }}>Copy result</Button>
          <Button size="sm" variant="outline" onClick={() => { copy(fmt(r.lots, 2)); toast.success("Lot size copied"); }}>Copy lot size</Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Pip size auto-detects JPY pairs. Values assume USD account currency.</p>
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