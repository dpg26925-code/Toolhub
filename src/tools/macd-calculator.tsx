import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { parsePriceSeries, ema, fmt, copy } from "./_trading";
import { LineChart } from "./_chart";

export default function MacdCalculator() {
  const [input, setInput] = useState("22.27,22.19,22.08,22.17,22.18,22.13,22.23,22.43,22.24,22.29,22.15,22.39,22.38,22.61,23.36,24.05,23.75,23.83,23.95,23.63,23.82,23.87,23.65,23.19,23.10,23.33,22.68,23.10,22.40,22.17");
  const [fast, setFast] = useState(12);
  const [slow, setSlow] = useState(26);
  const [signalP, setSignalP] = useState(9);

  const r = useMemo(() => {
    const prices = parsePriceSeries(input);
    const eFast = ema(prices, fast);
    const eSlow = ema(prices, slow);
    const macd = prices.map((_, i) => eFast[i] - eSlow[i]);
    const signal = ema(macd.map((v) => (isFinite(v) ? v : 0)), signalP).map((v, i) => (isFinite(macd[i]) ? v : NaN));
    const hist = macd.map((v, i) => v - signal[i]);
    return { prices, macd, signal, hist };
  }, [input, fast, slow, signalP]);

  const last = r.macd.length - 1;

  return (
    <div className="space-y-4">
      <div>
        <Label>Price data</Label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="mt-1 min-h-[100px] font-mono text-xs" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Fast EMA</Label><Input type="number" value={fast} onChange={(e) => setFast(+e.target.value)} className="mt-1" /></div>
        <div><Label>Slow EMA</Label><Input type="number" value={slow} onChange={(e) => setSlow(+e.target.value)} className="mt-1" /></div>
        <div><Label>Signal EMA</Label><Input type="number" value={signalP} onChange={(e) => setSignalP(+e.target.value)} className="mt-1" /></div>
      </div>
      {r.prices.length > slow ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><div className="text-xs uppercase text-muted-foreground">MACD</div><div className="mt-1 font-semibold text-primary">{fmt(r.macd[last], 4)}</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">Signal</div><div className="mt-1 font-semibold">{fmt(r.signal[last], 4)}</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">Histogram</div><div className={`mt-1 font-semibold ${r.hist[last] >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(r.hist[last], 4)}</div></div>
          </div>
          <LineChart
            series={[
              { name: "Histogram", color: "#8b5cf6", data: r.hist, type: "hist" },
              { name: `MACD(${fast},${slow})`, color: "#3b82f6", data: r.macd },
              { name: `Signal(${signalP})`, color: "#ef4444", data: r.signal },
            ]}
            height={240}
          />
          <Button size="sm" variant="outline" onClick={() => {
            const csv = "macd,signal,histogram\n" + r.macd.map((v, i) => `${fmt(v, 4)},${fmt(r.signal[i], 4)},${fmt(r.hist[i], 4)}`).join("\n");
            copy(csv); toast.success("Copied CSV");
          }}>Copy CSV</Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Need at least {slow + 1} prices.</p>
      )}
    </div>
  );
}