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
    const total = regPay + otPay;
    const hoursTotal = reg + ot;
    const eff = hoursTotal > 0 ? total / hoursTotal : 0;
    return { regPay, otPay, total, eff, hoursTotal };
  }, [rate, reg, ot, mult]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><Label>Regular hourly rate ($)</Label><Input type="number" min={0} step="0.01" value={rate} onChange={(e) => setRate(Math.max(0, +e.target.value))} className="mt-1" /></div>
        <div><Label>Regular hours (per week)</Label><Input type="number" min={0} max={168} value={reg} onChange={(e) => setReg(Math.max(0, +e.target.value))} className="mt-1" /></div>
        <div><Label>Overtime hours (per week)</Label><Input type="number" min={0} max={168} value={ot} onChange={(e) => setOt(Math.max(0, +e.target.value))} className="mt-1" /></div>
        <div><Label>OT multiplier</Label><Input type="number" min={1} step="0.1" value={mult} onChange={(e) => setMult(Math.max(1, +e.target.value))} className="mt-1" /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={mult === 1.5 ? "default" : "outline"} onClick={() => setMult(1.5)}>Time & a half (1.5x)</Button>
        <Button size="sm" variant={mult === 2 ? "default" : "outline"} onClick={() => setMult(2)}>Double time (2x)</Button>
        <Button size="sm" variant={mult === 2.5 ? "default" : "outline"} onClick={() => setMult(2.5)}>Time-and-a-half + (2.5x)</Button>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Regular pay" v={`$${fmt(r.regPay)}`} />
        <S label={`OT pay (${mult}x)`} v={`$${fmt(r.otPay)}`} />
        <S label="Total pay (week)" v={`$${fmt(r.total)}`} h />
        <S label="Effective / hr" v={`$${fmt(r.eff)}`} />
      </div>
      <div className="rounded-xl border border-border p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Projections</div>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <S label="Per week" v={`$${fmt(r.total)}`} />
          <S label="Per month (4.33 wk)" v={`$${fmt(r.total * 4.333)}`} />
          <S label="Per year (52 wk)" v={`$${fmt(r.total * 52)}`} h />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">For estimation only. Overtime rules vary by country and state — consult a payroll professional for compliance.</p>
      <Button size="sm" onClick={() => { copy(`Reg $${fmt(r.regPay)} + OT $${fmt(r.otPay)} = $${fmt(r.total)} / week`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}