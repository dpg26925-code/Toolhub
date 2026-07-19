import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_trading";

const RETRACE = [0, 23.6, 38.2, 50, 61.8, 78.6, 100];
const EXTEND = [127.2, 161.8, 261.8];

export default function FibonacciCalculator() {
  const [high, setHigh] = useState(1.12);
  const [low, setLow] = useState(1.10);
  const [dir, setDir] = useState<"up" | "down">("up");

  const levels = useMemo(() => {
    const range = high - low;
    const at = (pct: number) => (dir === "up" ? high - (range * pct) / 100 : low + (range * pct) / 100);
    return {
      retrace: RETRACE.map((p) => ({ p, price: at(p) })),
      extend: EXTEND.map((p) => ({ p, price: at(p) })),
    };
  }, [high, low, dir]);

  const all = [...levels.retrace, ...levels.extend];
  const min = Math.min(...all.map((l) => l.price));
  const max = Math.max(...all.map((l) => l.price));
  const range = max - min || 1;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Swing high</Label><Input type="number" step="0.00001" value={high} onChange={(e) => setHigh(+e.target.value)} className="mt-1" /></div>
        <div><Label>Swing low</Label><Input type="number" step="0.00001" value={low} onChange={(e) => setLow(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Trend</Label>
          <div className="mt-1 flex gap-2">
            <Button size="sm" variant={dir === "up" ? "default" : "outline"} onClick={() => setDir("up")}>Uptrend (pullback)</Button>
            <Button size="sm" variant={dir === "down" ? "default" : "outline"} onClick={() => setDir("down")}>Downtrend</Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Retracement levels</h3>
        <ul className="mt-3 space-y-1 text-sm">
          {levels.retrace.map((l) => (
            <li key={l.p} className="grid grid-cols-[80px_1fr_100px] items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">{l.p.toFixed(1)}%</span>
              <div className="h-2 rounded bg-secondary">
                <div className="h-full rounded bg-primary/60" style={{ width: `${((l.price - min) / range) * 100}%` }} />
              </div>
              <span className="text-right font-mono font-semibold">{fmt(l.price, 5)}</span>
            </li>
          ))}
        </ul>
        <h3 className="mt-4 text-sm font-semibold">Extensions</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {levels.extend.map((l) => (
            <li key={l.p} className="grid grid-cols-[80px_1fr_100px] items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">{l.p.toFixed(1)}%</span>
              <div className="h-2 rounded bg-secondary">
                <div className="h-full rounded bg-accent" style={{ width: `${((l.price - min) / range) * 100}%` }} />
              </div>
              <span className="text-right font-mono font-semibold">{fmt(l.price, 5)}</span>
            </li>
          ))}
        </ul>
        <Button size="sm" className="mt-3" onClick={() => { copy(all.map((l) => `${l.p}%\t${l.price}`).join("\n")); toast.success("Copied"); }}>Copy all levels</Button>
      </div>
    </div>
  );
}