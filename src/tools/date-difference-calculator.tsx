import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DateDifferenceCalculator() {
  const [start, setStart] = useState("2024-01-01");
  const [end, setEnd] = useState("2025-01-01");
  const [excludeWeekends, setExcludeWeekends] = useState(false);

  const s = new Date(start);
  const e = new Date(end);
  const ms = e.getTime() - s.getTime();
  const days = Math.round(ms / 86400000);

  let workdays = days;
  if (excludeWeekends && Number.isFinite(days)) {
    workdays = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const d = cur.getDay();
      if (d !== 0 && d !== 6) workdays++;
      cur.setDate(cur.getDate() + 1);
    }
  }

  const weeks = days / 7;
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const years = days / 365.25;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Start date</Label><Input type="date" value={start} onChange={e => setStart(e.target.value)} /></div>
        <div><Label>End date</Label><Input type="date" value={end} onChange={e => setEnd(e.target.value)} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={excludeWeekends} onChange={e => setExcludeWeekends(e.target.checked)} />
        Exclude weekends
      </label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["Days", days], ["Weeks", weeks.toFixed(1)], ["Months", months], ["Years", years.toFixed(2)]].map(([l, v]) => (
          <div key={l as string} className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-bold">{v}</div></div>
        ))}
      </div>
      {excludeWeekends && <div className="rounded-lg border bg-muted/30 p-4"><span className="text-sm text-muted-foreground">Weekdays only:</span> <span className="text-xl font-bold">{workdays}</span></div>}
      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: "100%" }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground"><span>{start}</span><span>{end}</span></div>
    </div>
  );
}
