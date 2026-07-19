import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

export default function OvertimeCalculator() {
  const [rate, setRate] = useState(20);
  const [reg, setReg] = useState(40);
  const [ot, setOt] = useState(8);
  const [mult, setMult] = useState(1.5);
  const r = useMemo(() => {
    const regPay = rate * reg;
    const otPay = rate * mult * ot;
    return { regPay, otPay, total: regPay + otPay };
  }, [rate, reg, ot, mult]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Hourly rate</Label><Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
        <div><Label>Regular hours</Label><Input type="number" value={reg} onChange={(e) => setReg(+e.target.value)} className="mt-1" /></div>
        <div><Label>OT hours</Label><Input type="number" value={ot} onChange={(e) => setOt(+e.target.value)} className="mt-1" /></div>
        <div><Label>OT multiplier</Label><Input type="number" step="0.1" value={mult} onChange={(e) => setMult(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setMult(1.5)}>Time & a half</Button>
        <Button size="sm" variant="outline" onClick={() => setMult(2)}>Double time</Button>
        <Button size="sm" variant="outline" onClick={() => setMult(3)}>Triple time</Button>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-3 text-sm">
        <S label="Regular pay" v={fmt(r.regPay)} />
        <S label={`OT pay (${mult}x)`} v={fmt(r.otPay)} />
        <S label="Total pay" v={fmt(r.total)} h />
      </div>
      <Button size="sm" onClick={() => { copy(`Total pay: ${fmt(r.total)}`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}