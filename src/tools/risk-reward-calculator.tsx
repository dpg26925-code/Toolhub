import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PAIRS, LOT_UNITS, LotType, pipValueUSD, priceDiffPips, fmt, copy } from "./_trading";

export default function RiskRewardCalculator() {
  const [pair, setPair] = useState("EUR/USD");
  const [entry, setEntry] = useState(1.1);
  const [sl, setSl] = useState(1.095);
  const [tp, setTp] = useState(1.115);
  const [lots, setLots] = useState(1);
  const [lotType, setLotType] = useState<LotType>("standard");

  const r = useMemo(() => {
    const units = lots * LOT_UNITS[lotType];
    const pv = pipValueUSD(pair, units, entry);
    const risk = priceDiffPips(pair, entry, sl) * pv;
    const reward = priceDiffPips(pair, entry, tp) * pv;
    const rr = risk > 0 ? reward / risk : 0;
    const be = rr > 0 ? 100 / (1 + rr) : 0;
    return { risk, reward, rr, be, pv };
  }, [pair, entry, sl, tp, lots, lotType]);

  const setRR = (target: number) => {
    const dist = Math.abs(entry - sl) * target;
    setTp(entry > sl ? entry + dist : entry - dist);
  };

  const total = r.risk + r.reward;
  const riskPct = total ? (r.risk / total) * 100 : 50;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Currency pair</Label>
          <select value={pair} onChange={(e) => setPair(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {PAIRS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <Label>Lot size ({lotType})</Label>
          <div className="mt-1 flex gap-2">
            <Input type="number" step="0.01" value={lots} onChange={(e) => setLots(+e.target.value)} />
            <select value={lotType} onChange={(e) => setLotType(e.target.value as LotType)} className="rounded-md border border-input bg-background px-2 text-sm">
              <option value="standard">std</option><option value="mini">mini</option><option value="micro">micro</option>
            </select>
          </div>
        </div>
        <div><Label>Entry</Label><Input type="number" step="0.00001" value={entry} onChange={(e) => setEntry(+e.target.value)} className="mt-1" /></div>
        <div><Label>Stop loss</Label><Input type="number" step="0.00001" value={sl} onChange={(e) => setSl(+e.target.value)} className="mt-1" /></div>
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label>Take profit</Label>
            <div className="flex gap-1">{[1, 2, 3].map((n) => <Button key={n} size="sm" variant="outline" onClick={() => setRR(n)}>1:{n}</Button>)}</div>
          </div>
          <Input type="number" step="0.00001" value={tp} onChange={(e) => setTp(+e.target.value)} className="mt-1" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-4 text-sm">
          <Stat label="Potential loss" value={`-$${fmt(r.risk)}`} />
          <Stat label="Potential profit" value={`+$${fmt(r.reward)}`} />
          <Stat label="R : R" value={`1 : ${fmt(r.rr, 2)}`} highlight />
          <Stat label="Break-even win %" value={`${fmt(r.be, 1)}%`} />
        </div>
        <div className="h-6 w-full overflow-hidden rounded-full bg-background">
          <div className="flex h-full">
            <div className="bg-destructive" style={{ width: `${riskPct}%` }} title={`Risk $${fmt(r.risk)}`} />
            <div className="bg-primary" style={{ width: `${100 - riskPct}%` }} title={`Reward $${fmt(r.reward)}`} />
          </div>
        </div>
        <Button size="sm" onClick={() => { copy(`R:R 1:${fmt(r.rr, 2)} | Risk $${fmt(r.risk)} | Reward $${fmt(r.reward)}`); toast.success("Copied"); }}>Copy result</Button>
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