import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PAIRS, LOT_UNITS, LotType, pipValueUSD, fmt, copy } from "./_trading";

const RISKS = [0.5, 1, 2, 3];

export default function LotSizeOptimizer() {
  const [balance, setBalance] = useState(10000);
  const [slPips, setSlPips] = useState(30);
  const [pair, setPair] = useState("EUR/USD");
  const [price, setPrice] = useState(1.1);
  const [lotType, setLotType] = useState<LotType>("standard");

  const rows = useMemo(() => {
    const pv1lot = pipValueUSD(pair, LOT_UNITS[lotType], price);
    return RISKS.map((riskPct) => {
      const riskUSD = (balance * riskPct) / 100;
      const lots = slPips > 0 && pv1lot > 0 ? riskUSD / (slPips * pv1lot) : 0;
      const dd10 = riskUSD * 10;
      return { riskPct, riskUSD, lots, dd10 };
    });
  }, [balance, slPips, pair, price, lotType]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Balance ($)</Label><Input type="number" value={balance} onChange={(e) => setBalance(+e.target.value)} className="mt-1" /></div>
        <div><Label>SL (pips)</Label><Input type="number" value={slPips} onChange={(e) => setSlPips(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Pair</Label>
          <select value={pair} onChange={(e) => setPair(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-2 text-sm">{PAIRS.map((p) => <option key={p}>{p}</option>)}</select>
        </div>
        <div>
          <Label>Lot type</Label>
          <select value={lotType} onChange={(e) => setLotType(e.target.value as LotType)} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-2 text-sm">
            <option value="standard">Standard</option><option value="mini">Mini</option><option value="micro">Micro</option>
          </select>
        </div>
        <div className="sm:col-span-4"><Label>Reference price</Label><Input type="number" step="0.00001" value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-1" /></div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr><th className="p-2 text-left">Risk %</th><th className="p-2 text-right">Risk $</th><th className="p-2 text-right">Lot size</th><th className="p-2 text-right">10-loss drawdown</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.riskPct} className="border-t border-border/40">
                <td className="p-2 font-medium">{r.riskPct}%</td>
                <td className="p-2 text-right">${fmt(r.riskUSD)}</td>
                <td className="p-2 text-right font-semibold text-primary">{fmt(r.lots, 2)}</td>
                <td className="p-2 text-right text-muted-foreground">-${fmt(r.dd10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button size="sm" variant="outline" onClick={() => { copy(rows.map((r) => `${r.riskPct}%\t$${fmt(r.riskUSD)}\t${fmt(r.lots, 2)} lots`).join("\n")); toast.success("Copied"); }}>Copy table</Button>
    </div>
  );
}