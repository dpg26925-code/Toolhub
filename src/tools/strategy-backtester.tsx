import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { parsePriceSeries, sma, fmt, copy } from "./_trading";
import { LineChart } from "./_chart";

type Strategy = "ma-crossover" | "rsi";
type Trade = { entryIdx: number; exitIdx: number; entry: number; exit: number; pnl: number };

function rsiSeries(prices: number[], period: number): number[] {
  const out = new Array(prices.length).fill(NaN);
  if (prices.length <= period) return out;
  let g = 0, l = 0;
  for (let i = 1; i <= period; i++) { const d = prices[i] - prices[i - 1]; if (d >= 0) g += d; else l -= d; }
  let ag = g / period, al = l / period;
  out[period] = 100 - 100 / (1 + (al === 0 ? Infinity : ag / al));
  for (let i = period + 1; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1];
    ag = (ag * (period - 1) + (d > 0 ? d : 0)) / period;
    al = (al * (period - 1) + (d < 0 ? -d : 0)) / period;
    out[i] = 100 - 100 / (1 + (al === 0 ? Infinity : ag / al));
  }
  return out;
}

function backtest(prices: number[], strategy: Strategy, params: { fast?: number; slow?: number; period?: number; over?: number; under?: number }): Trade[] {
  const trades: Trade[] = [];
  let inPos = false, entryIdx = 0, entry = 0;
  if (strategy === "ma-crossover") {
    const f = sma(prices, params.fast ?? 10);
    const s = sma(prices, params.slow ?? 30);
    for (let i = 1; i < prices.length; i++) {
      if (!isFinite(f[i]) || !isFinite(s[i]) || !isFinite(f[i - 1]) || !isFinite(s[i - 1])) continue;
      const bull = f[i - 1] <= s[i - 1] && f[i] > s[i];
      const bear = f[i - 1] >= s[i - 1] && f[i] < s[i];
      if (!inPos && bull) { inPos = true; entryIdx = i; entry = prices[i]; }
      else if (inPos && bear) { trades.push({ entryIdx, exitIdx: i, entry, exit: prices[i], pnl: prices[i] - entry }); inPos = false; }
    }
  } else {
    const r = rsiSeries(prices, params.period ?? 14);
    const over = params.over ?? 70, under = params.under ?? 30;
    for (let i = 1; i < prices.length; i++) {
      if (!isFinite(r[i])) continue;
      if (!inPos && r[i - 1] < under && r[i] >= under) { inPos = true; entryIdx = i; entry = prices[i]; }
      else if (inPos && r[i] >= over) { trades.push({ entryIdx, exitIdx: i, entry, exit: prices[i], pnl: prices[i] - entry }); inPos = false; }
    }
  }
  if (inPos) trades.push({ entryIdx, exitIdx: prices.length - 1, entry, exit: prices[prices.length - 1], pnl: prices[prices.length - 1] - entry });
  return trades;
}

export default function StrategyBacktester() {
  const [input, setInput] = useState("");
  const [strategy, setStrategy] = useState<Strategy>("ma-crossover");
  const [fast, setFast] = useState(10);
  const [slow, setSlow] = useState(30);
  const [period, setPeriod] = useState(14);

  const prices = useMemo(() => parsePriceSeries(input), [input]);
  const trades = useMemo(() => backtest(prices, strategy, { fast, slow, period }), [prices, strategy, fast, slow, period]);

  const stats = useMemo(() => {
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl <= 0);
    const winRate = trades.length ? (wins.length / trades.length) * 100 : 0;
    const grossW = wins.reduce((s, t) => s + t.pnl, 0);
    const grossL = -losses.reduce((s, t) => s + t.pnl, 0);
    const pf = grossL > 0 ? grossW / grossL : wins.length ? Infinity : 0;
    let equity = 0, peak = 0, dd = 0;
    const curve = [0];
    for (const t of trades) { equity += t.pnl; peak = Math.max(peak, equity); dd = Math.max(dd, peak - equity); curve.push(equity); }
    return { winRate, pf, dd, total: trades.length, equity, curve };
  }, [trades]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Historical prices (CSV / comma / newline)</Label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="1.10, 1.11, 1.09, 1.12, ..." className="mt-1 min-h-[120px] font-mono text-xs" />
        <p className="mt-1 text-xs text-muted-foreground">{prices.length} prices loaded</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={strategy === "ma-crossover" ? "default" : "outline"} onClick={() => setStrategy("ma-crossover")}>MA Crossover</Button>
        <Button size="sm" variant={strategy === "rsi" ? "default" : "outline"} onClick={() => setStrategy("rsi")}>RSI Reversal</Button>
      </div>
      {strategy === "ma-crossover" ? (
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Fast MA</Label><Input type="number" value={fast} onChange={(e) => setFast(+e.target.value)} className="mt-1" /></div>
          <div><Label>Slow MA</Label><Input type="number" value={slow} onChange={(e) => setSlow(+e.target.value)} className="mt-1" /></div>
        </div>
      ) : (
        <div><Label>RSI period</Label><Input type="number" value={period} onChange={(e) => setPeriod(+e.target.value)} className="mt-1 w-40" /></div>
      )}

      {prices.length > Math.max(slow, period) && (
        <>
          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
              <Stat label="Trades" value={String(stats.total)} />
              <Stat label="Win rate" value={`${fmt(stats.winRate, 1)}%`} />
              <Stat label="Profit factor" value={isFinite(stats.pf) ? fmt(stats.pf, 2) : "∞"} />
              <Stat label="Max drawdown" value={fmt(stats.dd, 4)} />
              <Stat label="Net" value={fmt(stats.equity, 4)} highlight />
            </div>
            <div className="mt-3"><LineChart series={[{ name: "Equity", color: "#3b82f6", data: stats.curve }]} height={180} /></div>
          </div>
          <div className="max-h-72 overflow-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead className="bg-secondary sticky top-0"><tr><th className="p-2 text-left">#</th><th className="p-2 text-right">Entry idx</th><th className="p-2 text-right">Exit idx</th><th className="p-2 text-right">Entry</th><th className="p-2 text-right">Exit</th><th className="p-2 text-right">P/L</th></tr></thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr key={i} className="border-t border-border/40"><td className="p-2">{i + 1}</td><td className="p-2 text-right">{t.entryIdx}</td><td className="p-2 text-right">{t.exitIdx}</td><td className="p-2 text-right">{fmt(t.entry, 4)}</td><td className="p-2 text-right">{fmt(t.exit, 4)}</td><td className={`p-2 text-right font-semibold ${t.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(t.pnl, 4)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button size="sm" variant="outline" onClick={() => {
            const csv = "entry_idx,exit_idx,entry,exit,pnl\n" + trades.map((t) => `${t.entryIdx},${t.exitIdx},${t.entry},${t.exit},${t.pnl}`).join("\n");
            copy(csv); toast.success("Trades copied");
          }}>Copy trades CSV</Button>
        </>
      )}
      <p className="text-xs text-muted-foreground">⚠ Past performance doesn't guarantee future results. This is a simplified simulation for educational use only.</p>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${highlight ? "text-primary text-lg" : ""}`}>{value}</div></div>
  );
}