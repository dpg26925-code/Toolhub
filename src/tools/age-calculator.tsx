import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ZODIAC = [
  { name: "Capricorn", from: [12, 22], to: [1, 19] },
  { name: "Aquarius", from: [1, 20], to: [2, 18] },
  { name: "Pisces", from: [2, 19], to: [3, 20] },
  { name: "Aries", from: [3, 21], to: [4, 19] },
  { name: "Taurus", from: [4, 20], to: [5, 20] },
  { name: "Gemini", from: [5, 21], to: [6, 20] },
  { name: "Cancer", from: [6, 21], to: [7, 22] },
  { name: "Leo", from: [7, 23], to: [8, 22] },
  { name: "Virgo", from: [8, 23], to: [9, 22] },
  { name: "Libra", from: [9, 23], to: [10, 22] },
  { name: "Scorpio", from: [10, 23], to: [11, 21] },
  { name: "Sagittarius", from: [11, 22], to: [12, 21] },
];
const BIRTHSTONE = ["Garnet","Amethyst","Aquamarine","Diamond","Emerald","Pearl","Ruby","Peridot","Sapphire","Opal","Topaz","Turquoise"];
const PLANET_YEAR = { Mercury: 0.240846, Venus: 0.615198, Mars: 1.88085, Jupiter: 11.862, Saturn: 29.4571 };
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function zodiacFor(m: number, d: number) {
  for (const z of ZODIAC) {
    if ((m === z.from[0] && d >= z.from[1]) || (m === z.to[0] && d <= z.to[1])) return z.name;
  }
  return "Capricorn";
}

export default function AgeCalculator() {
  const [birth, setBirth] = useState("2000-01-01");
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  const b = new Date(birth);
  const ms = now.getTime() - b.getTime();
  const years = ms / (365.25 * 86400000);
  const totalDays = Math.floor(ms / 86400000);

  let y = now.getFullYear() - b.getFullYear();
  let m = now.getMonth() - b.getMonth();
  let d = now.getDate() - b.getDate();
  if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor(ms / 60000);
  const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  const daysToBday = Math.ceil((next.getTime() - now.getTime()) / 86400000);

  return (
    <div className="space-y-6">
      <div><Label>Birth date</Label><Input type="date" value={birth} onChange={e => setBirth(e.target.value)} /></div>
      <div className="rounded-lg border p-6">
        <div className="text-4xl font-bold">{y} years, {m} months, {d} days</div>
        <div className="mt-2 text-sm text-muted-foreground">{totalDays.toLocaleString()} days · {hours.toLocaleString()} hours · {minutes.toLocaleString()} minutes</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">Born on</div><div className="font-bold">{DAYS[b.getDay()]}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">Zodiac</div><div className="font-bold">{zodiacFor(b.getMonth() + 1, b.getDate())}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">Birthstone</div><div className="font-bold">{BIRTHSTONE[b.getMonth()]}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">Next birthday</div><div className="font-bold">{daysToBday} days</div></div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="mb-2 text-sm font-medium">Age on other planets</div>
        <div className="grid gap-2 sm:grid-cols-5">
          {Object.entries(PLANET_YEAR).map(([p, len]) => (
            <div key={p} className="rounded border p-2 text-center">
              <div className="text-xs text-muted-foreground">{p}</div>
              <div className="font-bold">{(years / len).toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
