import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PhCalculator() {
  const [type, setType] = useState<"strong-acid" | "weak-acid" | "strong-base" | "weak-base">("strong-acid");
  const [conc, setConc] = useState(0.1);
  const [k, setK] = useState(1.8e-5);

  let pH = NaN;
  const c = conc;
  if (type === "strong-acid") pH = -Math.log10(c);
  else if (type === "strong-base") pH = 14 - -Math.log10(c);
  else if (type === "weak-acid") pH = -Math.log10(Math.sqrt(k * c));
  else pH = 14 - -Math.log10(Math.sqrt(k * c));
  const pOH = 14 - pH;
  const H = Math.pow(10, -pH);
  const OH = Math.pow(10, -pOH);

  const color = pH < 3 ? "#dc2626" : pH < 6 ? "#f97316" : pH < 8 ? "#22c55e" : pH < 11 ? "#3b82f6" : "#7c3aed";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Type</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={type} onChange={e => setType(e.target.value as typeof type)}>
            <option value="strong-acid">Strong acid</option>
            <option value="weak-acid">Weak acid</option>
            <option value="strong-base">Strong base</option>
            <option value="weak-base">Weak base</option>
          </select>
        </div>
        <div>
          <Label>Concentration (M)</Label>
          <Input type="number" step="0.001" value={conc} onChange={e => setConc(parseFloat(e.target.value) || 0)} />
        </div>
        {type.startsWith("weak") && (
          <div>
            <Label>Ka / Kb</Label>
            <Input type="number" step="1e-6" value={k} onChange={e => setK(parseFloat(e.target.value) || 0)} />
          </div>
        )}
      </div>
      <div className="rounded-lg border p-6" style={{ borderColor: color }}>
        <div className="text-6xl font-bold" style={{ color }}>pH {pH.toFixed(2)}</div>
        <div className="mt-2 text-sm">pOH: {pOH.toFixed(2)} · [H⁺]: {H.toExponential(2)} M · [OH⁻]: {OH.toExponential(2)} M</div>
        <div className="mt-4 h-6 rounded-full relative" style={{ background: "linear-gradient(to right, #ef4444, #eab308, #22c55e, #3b82f6, #7c3aed)" }}>
          <div className="absolute top-0 h-6 w-1 bg-black" style={{ left: `${(pH / 14) * 100}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>0 acidic</span><span>7 neutral</span><span>14 basic</span></div>
      </div>
    </div>
  );
}
