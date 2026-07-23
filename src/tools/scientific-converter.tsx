import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const PRESSURE: Record<string, number> = { Pa: 1, kPa: 1000, atm: 101325, bar: 100000, mmHg: 133.322, torr: 133.322, psi: 6894.76 };

function convertTemp(v: number, from: string, to: string): number {
  let k = v;
  if (from === "C") k = v + 273.15;
  else if (from === "F") k = (v - 32) * 5 / 9 + 273.15;
  if (to === "K") return k;
  if (to === "C") return k - 273.15;
  return (k - 273.15) * 9 / 5 + 32;
}

export default function ScientificConverter() {
  const [kind, setKind] = useState<"pressure" | "temperature">("pressure");
  const [value, setValue] = useState(1);
  const [from, setFrom] = useState("atm");
  const [to, setTo] = useState("Pa");

  const pOpts = Object.keys(PRESSURE);
  const tOpts = ["K", "C", "F"];
  const opts = kind === "pressure" ? pOpts : tOpts;

  const result = kind === "pressure" ? (value * PRESSURE[from]) / PRESSURE[to] : convertTemp(value, from, to);

  const preset = (label: string, v: number, f: string) => (
    <Button variant="outline" size="sm" onClick={() => { setValue(v); setFrom(f); }}>{label}</Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <Label>Category</Label>
        <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={kind} onChange={e => {
          const k = e.target.value as "pressure" | "temperature";
          setKind(k); setFrom(k === "pressure" ? "atm" : "C"); setTo(k === "pressure" ? "Pa" : "K");
        }}>
          <option value="pressure">Pressure</option>
          <option value="temperature">Temperature</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label>Value</Label><Input type="number" step="0.01" value={value} onChange={e => setValue(+e.target.value)} /></div>
        <div><Label>From</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={from} onChange={e => setFrom(e.target.value)}>{opts.map(o => <option key={o}>{o}</option>)}</select></div>
        <div><Label>To</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={to} onChange={e => setTo(e.target.value)}>{opts.map(o => <option key={o}>{o}</option>)}</select></div>
      </div>
      {kind === "pressure" && (
        <div className="flex flex-wrap gap-2">
          {preset("STP (1 atm)", 1, "atm")}
          {preset("Sea level (101325 Pa)", 101325, "Pa")}
          {preset("Vacuum (0.01 atm)", 0.01, "atm")}
        </div>
      )}
      {kind === "temperature" && (
        <div className="flex flex-wrap gap-2">
          {preset("STP (0°C)", 0, "C")}
          {preset("Room (25°C)", 25, "C")}
          {preset("Body (37°C)", 37, "C")}
        </div>
      )}
      <div className="rounded-lg border p-6">
        <div className="text-3xl font-bold">{value} {from} = {result.toFixed(4)} {to}</div>
      </div>
    </div>
  );
}
