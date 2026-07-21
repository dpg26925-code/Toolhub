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
    let h = hourly, annual = 0;
    if (mode === "toSalary") {
      annual = hourly * hpw * wpy;
    } else {
      const total = hpw * wpy;
      h = total > 0 ? target / total : 0;
      annual = target;
    }
    return {
      hourly: h,
      annual,
      monthly: annual / 12,
      weekly: h * hpw,
      biweekly: h * hpw * 2,
    };
  }, [mode, hourly, hpw, wpy, target]);

  const parts = [
    { label: "Weekly", v: r.weekly, c: "bg-primary/70" },
    { label: "Biweekly", v: r.biweekly, c: "bg-primary/50" },
    { label: "Monthly", v: r.monthly, c: "bg-primary/30" },
    { label: "Annual", v: r.annual, c: "bg-primary" },
  ];
  const max = Math.max(...parts.map((p) => p.v), 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={mode === "toSalary" ? "default" : "outline"} onClick={() => setMode("toSalary")}>Hourly → Salary</Button>
        <Button size="sm" variant={mode === "toHourly" ? "default" : "outline"} onClick={() => setMode("toHourly")}>Target salary → Hourly</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {mode === "toSalary" ? (
          <div><Label>Hourly rate ($)</Label><Input type="number" min={0} step="0.01" value={hourly} onChange={(e) => setHourly(Math.max(0, +e.target.value))} className="mt-1" /></div>
        ) : (
          <div><Label>Target annual salary ($)</Label><Input type="number" min={0} value={target} onChange={(e) => setTarget(Math.max(0, +e.target.value))} className="mt-1" /></div>
        )}
        <div><Label>Hours / week</Label><Input type="number" min={1} max={168} step="0.5" value={hpw} onChange={(e) => setHpw(Math.max(1, +e.target.value))} className="mt-1" /></div>
        <div><Label>Weeks / year</Label><Input type="number" min={1} max={52} value={wpy} onChange={(e) => setWpy(Math.max(1, +e.target.value))} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-5 text-sm">
        <S label="Hourly" v={`$${fmt(r.hourly)}`} h={mode === "toHourly"} />
        <S label="Weekly" v={`$${fmt(r.weekly)}`} />
        <S label="Biweekly" v={`$${fmt(r.biweekly)}`} />
        <S label="Monthly" v={`$${fmt(r.monthly)}`} />
        <S label="Annual" v={`$${fmt(r.annual)}`} h={mode === "toSalary"} />
      </div>
      <div className="rounded-xl border border-border p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Salary breakdown</div>
        <div className="space-y-2">
          {parts.map((p) => (
            <div key={p.label} className="flex items-center gap-3 text-xs">
              <div className="w-20 text-muted-foreground">{p.label}</div>
              <div className="flex-1 h-4 rounded bg-secondary overflow-hidden">
                <div className={`h-full ${p.c}`} style={{ width: `${(p.v / max) * 100}%` }} />
              </div>
              <div className="w-24 text-right font-mono">${fmt(p.v)}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">For estimation only. Consult a tax or payroll professional for legally binding calculations.</p>
      <Button size="sm" onClick={() => { copy(`$${fmt(r.hourly)}/hr → $${fmt(r.annual)}/yr`); toast.success("Copied"); }}>Copy summary</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}