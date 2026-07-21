import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { CopyBtn, formatNum } from "./_units";

type Scale = "C" | "F" | "K" | "R";
const SCALES: { key: Scale; label: string }[] = [
  { key: "C", label: "Celsius (°C)" },
  { key: "F", label: "Fahrenheit (°F)" },
  { key: "K", label: "Kelvin (K)" },
  { key: "R", label: "Rankine (°R)" },
];

const toC = (v: number, s: Scale) => s === "C" ? v : s === "F" ? (v - 32) * 5 / 9 : s === "K" ? v - 273.15 : (v - 491.67) * 5 / 9;
const fromC = (c: number, s: Scale) => s === "C" ? c : s === "F" ? c * 9 / 5 + 32 : s === "K" ? c + 273.15 : (c + 273.15) * 9 / 5;
const convert = (v: number, f: Scale, t: Scale) => fromC(toC(v, f), t);

const FORMULAS: Record<string, string> = {
  "CF": "°F = °C × 9/5 + 32",
  "CK": "K = °C + 273.15",
  "CR": "°R = (°C + 273.15) × 9/5",
  "FC": "°C = (°F − 32) × 5/9",
  "FK": "K = (°F − 32) × 5/9 + 273.15",
  "FR": "°R = °F + 459.67",
  "KC": "°C = K − 273.15",
  "KF": "°F = (K − 273.15) × 9/5 + 32",
  "KR": "°R = K × 9/5",
  "RC": "°C = (°R − 491.67) × 5/9",
  "RF": "°F = °R − 459.67",
  "RK": "K = °R × 5/9",
};

export default function TemperatureConverter() {
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState<Scale>("C");
  const [to, setTo] = useState<Scale>("F");

  const num = parseFloat(value);
  const valid = !isNaN(num);
  // absolute-zero check
  const c = valid ? toC(num, from) : NaN;
  const belowAbs = valid && c < -273.16;
  const result = valid && !belowAbs ? convert(num, from, to) : NaN;
  const formula = from === to ? "same unit" : FORMULAS[from + to];

  // Thermometer gauge: -40°C to 100°C
  const gaugePct = valid ? Math.max(0, Math.min(100, ((c + 40) / 140) * 100)) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_1fr] md:items-end">
        <div>
          <Label>Temperature</Label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>From</Label>
          <select value={from} onChange={(e) => setFrom(e.target.value as Scale)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {SCALES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex md:justify-center">
          <Button variant="ghost" size="icon" onClick={() => { setFrom(to); setTo(from); }} className="mt-6 md:mt-0" title="Swap">
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <Label>To</Label>
          <select value={to} onChange={(e) => setTo(e.target.value as Scale)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {SCALES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {!valid && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">Enter a valid number.</div>}
      {belowAbs && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">Value is below absolute zero (−273.15 °C).</div>}

      {valid && !belowAbs && (
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Result</div>
                <div className="text-3xl font-semibold">{formatNum(result)} <span className="text-lg text-muted-foreground font-normal">{SCALES.find(s => s.key === to)?.label}</span></div>
              </div>
              <CopyBtn text={formatNum(result)} />
            </div>
            <div className="rounded-md bg-background/60 border border-border px-3 py-2 text-sm font-mono">{formula}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {SCALES.map((s) => (
                <div key={s.key} className="flex justify-between rounded-md border border-border bg-background px-3 py-1.5 text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-mono">{formatNum(convert(num, from, s.key))}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Thermometer */}
          <div className="mx-auto flex flex-col items-center">
            <div className="text-xs text-muted-foreground mb-1">100 °C</div>
            <div className="relative h-56 w-8 rounded-full border border-border bg-background overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500 to-orange-400 transition-all" style={{ height: `${gaugePct}%` }} />
            </div>
            <div className="mt-1 h-6 w-6 rounded-full bg-red-500" />
            <div className="text-xs text-muted-foreground mt-1">−40 °C</div>
            <div className="mt-2 text-sm font-mono">{formatNum(c)} °C</div>
          </div>
        </div>
      )}
    </div>
  );
}