import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { parsePriceSeries, fmt, copy } from "./_trading";
import { LineChart } from "./_chart";

function rsi(prices: number[], period: number): number[] {
  const out = new Array(prices.length).fill(NaN);
  if (prices.length <= period) return out;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const d = prices[i] - prices[i - 1];
    if (d >= 0) gains += d; else losses -= d;
  }
  let avgG = gains / period, avgL = losses / period;
  out[period] = 100 - 100 / (1 + (avgL === 0 ? Infinity : avgG / avgL));
  for (let i = period + 1; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1];
    const g = d > 0 ? d : 0, l = d < 0 ? -d : 0;
    avgG = (avgG * (period - 1) + g) / period;
    avgL = (avgL * (period - 1) + l) / period;
    out[i] = 100 - 100 / (1 + (avgL === 0 ? Infinity : avgG / avgL));
  }
  return out;
}

export default function RsiCalculator() {
  const [input, setInput] = useState("44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64");
  const [period, setPeriod] = useState(14);

  const { prices, values, current } = useMemo(() => {
    const p = parsePriceSeries(input);
    const v = rsi(p, period);
    return { prices: p, values: v, current: v[v.length - 1] };
  }, [input, period]);

  const signal = !isFinite(current) ? "—" : current >= 70 ? "Overbought" : current <= 30 ? "Oversold" : "Neutral";

  return (
    <div className="space-y-4">
      <div>
        <Label>Price data (comma / space / newline separated)</Label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="mt-1 min-h-[100px] font-mono text-xs" />
      </div>
      <div className="flex items-end gap-3">
        <div><Label>Period</Label><Input type="number" value={period} onChange={(e) => setPeriod(+e.target.value)} className="mt-1 w-24" /></div>
        <div className="text-sm">Data points: <span className="font-semibold">{prices.length}</span></div>
      </div>
      {prices.length > period ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div><div className="text-xs uppercase text-muted-foreground">Current RSI</div><div className="mt-1 text-lg font-semibold text-primary">{fmt(current, 2)}</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">Signal</div><div className="mt-1 text-lg font-semibold">{signal}</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">Last price</div><div className="mt-1 text-lg font-semibold">{fmt(prices[prices.length - 1], 4)}</div></div>
          </div>
          <LineChart
            series={[{ name: `RSI(${period})`, color: "#3b82f6", data: values }]}
            thresholds={[{ y: 70, color: "rgba(239,68,68,0.5)" }, { y: 30, color: "rgba(34,197,94,0.5)" }]}
          />
          <Button size="sm" variant="outline" onClick={() => { copy(values.map((v) => (isFinite(v) ? v.toFixed(2) : "")).join("\n")); toast.success("Copied all RSI values"); }}>Copy all RSI values</Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Need at least {period + 1} prices to compute RSI.</p>
      )}
    </div>
  );
}