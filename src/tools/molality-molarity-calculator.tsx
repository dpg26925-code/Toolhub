import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MolalityMolarityCalculator() {
  const [soluteMass, setSoluteMass] = useState(10);
  const [molarMass, setMolarMass] = useState(58.44);
  const [solventMass, setSolventMass] = useState(500);
  const [solutionVol, setSolutionVol] = useState(0.5);
  const [solventMolarMass, setSolventMolarMass] = useState(18.015);

  const moles = soluteMass / molarMass;
  const molarity = moles / solutionVol;
  const molality = moles / (solventMass / 1000);
  const solventMoles = solventMass / solventMolarMass;
  const fraction = moles / (moles + solventMoles);

  const Row = ({ l, v, u }: { l: string; v: number; u: string }) => (
    <div className="flex justify-between border-b py-2"><span className="text-sm text-muted-foreground">{l}</span><span className="font-mono">{v.toFixed(4)} {u}</span></div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Solute mass (g)</Label><Input type="number" value={soluteMass} onChange={e => setSoluteMass(+e.target.value)} /></div>
        <div><Label>Solute molar mass (g/mol)</Label><Input type="number" value={molarMass} onChange={e => setMolarMass(+e.target.value)} /></div>
        <div><Label>Solvent mass (g)</Label><Input type="number" value={solventMass} onChange={e => setSolventMass(+e.target.value)} /></div>
        <div><Label>Solution volume (L)</Label><Input type="number" step="0.01" value={solutionVol} onChange={e => setSolutionVol(+e.target.value)} /></div>
        <div><Label>Solvent molar mass (g/mol)</Label><Input type="number" value={solventMolarMass} onChange={e => setSolventMolarMass(+e.target.value)} /></div>
      </div>
      <div className="rounded-lg border p-4">
        <Row l="Moles of solute" v={moles} u="mol" />
        <Row l="Molarity (M = mol/L)" v={molarity} u="M" />
        <Row l="Molality (m = mol/kg solvent)" v={molality} u="m" />
        <Row l="Mole fraction (χ solute)" v={fraction} u="" />
      </div>
      <div className="rounded-lg border bg-muted/30 p-4 text-xs font-mono space-y-1">
        <div>M = n_solute / V_solution</div>
        <div>m = n_solute / kg_solvent</div>
        <div>χ = n_solute / (n_solute + n_solvent)</div>
      </div>
    </div>
  );
}
