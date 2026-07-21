import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

export default function SalaryToHourly() {
  const [annual, setAnnual] = useState(60000);
  const [hpw, setHpw] = useState(40);
  const [wpy, setWpy] = useState(52);
  const [vacation, setVacation] = useState(10);
  const r = useMemo(() => {
    const totalHours = Math.max(0, hpw * wpy);
    const hourly = totalHours > 0 ? annual / totalHours : 0;
    const workedHours = Math.max(0, totalHours - vacation * 8);
    const effective = workedHours > 0 ? annual / workedHours : 0;
    const daily = hourly * (hpw / 5);
    return {
      hourly,
      effective,
      daily,
      weekly: hourly * hpw,
      biweekly: hourly * hpw * 2,
      monthly: annual / 12,
    };
  }, [annual, hpw, wpy, vacation]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><Label>Annual salary ($)</Label><Input type="number" min={0} value={annual} onChange={(e) => setAnnual(Math.max(0, +e.target.value))} className="mt-1" /></div>
        <div><Label>Hours / week</Label><Input type="number" min={1} max={168} step="0.5" value={hpw} onChange={(e) => setHpw(Math.max(1, +e.target.value))} className="mt-1" /></div>
        <div><Label>Weeks / year</Label><Input type="number" min={1} max={52} value={wpy} onChange={(e) => setWpy(Math.max(1, +e.target.value))} className="mt-1" /></div>
        <div><Label>Paid vacation days</Label><Input type="number" min={0} value={vacation} onChange={(e) => setVacation(Math.max(0, +e.target.value))} className="mt-1" /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setHpw(40)}>40h / week</Button>
        <Button size="sm" variant="outline" onClick={() => setHpw(37.5)}>37.5h / week</Button>
        <Button size="sm" variant="outline" onClick={() => setHpw(35)}>35h / week</Button>
        <Button size="sm" variant="outline" onClick={() => setWpy(52)}>52 weeks</Button>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6 text-sm">
        <S label="Hourly" v={`$${fmt(r.hourly)}`} h />
        <S label="Effective (after vacation)" v={`$${fmt(r.effective)}`} />
        <S label="Daily" v={`$${fmt(r.daily)}`} />
        <S label="Weekly" v={`$${fmt(r.weekly)}`} />
        <S label="Biweekly" v={`$${fmt(r.biweekly)}`} />
        <S label="Monthly" v={`$${fmt(r.monthly)}`} />
      </div>
      <p className="text-xs text-muted-foreground">For estimation only. Consult a tax or payroll professional for legally binding calculations.</p>
      <Button size="sm" onClick={() => { copy(`$${fmt(annual)} / yr = $${fmt(r.hourly)} / hr (effective $${fmt(r.effective)}/hr after ${vacation} vacation days)`); toast.success("Copied"); }}>Copy summary</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}