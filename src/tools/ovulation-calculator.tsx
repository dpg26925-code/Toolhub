import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Disclaimer, Stat } from "./_health";

function fmt(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default function OvulationCalculator() {
  const [lmp, setLmp] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [cycle, setCycle] = useState(28);
  const [luteal, setLuteal] = useState(14);

  const r = useMemo(() => {
    if (!lmp) return null;
    const start = new Date(lmp + "T00:00:00");
    if (isNaN(start.getTime())) return null;
    if (cycle < 20 || cycle > 45) return { error: "Cycle length should be between 20 and 45 days." };
    const ovulation = addDays(start, cycle - luteal);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    const nextPeriod = addDays(start, cycle);
    const testDate = addDays(ovulation, 14);
    return { ovulation, fertileStart, fertileEnd, nextPeriod, testDate };
  }, [lmp, cycle, luteal]);

  const calendar = useMemo(() => {
    if (!r || "error" in r) return null;
    const days: { date: Date; kind: "period" | "fertile" | "ovulation" | "normal" }[] = [];
    const start = new Date(lmp + "T00:00:00");
    for (let i = 0; i < cycle; i++) {
      const d = addDays(start, i);
      let kind: "period" | "fertile" | "ovulation" | "normal" = "normal";
      if (i < 5) kind = "period";
      if (d >= r.fertileStart && d <= r.fertileEnd) kind = "fertile";
      if (sameDay(d, r.ovulation)) kind = "ovulation";
      days.push({ date: d, kind });
    }
    return days;
  }, [r, lmp, cycle]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>First day of last period</Label><Input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="mt-1" /></div>
        <div><Label>Cycle length (days)</Label><Input type="number" value={cycle} onChange={(e) => setCycle(+e.target.value)} className="mt-1" /></div>
        <div><Label>Luteal phase (days)</Label><Input type="number" value={luteal} onChange={(e) => setLuteal(+e.target.value)} className="mt-1" /></div>
      </div>

      {r && "error" in r && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{r.error}</p>
      )}
      {r && !("error" in r) && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Ovulation" value={fmt(r.ovulation)} highlight />
            <Stat label="Fertile window" value={`${fmt(r.fertileStart)} – ${fmt(r.fertileEnd)}`} />
            <Stat label="Next period" value={fmt(r.nextPeriod)} />
            <Stat label="Pregnancy test from" value={fmt(r.testDate)} hint="~14 days after ovulation" />
          </div>

          {calendar && (
            <div className="rounded-xl border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold">Cycle overview</h3>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
                {calendar.map((d, i) => {
                  const cls =
                    d.kind === "period" ? "bg-red-500/20 text-red-700 dark:text-red-300"
                    : d.kind === "ovulation" ? "bg-emerald-500 text-white font-bold"
                    : d.kind === "fertile" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-secondary text-muted-foreground";
                  return (
                    <div key={i} className={`rounded px-1 py-2 ${cls}`}>
                      <div className="text-[9px] opacity-70">D{i + 1}</div>
                      <div>{d.date.getDate()}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-red-500/40" /> Period</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-emerald-500/40" /> Fertile window</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-emerald-500" /> Ovulation</span>
              </div>
            </div>
          )}
        </>
      )}

      <Disclaimer extra="Ovulation prediction based on cycle length is an estimate. Sperm can survive up to 5 days; the egg is viable ~24 hours. For accurate tracking, combine with basal body temperature and OPK tests." />
    </div>
  );
}