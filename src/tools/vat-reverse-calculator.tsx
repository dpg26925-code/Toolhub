import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

const PRESETS = [{ l: "UK 20%", r: 20 }, { l: "DE 19%", r: 19 }, { l: "VN 10%", r: 10 }, { l: "JP 10%", r: 10 }, { l: "US 7.25%", r: 7.25 }];

export default function VatReverseCalculator() {
  const [total, setTotal] = useState(120);
  const [rate, setRate] = useState(20);
  const r = useMemo(() => {
    const net = total / (1 + rate / 100);
    return { net, tax: total - net };
  }, [total, rate]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Total (incl. tax)</Label><Input type="number" value={total} onChange={(e) => setTotal(+e.target.value)} className="mt-1" /></div>
        <div><Label>Tax rate (%)</Label><Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="flex flex-wrap gap-2">{PRESETS.map((p) => <Button key={p.l} size="sm" variant="outline" onClick={() => setRate(p.r)}>{p.l}</Button>)}</div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-3">
        <S label="Net (excl. tax)" v={fmt(r.net)} h />
        <S label={`Tax @ ${rate}%`} v={fmt(r.tax)} />
        <S label="Total" v={fmt(total)} />
      </div>
      <Button size="sm" onClick={() => { copy(`Net ${fmt(r.net)} + tax ${fmt(r.tax)} = ${fmt(total)}`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}