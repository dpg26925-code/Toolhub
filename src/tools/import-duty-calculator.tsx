import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROUTES: Record<string, { duty: number; vat: number; label: string }> = {
  "CN-US": { duty: 7.5, vat: 0, label: "China → United States" },
  "CN-EU": { duty: 4, vat: 21, label: "China → European Union" },
  "VN-US": { duty: 5, vat: 0, label: "Vietnam → United States" },
  "IN-US": { duty: 6, vat: 0, label: "India → United States" },
  "CN-UK": { duty: 4, vat: 20, label: "China → United Kingdom" },
  "CN-AU": { duty: 5, vat: 10, label: "China → Australia" },
};

export default function Tool() {
  const [route, setRoute] = useState("CN-US");
  const [value, setValue] = useState(10000);
  const [freight, setFreight] = useState(800);
  const [dutyOverride, setDutyOverride] = useState<number | null>(null);

  const r = useMemo(() => {
    const info = ROUTES[route];
    const dutyRate = dutyOverride ?? info.duty;
    const cif = value + freight;
    const duty = cif * dutyRate / 100;
    const vat = (cif + duty) * info.vat / 100;
    const landed = cif + duty + vat;
    return { info, dutyRate, cif, duty, vat, landed };
  }, [route, value, freight, dutyOverride]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Estimates only — Real duty depends on HS code and trade agreements. Verify with customs broker.</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Route</Label><Select value={route} onValueChange={setRoute}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
          <SelectContent>{Object.entries(ROUTES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Duty rate override (%)</Label><Input type="number" step="0.1" placeholder={String(r.info.duty)} onChange={(e) => setDutyOverride(e.target.value ? +e.target.value : null)} className="mt-1"/></div>
        <div><Label>Product value ($)</Label><Input type="number" value={value} onChange={(e) => setValue(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Freight ($)</Label><Input type="number" value={freight} onChange={(e) => setFreight(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <Row label="CIF value" v={r.cif}/>
        <Row label={`Duty (${r.dutyRate}%)`} v={r.duty}/>
        <Row label={`VAT (${r.info.vat}%)`} v={r.vat}/>
        <hr className="my-2"/>
        <Row label="Total landed cost" v={r.landed} bold/>
      </div>
    </div>
  );
}
function Row({ label, v, bold }: { label: string; v: number; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "text-lg font-bold" : ""}`}><span>{label}</span><span>${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>;
}