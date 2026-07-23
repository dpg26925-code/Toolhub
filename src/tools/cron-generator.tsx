import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Preset = { name: string; expr: string };
const PRESETS: Preset[] = [
  { name: "Every minute", expr: "* * * * *" },
  { name: "Every hour", expr: "0 * * * *" },
  { name: "Every day at midnight", expr: "0 0 * * *" },
  { name: "Every Monday 9 AM", expr: "0 9 * * 1" },
  { name: "1st of every month", expr: "0 0 1 * *" },
  { name: "Every 15 minutes", expr: "*/15 * * * *" },
];

function describe(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Enter 5 fields: minute hour day month weekday";
  const [m, h, dom, mon, dow] = parts;
  const wd = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const desc = (f: string, all: string, list?: string[]) => {
    if (f === "*") return `every ${all}`;
    if (/^\*\/\d+$/.test(f)) return `every ${f.slice(2)} ${all}s`;
    if (list && /^\d+$/.test(f)) return list[Number(f)] ?? f;
    return f;
  };
  return `At ${h === "*" && m === "*" ? "every minute" : `${desc(m, "minute")} past ${desc(h, "hour")}`}, on ${desc(dom, "day-of-month")}, in ${desc(mon, "month", mo)}, on ${desc(dow, "day-of-week", wd)}.`;
}

export default function CronGeneratorTool() {
  const [m, setM] = useState("0");
  const [h, setH] = useState("9");
  const [dom, setDom] = useState("*");
  const [mon, setMon] = useState("*");
  const [dow, setDow] = useState("1-5");

  const expr = useMemo(() => [m, h, dom, mon, dow].map((v) => v.trim() || "*").join(" "), [m, h, dom, mon, dow]);
  const description = useMemo(() => describe(expr), [expr]);

  const apply = (e: string) => {
    const p = e.split(/\s+/);
    setM(p[0]); setH(p[1]); setDom(p[2]); setMon(p[3]); setDow(p[4]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        <div><Label>Min</Label><Input value={m} onChange={(e) => setM(e.target.value)} className="mt-1 font-mono"/></div>
        <div><Label>Hour</Label><Input value={h} onChange={(e) => setH(e.target.value)} className="mt-1 font-mono"/></div>
        <div><Label>Day</Label><Input value={dom} onChange={(e) => setDom(e.target.value)} className="mt-1 font-mono"/></div>
        <div><Label>Month</Label><Input value={mon} onChange={(e) => setMon(e.target.value)} className="mt-1 font-mono"/></div>
        <div><Label>Weekday</Label><Input value={dow} onChange={(e) => setDow(e.target.value)} className="mt-1 font-mono"/></div>
      </div>
      <div className="rounded-lg border bg-muted/40 p-3">
        <div className="text-xs text-muted-foreground">Cron expression</div>
        <div className="mt-1 font-mono text-lg">{expr}</div>
        <div className="mt-2 text-sm">{description}</div>
      </div>
      <div>
        <Label>Presets</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => <Button key={p.name} variant="outline" size="sm" onClick={() => apply(p.expr)}>{p.name}</Button>)}
        </div>
      </div>
      <div className="rounded-lg border p-3 font-mono text-xs">
        <div className="text-muted-foreground text-[10px] mb-1">┌───────── minute (0-59)</div>
        <div className="text-muted-foreground text-[10px] mb-1">│ ┌─────── hour (0-23)</div>
        <div className="text-muted-foreground text-[10px] mb-1">│ │ ┌───── day of month (1-31)</div>
        <div className="text-muted-foreground text-[10px] mb-1">│ │ │ ┌─── month (1-12)</div>
        <div className="text-muted-foreground text-[10px] mb-1">│ │ │ │ ┌─ day of week (0-6, Sun=0)</div>
        <div>* * * * *</div>
      </div>
      <Button variant="outline" onClick={() => { navigator.clipboard.writeText(expr); toast.success("Copied"); }}>Copy expression</Button>
    </div>
  );
}