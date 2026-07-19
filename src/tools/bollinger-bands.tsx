import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { parsePriceSeries, sma, fmt, copy } from "./_trading";
import { LineChart } from "./_chart";

export default function BollingerBands() {
  const [input, setInput] = useState("22.27,22.19,22.08,22.17,22.18,22.13,22.23,22.43,22.24,22.29,22.15,22.39,22.38,22.61,23.36,24.05,23.75,23.83,23.95,23.63,23.82,23.87,23.65,23.19,23.10,23.33,22.68,23.10,22.40,22.17");
  const [period, setPeriod] = useState(20);
  const [k, setK] = useState(2);

  const r = useMemo(() => {
    const p = parsePriceSeries(input);
    const mid = sma(p, period);
    const upper = new Array(p.length).fill(NaN);
    const lower = new Array(p.length).fill(NaN);
    const bandwidth = new Array(p.length).fill(NaN);
    const percentB = new Array(p.length).fill(NaN);
    for (let i = period - 1; i < p.length; i++) {
      const window = p.slice(i - period + 1, i + 1);
      const m = mid[i];
      const variance = window.reduce((s, x) => s + (x - m) ** 2, 0) / period;
      const sd = Math.sqrt(variance);
      upper[i] = m + k * sd;
      lower[i] = m - k * sd;
      bandwidth[i] = (upper[i] - lower[i]) / m;
      percentB[i] = (p[i] - lower[i]) / (upper[i] - lower[i]);
    }
    return { p, mid, upper, lower, bandwidth, percentB };
  }, [input, period, k]);

  const last = r.p.length - 1;

  return (
    <div className="space-y-4">
      <div>
        <Label>Price data</Label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="mt-1 min-h-[100px] font-mono text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Period</Label><Input type="number" value={period} onChange={(e) => setPeriod(+e.target.value)} className="mt-1" /></div>
        <div><Label>Std deviations</Label><Input type="number" step="0.1" value={k} onChange={(e) => setK(+e.target.value)} className="mt-1" /></div>
      </div>
      {r.p.length >= period ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div><div className="text-xs uppercase text-muted-foreground">Upper</div><div className="mt-1 font-semibold">{fmt(r.upper[last], 4)}</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">Middle (SMA)</div><div className="mt-1 font-semibold text-primary">{fmt(r.mid[last], 4)}</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">Lower</div><div className="mt-1 font-semibold">{fmt(r.lower[last], 4)}</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">%B</div><div className="mt-1 font-semibold">{fmt(r.percentB[last] * 100, 1)}%</div></div>
          </div>
          <LineChart
            series={[
              { name: "Upper", color: "#ef4444", data: r.upper },
              { name: "Middle", color: "#3b82f6", data: r.mid },
              { name: "Lower", color: "#22c55e", data: r.lower },
              { name: "Price", color: "#0f172a", data: r.p },
            ]}
            height={260}
          />
          <Button size="sm" variant="outline" onClick={() => {
            const csv = "price,upper,middle,lower,%B\n" + r.p.map((v, i) => `${v},${fmt(r.upper[i], 4)},${fmt(r.mid[i], 4)},${fmt(r.lower[i], 4)},${fmt(r.percentB[i], 3)}`).join("\n");
            copy(csv); toast.success("Copied CSV");
          }}>Copy CSV</Button>
        </div>
      ) : <p className="text-sm text-muted-foreground">Need at least {period} prices.</p>}
    </div>
  );
}