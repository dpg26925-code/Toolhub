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
  const r = useMemo(() => {
    const total = hpw * wpy;
    const hourly = total > 0 ? annual / total : 0;
    return { hourly, daily: hourly * 8, weekly: hourly * hpw, monthly: annual / 12 };
  }, [annual, hpw, wpy]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Annual salary</Label><Input type="number" value={annual} onChange={(e) => setAnnual(+e.target.value)} className="mt-1" /></div>
        <div><Label>Hours / week</Label><Input type="number" step="0.5" value={hpw} onChange={(e) => setHpw(+e.target.value)} className="mt-1" /></div>
        <div><Label>Weeks / year</Label><Input type="number" value={wpy} onChange={(e) => setWpy(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setHpw(40)}>40h/wk</Button>
        <Button size="sm" variant="outline" onClick={() => setHpw(37.5)}>37.5h/wk</Button>
        <Button size="sm" variant="outline" onClick={() => { setHpw(40); setWpy(48); }}>48 wk (seasonal)</Button>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Hourly" v={fmt(r.hourly)} h />
        <S label="Daily (8h)" v={fmt(r.daily)} />
        <S label="Weekly" v={fmt(r.weekly)} />
        <S label="Monthly" v={fmt(r.monthly)} />
      </div>
      <Button size="sm" onClick={() => { copy(`${fmt(annual)} / yr = ${fmt(r.hourly)} / hr`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}