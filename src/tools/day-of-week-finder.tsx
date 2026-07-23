import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const HOLIDAYS_US: Record<string, string> = { "01-01": "New Year's Day", "07-04": "Independence Day", "12-25": "Christmas Day", "11-11": "Veterans Day" };

function weekNumber(d: Date) {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
}
function dayOfYear(d: Date) {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
}

export default function DayOfWeekFinder() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [batch, setBatch] = useState("");

  const info = (dstr: string) => {
    const d = new Date(dstr);
    if (isNaN(d.getTime())) return null;
    const key = String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    return { date: dstr, day: DAYS[d.getDay()], week: weekNumber(d), doy: dayOfYear(d), weekend: d.getDay() === 0 || d.getDay() === 6, holiday: HOLIDAYS_US[key] };
  };
  const single = info(date);
  const batchLines = batch.split("\n").map(l => l.trim()).filter(Boolean);
  const batchResults = batchLines.map(info).filter(Boolean);

  return (
    <div className="space-y-6">
      <div><label className="text-sm font-medium">Date</label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      {single && (
        <div className="rounded-lg border p-6">
          <div className="text-4xl font-bold">{single.day}</div>
          <div className="mt-2 text-sm text-muted-foreground">Week {single.week} · Day {single.doy} of the year {single.weekend && "· Weekend"} {single.holiday && `· ${single.holiday}`}</div>
        </div>
      )}
      <div>
        <label className="text-sm font-medium">Batch (one date per line, YYYY-MM-DD)</label>
        <Textarea rows={4} value={batch} onChange={e => setBatch(e.target.value)} placeholder={"2024-07-04\n2025-12-25"} />
      </div>
      {batchResults.length > 0 && (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="p-2 text-left">Date</th><th className="p-2 text-left">Day</th><th className="p-2 text-left">Week</th><th className="p-2 text-left">Holiday</th></tr></thead>
            <tbody>{batchResults.map((r, i) => r && <tr key={i} className="border-b"><td className="p-2">{r.date}</td><td className="p-2">{r.day}</td><td className="p-2">{r.week}</td><td className="p-2">{r.holiday || ""}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
