import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PAIRS, LOT_UNITS, LotType, pipValueUSD, priceDiffPips, pipSize, fmt, copy } from "./_trading";

export default function ProfitCalculator() {
  const [pair, setPair] = useState("EUR/USD");
  const [buy, setBuy] = useState(1.10);
  const [sell, setSell] = useState(1.105);
  const [lots, setLots] = useState(1);
  const [lotType, setLotType] = useState<LotType>("standard");
  const [commission, setCommission] = useState(7);

  const r = useMemo(() => {
    const units = lots * LOT_UNITS[lotType];
    const pv = pipValueUSD(pair, units, buy);
    const pips = (sell - buy) / pipSize(pair);
    const gross = pips * pv;
    const net = gross - commission;
    const roiBase = buy * units;
    const roi = roiBase > 0 ? (net / roiBase) * 100 : 0;
    return { pv, pips, gross, net, roi };
  }, [pair, buy, sell, lots, lotType, commission]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Pair</Label>
          <select value={pair} onChange={(e) => setPair(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{PAIRS.map((p) => <option key={p}>{p}</option>)}</select>
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
        <div><Label>Buy price</Label><Input type="number" step="0.00001" value={buy} onChange={(e) => setBuy(+e.target.value)} className="mt-1" /></div>
        <div><Label>Sell price</Label><Input type="number" step="0.00001" value={sell} onChange={(e) => setSell(+e.target.value)} className="mt-1" /></div>
        <div><Label>Commission ($)</Label><Input type="number" value={commission} onChange={(e) => setCommission(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="grid gap-3 sm:grid-cols-4 text-sm">
          <div><div className="text-xs uppercase text-muted-foreground">Pips</div><div className="mt-1 font-semibold">{fmt(r.pips, 1)}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Gross P/L</div><div className="mt-1 font-semibold">${fmt(r.gross)}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Net P/L</div><div className={`mt-1 text-lg font-semibold ${r.net >= 0 ? "text-green-600" : "text-red-600"}`}>${fmt(r.net)}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">ROI</div><div className="mt-1 font-semibold">{fmt(r.roi, 3)}%</div></div>
        </div>
        <Button size="sm" className="mt-3" onClick={() => { copy(`${pair} ${fmt(r.pips, 1)} pips → $${fmt(r.net)} net`); toast.success("Copied"); }}>Copy result</Button>
      </div>
    </div>
  );
}