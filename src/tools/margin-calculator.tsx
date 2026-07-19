import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PAIRS, LOT_UNITS, LotType, fmt, copy } from "./_trading";

const LEVERAGES = [10, 50, 100, 200, 500];

export default function MarginCalculator() {
  const [pair, setPair] = useState("EUR/USD");
  const [lots, setLots] = useState(1);
  const [lotType, setLotType] = useState<LotType>("standard");
  const [leverage, setLeverage] = useState(100);
  const [balance, setBalance] = useState(10000);
  const [price, setPrice] = useState(1.1);

  const r = useMemo(() => {
    const units = lots * LOT_UNITS[lotType];
    const [base, quote] = pair.split("/");
    // notional in USD: for X/USD notional = units*price; for USD/X notional = units; for cross approximate as units*price/1
    let notionalUSD = units;
    if (quote === "USD") notionalUSD = units * price;
    else if (base === "USD") notionalUSD = units;
    else notionalUSD = units * price;
    const margin = notionalUSD / leverage;
    const free = balance - margin;
    const level = margin > 0 ? (balance / margin) * 100 : 0;
    return { notionalUSD, margin, free, level };
  }, [pair, lots, lotType, leverage, balance, price]);

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
        <div>
          <Label>Leverage</Label>
          <select value={leverage} onChange={(e) => setLeverage(+e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {LEVERAGES.map((l) => <option key={l} value={l}>1:{l}</option>)}
          </select>
        </div>
        <div><Label>Current price</Label><Input type="number" step="0.00001" value={price} onChange={(e) => setPrice(+e.target.value)} className="mt-1" /></div>
        <div className="sm:col-span-2"><Label>Account balance (USD)</Label><Input type="number" value={balance} onChange={(e) => setBalance(+e.target.value)} className="mt-1" /></div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="grid gap-3 sm:grid-cols-4 text-sm">
          <Stat label="Notional" value={`$${fmt(r.notionalUSD, 0)}`} />
          <Stat label="Required margin" value={`$${fmt(r.margin)}`} highlight />
          <Stat label="Free margin" value={`$${fmt(r.free)}`} />
          <Stat label="Margin level" value={`${fmt(r.level, 0)}%`} />
        </div>
        {r.level > 0 && r.level < 100 && (
          <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">⚠ Margin level below 100% — broker may issue a margin call.</p>
        )}
        <Button size="sm" className="mt-3" onClick={() => { copy(`Margin $${fmt(r.margin)} — level ${fmt(r.level, 0)}%`); toast.success("Copied"); }}>Copy result</Button>
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