import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Event = { month: number; day: number; year: number; category: string; text: string };

const EVENTS: Event[] = [
  { month: 1, day: 1, year: 1863, category: "history", text: "Emancipation Proclamation takes effect in the United States." },
  { month: 1, day: 4, year: 1643, category: "births", text: "Isaac Newton, English mathematician and physicist, is born." },
  { month: 2, day: 12, year: 1809, category: "births", text: "Abraham Lincoln and Charles Darwin are both born." },
  { month: 3, day: 14, year: 1879, category: "births", text: "Albert Einstein, theoretical physicist, is born." },
  { month: 4, day: 12, year: 1961, category: "discoveries", text: "Yuri Gagarin becomes the first human in space." },
  { month: 4, day: 15, year: 1912, category: "history", text: "The RMS Titanic sinks in the North Atlantic." },
  { month: 5, day: 25, year: 1977, category: "culture", text: "Star Wars: A New Hope premieres in theaters." },
  { month: 6, day: 6, year: 1944, category: "wars", text: "D-Day: Allied forces land at Normandy." },
  { month: 6, day: 21, year: 1948, category: "discoveries", text: "First stored-program computer runs its first program (Manchester Baby)." },
  { month: 7, day: 4, year: 1776, category: "history", text: "US Declaration of Independence is adopted." },
  { month: 7, day: 20, year: 1969, category: "discoveries", text: "Apollo 11 astronauts land on the Moon." },
  { month: 8, day: 6, year: 1945, category: "wars", text: "Atomic bomb dropped on Hiroshima." },
  { month: 8, day: 15, year: 1947, category: "history", text: "India gains independence from Britain." },
  { month: 9, day: 2, year: 1945, category: "wars", text: "Japan formally surrenders, ending WWII." },
  { month: 9, day: 11, year: 2001, category: "history", text: "September 11 attacks in the United States." },
  { month: 10, day: 14, year: 1947, category: "discoveries", text: "Chuck Yeager breaks the sound barrier." },
  { month: 10, day: 29, year: 1969, category: "discoveries", text: "First message sent over ARPANET, precursor to the Internet." },
  { month: 11, day: 9, year: 1989, category: "history", text: "The Berlin Wall falls." },
  { month: 11, day: 22, year: 1963, category: "deaths", text: "US President John F. Kennedy is assassinated." },
  { month: 12, day: 7, year: 1941, category: "wars", text: "Attack on Pearl Harbor." },
  { month: 12, day: 17, year: 1903, category: "discoveries", text: "Wright brothers make first powered flight." },
  { month: 12, day: 25, year: 1642, category: "births", text: "Isaac Newton born (Julian calendar)." },
];

const COLORS: Record<string, string> = { births: "#22c55e", deaths: "#64748b", discoveries: "#3b82f6", wars: "#ef4444", culture: "#a855f7", history: "#f97316" };

export default function HistoricalEventsFinder() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [cat, setCat] = useState<string>("all");

  const matches = EVENTS.filter(e => e.month === month && e.day === day && (cat === "all" || e.category === cat));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label>Month</Label><Input type="number" min={1} max={12} value={month} onChange={e => setMonth(+e.target.value)} /></div>
        <div><Label>Day</Label><Input type="number" min={1} max={31} value={day} onChange={e => setDay(+e.target.value)} /></div>
        <div><Label>Category</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="all">All</option><option value="births">Births</option><option value="deaths">Deaths</option><option value="discoveries">Discoveries</option><option value="wars">Wars</option><option value="culture">Culture</option><option value="history">History</option>
        </select></div>
      </div>
      <div className="space-y-2">
        {matches.length === 0 && <div className="rounded-lg border p-4 text-sm text-muted-foreground">No events found for this date. Try another day.</div>}
        {matches.map((e, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <span className="rounded px-2 py-0.5 text-xs text-white" style={{ background: COLORS[e.category] }}>{e.category}</span>
              <span className="font-bold">{e.year}</span>
            </div>
            <div className="mt-1 text-sm">{e.text}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Curated highlights for educational purposes. Not a complete historical record.</p>
    </div>
  );
}
