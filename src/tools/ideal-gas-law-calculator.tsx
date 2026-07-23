import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const R = 0.08206;
type Solve = "P" | "V" | "n" | "T";

export default function IdealGasLawCalculator() {
  const [solve, setSolve] = useState<Solve>("P");
  const [P, setP] = useState(1);
  const [V, setV] = useState(22.4);
  const [n, setN] = useState(1);
  const [T, setT] = useState(273.15);

  let result = 0;
  if (solve === "P") result = (n * R * T) / V;
  else if (solve === "V") result = (n * R * T) / P;
  else if (solve === "n") result = (P * V) / (R * T);
  else result = (P * V) / (n * R);

  const units: Record<Solve, string> = { P: "atm", V: "L", n: "mol", T: "K" };

  return (
    <div className="space-y-6">
      <div>
        <Label>Solve for</Label>
        <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={solve} onChange={e => setSolve(e.target.value as Solve)}>
          <option value="P">Pressure (P)</option>
          <option value="V">Volume (V)</option>
          <option value="n">Moles (n)</option>
          <option value="T">Temperature (T)</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {solve !== "P" && <div><Label>Pressure (atm)</Label><Input type="number" step="0.01" value={P} onChange={e => setP(+e.target.value)} /></div>}
        {solve !== "V" && <div><Label>Volume (L)</Label><Input type="number" step="0.1" value={V} onChange={e => setV(+e.target.value)} /></div>}
        {solve !== "n" && <div><Label>Moles (mol)</Label><Input type="number" step="0.01" value={n} onChange={e => setN(+e.target.value)} /></div>}
        {solve !== "T" && <div><Label>Temperature (K)</Label><Input type="number" step="0.1" value={T} onChange={e => setT(+e.target.value)} /></div>}
      </div>
      <div className="rounded-lg border p-6">
        <div className="text-sm text-muted-foreground">Result</div>
        <div className="text-4xl font-bold">{result.toFixed(4)} <span className="text-xl text-muted-foreground">{units[solve]}</span></div>
        <div className="mt-4 font-mono text-sm">PV = nRT (R = 0.08206 L·atm/mol·K)</div>
      </div>
    </div>
  );
}
