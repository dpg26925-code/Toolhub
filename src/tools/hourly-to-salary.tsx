import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

type Mode = "toSalary" | "toHourly";

export default function HourlyToSalary() {
  const [mode, setMode] = useState<Mode>("toSalary");
  const [hourly, setHourly] = useState(30);
  const [hpw, setHpw] = useState(40);
  const [wpy, setWpy] = useState(52);
  const [target, setTarget] = useState(80000);
  const r = useMemo(() => {
    if (mode === "toSalary") {
      const annual = hourly * hpw * wpy;
      return { annual, monthly: annual / 12, weekly: hourly * hpw, hourly };
    }
    const total = hpw * wpy;
    const h = total > 0 ? target / total : 0;
    return { annual: target, monthly: target / 12, weekly: h * hpw, hourly: h };
  }, [mode, hourly, hpw, wpy, target]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "toSalary" ? "default" : "outline"} onClick={() => setMode("toSalary")}>Hourly → Salary</Button>
        <Button size="sm" variant={mode === "toHourly" ? "default" : "outline"} onClick={() => setMode("toHourly")}>Target salary → Hourly</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {mode === "toSalary" ? (
          <div><Label>Hourly rate</Label><Input type="number" step="0.01" value={hourly} onChange={(e) => setHourly(+e.target.value)} className="mt-1" /></div>
        ) : (
          <div><Label>Target annual salary</Label><Input type="number" value={target} onChange={(e) => setTarget(+e.target.value)} className="mt-1" /></div>
        )}
        <div><Label>Hours / week</Label><Input type="number" step="0.5" value={hpw} onChange={(e) => setHpw(+e.target.value)} className="mt-1" /></div>
        <div><Label>Weeks / year</Label><Input type="number" value={wpy} onChange={(e) => setWpy(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-4 text-sm">
        <S label="Hourly" v={fmt(r.hourly)} />
        <S label="Weekly" v={fmt(r.weekly)} />
        <S label="Monthly" v={fmt(r.monthly)} />
        <S label="Annual" v={fmt(r.annual)} h />
      </div>
      <Button size="sm" onClick={() => { copy(`${fmt(r.hourly)}/hr → ${fmt(r.annual)}/yr`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}