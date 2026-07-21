import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Disclaimer, Stat, Bar } from "./_health";

type Mode = "lmp" | "conception";

function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export default function PregnancyDueDate() {
  const [mode, setMode] = useState<Mode>("lmp");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const r = useMemo(() => {
    if (!date) return null;
    const start = new Date(date + "T00:00:00");
    if (isNaN(start.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const edd = mode === "lmp" ? addDays(start, 280) : addDays(start, 266);
    const lmp = mode === "lmp" ? start : addDays(start, -14);
    const daysPregnant = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
    if (daysPregnant < 0) return { error: "Date is in the future — pregnancy hasn't started." };
    const weeks = Math.floor(daysPregnant / 7);
    const days = daysPregnant % 7;
    const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;
    const daysUntil = Math.ceil((edd.getTime() - today.getTime()) / 86400000);
    const progress = Math.max(0, Math.min(100, (daysPregnant / 280) * 100));
    return { edd, weeks, days, trimester, daysUntil, progress, lmp };
  }, [mode, date]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "lmp" ? "default" : "outline"} onClick={() => setMode("lmp")}>LMP (Last Period)</Button>
        <Button size="sm" variant={mode === "conception" ? "default" : "outline"} onClick={() => setMode("conception")}>Conception date</Button>
      </div>

      <div>
        <Label>{mode === "lmp" ? "First day of last menstrual period" : "Conception date"}</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 max-w-xs" />
      </div>

      {r && "error" in r && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{r.error}</p>
      )}
      {r && !("error" in r) && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Estimated due date" value={fmtDate(r.edd)} highlight />
            <Stat label="Current" value={`${r.weeks}w ${r.days}d`} />
            <Stat label="Trimester" value={`${r.trimester}${r.trimester === 1 ? "st" : r.trimester === 2 ? "nd" : "rd"}`} />
            <Stat label={r.daysUntil >= 0 ? "Days until due" : "Days overdue"} value={Math.abs(r.daysUntil)} />
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(r.progress)}%</span>
            </div>
            <Bar percent={r.progress} />
            <ul className="mt-4 space-y-2 text-xs">
              {[
                { w: 12, label: "End of first trimester — risk of miscarriage drops significantly" },
                { w: 20, label: "Anatomy scan — mid-pregnancy ultrasound" },
                { w: 24, label: "Viability threshold" },
                { w: 37, label: "Full-term begins" },
                { w: 40, label: "Estimated due date" },
              ].map((m) => (
                <li key={m.w} className="flex items-center gap-2">
                  <span className={`inline-flex h-5 w-10 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${r.weeks >= m.w ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    W{m.w}
                  </span>
                  <span className="text-muted-foreground">{m.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <Disclaimer extra="Due dates are estimates based on Naegele's rule (LMP + 280 days). Only about 4% of babies are born on their exact due date; most arrive within 2 weeks either side." />
    </div>
  );
}