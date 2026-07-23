import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CURRENCIES, convert, synthHistory } from "./_travel";

const CODES = Object.keys(CURRENCIES).sort();

export default function CurrencyConverterTravel() {
  const [amount, setAmount] = useState<number>(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");

  const { value, rate } = useMemo(() => convert(amount, from, to), [amount, from, to]);
  const history = useMemo(() => synthHistory(rate, 30, from.charCodeAt(0) + to.charCodeAt(0)), [rate, from, to]);

  const path = useMemo(() => {
    if (history.length < 2) return "";
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const w = 600, h = 120;
    return history.map((v, i) => {
      const x = (i / (history.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }, [history]);

  const swap = () => { const f = from; setFrom(to); setTo(f); };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="amt">Amount</Label>
          <Input id="amt" type="number" min={0} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div>
          <Label>From</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={from} onChange={(e) => setFrom(e.target.value)}>
            {CODES.map((c) => <option key={c} value={c}>{c} — {CURRENCIES[c].name}</option>)}
          </select>
        </div>
        <div>
          <Label>To</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={to} onChange={(e) => setTo(e.target.value)}>
            {CODES.map((c) => <option key={c} value={c}>{c} — {CURRENCIES[c].name}</option>)}
          </select>
        </div>
      </div>

      <button type="button" onClick={swap} className="text-sm text-primary hover:underline">⇄ Swap currencies</button>

      <div className="rounded-xl border bg-card p-6">
        <div className="text-sm text-muted-foreground">{amount.toLocaleString()} {from} =</div>
        <div className="mt-1 text-4xl font-bold">
          {value.toLocaleString("en-US", { maximumFractionDigits: 2 })} <span className="text-xl text-muted-foreground">{to}</span>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">1 {from} = {rate.toLocaleString("en-US", { maximumFractionDigits: 6 })} {to}</div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">30-day rate trend</h3>
          <span className="text-xs text-muted-foreground">Illustrative offline data</span>
        </div>
        <svg viewBox="0 0 600 120" className="mt-3 w-full">
          <path d={path} fill="none" stroke="currentColor" className="text-primary" strokeWidth={2} />
        </svg>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>30 days ago</span><span>Today</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Rates are bundled offline fallbacks — not live market rates. Verify with your bank before making financial decisions. Supports {CODES.length} currencies.</p>
    </div>
  );
}