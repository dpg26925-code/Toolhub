import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

const PRESETS = [
  { label: "US Sales Tax (avg)", rate: 7.25 },
  { label: "UK VAT", rate: 20 },
  { label: "EU VAT (DE)", rate: 19 },
  { label: "EU VAT (avg)", rate: 21 },
  { label: "VN VAT", rate: 10 },
  { label: "JP Consumption", rate: 10 },
  { label: "AU GST", rate: 10 },
];

export default function VatCalculator() {
  const [subtotal, setSubtotal] = useState(100);
  const [rate, setRate] = useState(20);
  const [type, setType] = useState("VAT");
  const r = useMemo(() => {
    const tax = (subtotal * rate) / 100;
    return { tax, total: subtotal + tax };
  }, [subtotal, rate]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Subtotal</Label><Input type="number" value={subtotal} onChange={(e) => setSubtotal(+e.target.value)} className="mt-1" /></div>
        <div><Label>Tax rate (%)</Label><Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Tax type</Label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>VAT</option><option>GST</option><option>Sales Tax</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.label} size="sm" variant="outline" onClick={() => setRate(p.rate)}>{p.label} {p.rate}%</Button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Subtotal" value={fmt(subtotal)} />
        <Stat label={`${type} @ ${rate}%`} value={fmt(r.tax)} />
        <Stat label="Total" value={fmt(r.total)} highlight />
      </div>
      <Button size="sm" onClick={() => { copy(`Subtotal ${fmt(subtotal)} + ${type} ${fmt(r.tax)} = ${fmt(r.total)}`); toast.success("Copied"); }}>Copy result</Button>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-semibold ${highlight ? "text-primary text-lg" : "text-foreground"}`}>{value}</div>
    </div>
  );
}