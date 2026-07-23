import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [value, setValue] = useState(10000);
  const [freight, setFreight] = useState(800);
  const [insurance, setInsurance] = useState(50);
  const [inlandExport, setInland] = useState(200);

  const fob = useMemo(() => value + inlandExport, [value, inlandExport]);
  const cif = useMemo(() => fob + freight + insurance, [fob, freight, insurance]);
  const diff = cif - fob;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Product value ($)</Label><Input type="number" value={value} onChange={(e) => setValue(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Inland freight to port</Label><Input type="number" value={inlandExport} onChange={(e) => setInland(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Ocean freight</Label><Input type="number" value={freight} onChange={(e) => setFreight(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Insurance</Label><Input type="number" value={insurance} onChange={(e) => setInsurance(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold">FOB (Free On Board)</h3>
          <div className="mt-2 text-3xl font-bold">${fob.toLocaleString()}</div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>• Goods: ${value.toLocaleString()}</li><li>• Inland: ${inlandExport.toLocaleString()}</li>
          </ul>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold">CIF (Cost + Insurance + Freight)</h3>
          <div className="mt-2 text-3xl font-bold text-primary">${cif.toLocaleString()}</div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>• FOB: ${fob.toLocaleString()}</li><li>• Ocean: ${freight.toLocaleString()}</li><li>• Insurance: ${insurance.toLocaleString()}</li>
          </ul>
        </div>
      </div>
      <div className="rounded-lg border bg-muted/30 p-3 text-sm">CIF is <strong>${diff.toLocaleString()}</strong> higher than FOB — the seller absorbs freight & insurance and bakes it into the invoice.</div>
    </div>
  );
}