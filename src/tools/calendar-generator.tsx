import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SUN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS_MON = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const HOLIDAYS: Record<string, Record<string, string>> = {
  US: { "01-01": "New Year", "07-04": "Independence", "12-25": "Christmas" },
  UK: { "01-01": "New Year", "12-25": "Christmas", "12-26": "Boxing Day" },
  VN: { "01-01": "New Year", "04-30": "Reunification", "09-02": "National Day" },
};

export default function CalendarGenerator() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [start, setStart] = useState<"sun" | "mon">("sun");
  const [country, setCountry] = useState<"US" | "UK" | "VN">("US");
  const ref = useRef<HTMLDivElement>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = start === "sun" ? firstDay : (firstDay + 6) % 7;
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const headers = start === "sun" ? DAYS_SUN : DAYS_MON;
  const hols = HOLIDAYS[country];

  const download = () => {
    const el = ref.current!;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:sans-serif;padding:20px">${el.innerHTML}</div></foreignObject></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `calendar-${year}-${month + 1}.svg`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <div><Label>Year</Label><Input type="number" value={year} onChange={e => setYear(+e.target.value)} /></div>
        <div><Label>Month</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={month} onChange={e => setMonth(+e.target.value)}>{MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}</select></div>
        <div><Label>Start day</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={start} onChange={e => setStart(e.target.value as "sun" | "mon")}><option value="sun">Sunday</option><option value="mon">Monday</option></select></div>
        <div><Label>Holidays</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={country} onChange={e => setCountry(e.target.value as "US" | "UK" | "VN")}><option value="US">United States</option><option value="UK">United Kingdom</option><option value="VN">Vietnam</option></select></div>
      </div>
      <div ref={ref} className="rounded-lg border p-6 bg-background">
        <div className="mb-4 text-center text-2xl font-bold">{MONTHS[month]} {year}</div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {headers.map(h => <div key={h} className="font-medium text-muted-foreground p-2">{h}</div>)}
          {cells.map((d, i) => {
            const key = d ? String(month + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0") : "";
            const hol = hols[key];
            return <div key={i} className={`rounded p-2 min-h-[60px] ${d ? "border" : ""} ${hol ? "bg-primary/10 border-primary" : ""}`}>
              {d && <><div className="font-bold">{d}</div>{hol && <div className="text-[10px] text-primary">{hol}</div>}</>}
            </div>;
          })}
        </div>
      </div>
      <Button onClick={download}>Download SVG</Button>
    </div>
  );
}
