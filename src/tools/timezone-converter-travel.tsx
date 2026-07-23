import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DESTINATIONS } from "./_travel";

function offsetMinutes(tz: string, at: Date) {
  // Compute UTC offset for a timezone at a specific date.
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = fmt.formatToParts(at).reduce<Record<string,string>>((a, p) => { if (p.type !== "literal") a[p.type] = p.value; return a; }, {});
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUTC - at.getTime()) / 60000);
}

function fmtOffset(min: number) {
  const sign = min >= 0 ? "+" : "-";
  const a = Math.abs(min); const h = Math.floor(a / 60); const m = a % 60;
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function jetLagTips(diffHours: number, direction: "east" | "west") {
  const abs = Math.abs(diffHours);
  if (abs < 3) return ["Minimal jet lag expected. Stay hydrated and get sunlight on arrival."];
  const base = [
    "Shift your sleep 1 hour per day toward destination time in the 3 days before you fly.",
    "Hydrate on the flight and avoid alcohol.",
    "Get 15+ minutes of natural sunlight on your first morning at destination.",
    "Nap only if you must — cap it at 30 minutes.",
  ];
  if (direction === "east") base.push("Traveling east is harder — consider melatonin 30 min before your target bedtime (consult a doctor).");
  else base.push("Traveling west is easier — stay up until local bedtime on day 1.");
  if (abs >= 8) base.push(`Expect ~${Math.ceil(abs / 1.5)} days for full adjustment.`);
  return base;
}

export default function TimezoneConverterTravel() {
  const [from, setFrom] = useState(DESTINATIONS[0].city);
  const [to, setTo] = useState(DESTINATIONS[8].city);
  const now = useMemo(() => new Date(), []);
  const [depTime, setDepTime] = useState(() => {
    const d = new Date(); d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [flightHours, setFlightHours] = useState<number>(8);

  const fromDest = DESTINATIONS.find((d) => d.city === from) ?? DESTINATIONS[0];
  const toDest = DESTINATIONS.find((d) => d.city === to) ?? DESTINATIONS[1];

  const dep = new Date(depTime);
  const fromOff = offsetMinutes(fromDest.tz, dep);
  const toOff = offsetMinutes(toDest.tz, dep);
  const diffMin = toOff - fromOff;
  const arrivalUTC = new Date(dep.getTime() - fromOff * 60000 + flightHours * 3600 * 1000);

  const localArrivalStr = new Intl.DateTimeFormat("en-US", {
    timeZone: toDest.tz, weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  }).format(arrivalUTC);

  const localDepStr = new Intl.DateTimeFormat("en-US", {
    timeZone: fromDest.tz, weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  }).format(dep);

  const diffHours = diffMin / 60;
  const direction: "east" | "west" = diffMin >= 0 ? "east" : "west";
  const tz1 = offsetMinutes(fromDest.tz, now);
  const tz2 = offsetMinutes(toDest.tz, now);
  const zonesCrossed = Math.round((tz2 - tz1) / 60);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Departure city</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={from} onChange={(e) => setFrom(e.target.value)}>
            {DESTINATIONS.map((d) => <option key={d.city} value={d.city}>{d.city}, {d.country}</option>)}
          </select>
        </div>
        <div>
          <Label>Arrival city</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={to} onChange={(e) => setTo(e.target.value)}>
            {DESTINATIONS.map((d) => <option key={d.city} value={d.city}>{d.city}, {d.country}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="dep">Departure date & time (local)</Label>
          <Input id="dep" type="datetime-local" value={depTime} onChange={(e) => setDepTime(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="fh">Flight duration (hours)</Label>
          <Input id="fh" type="number" min={0} step={0.25} value={flightHours} onChange={(e) => setFlightHours(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="text-xs text-muted-foreground">Depart · {fromDest.city} · {fmtOffset(fromOff)}</div>
          <div className="mt-1 text-2xl font-bold">{localDepStr}</div>
        </div>
        <div className="rounded-xl border bg-primary/10 border-primary/30 p-6">
          <div className="text-xs text-muted-foreground">Arrive · {toDest.city} · {fmtOffset(toOff)}</div>
          <div className="mt-1 text-2xl font-bold">{localArrivalStr}</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Time difference" value={`${diffHours >= 0 ? "+" : ""}${diffHours.toFixed(1)} h`} />
        <Stat label="Time zones crossed" value={`${Math.abs(zonesCrossed)}`} />
        <Stat label="Direction" value={direction === "east" ? "Eastbound ↗" : "Westbound ↙"} />
      </div>

      <div className="rounded-xl border bg-secondary/40 p-6">
        <h3 className="text-sm font-semibold">Jet lag recovery</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {jetLagTips(diffHours, direction).map((t) => (
            <li key={t} className="flex gap-2"><span className="text-primary">•</span>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}