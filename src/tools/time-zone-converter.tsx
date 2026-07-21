import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { CopyBtn } from "./_units";

// Curated set of IANA zones (Intl.supportedValuesOf may not be available in all runtimes)
const ZONES = [
  "UTC",
  "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "America/Toronto",
  "America/Sao_Paulo", "America/Mexico_City", "America/Argentina/Buenos_Aires",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Rome", "Europe/Amsterdam", "Europe/Moscow", "Europe/Istanbul",
  "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos",
  "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok", "Asia/Ho_Chi_Minh", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Singapore", "Asia/Seoul", "Asia/Tokyo",
  "Australia/Perth", "Australia/Sydney", "Pacific/Auckland", "Pacific/Honolulu",
];

const PRESETS = [
  { city: "New York", tz: "America/New_York" },
  { city: "London", tz: "Europe/London" },
  { city: "Berlin", tz: "Europe/Berlin" },
  { city: "Dubai", tz: "Asia/Dubai" },
  { city: "Mumbai", tz: "Asia/Kolkata" },
  { city: "Singapore", tz: "Asia/Singapore" },
  { city: "Tokyo", tz: "Asia/Tokyo" },
  { city: "Sydney", tz: "Australia/Sydney" },
  { city: "San Francisco", tz: "America/Los_Angeles" },
  { city: "São Paulo", tz: "America/Sao_Paulo" },
];

function zoneOffsetMinutes(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const g = (t: string) => parseInt(parts.find((p) => p.type === t)!.value, 10);
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return (asUtc - date.getTime()) / 60000;
}

function isDst(tz: string): boolean {
  const y = new Date().getUTCFullYear();
  const jan = zoneOffsetMinutes(new Date(Date.UTC(y, 0, 1, 12)), tz);
  const jul = zoneOffsetMinutes(new Date(Date.UTC(y, 6, 1, 12)), tz);
  const nowOff = zoneOffsetMinutes(new Date(), tz);
  return nowOff !== Math.min(jan, jul);
}

function fmtOffset(min: number): string {
  const sign = min >= 0 ? "+" : "-";
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function TimeZoneConverter() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const [date, setDate] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
  const [time, setTime] = useState(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  const [fromTz, setFromTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [toTz, setToTz] = useState("Asia/Tokyo");
  const [h12, setH12] = useState(false);

  const parsed = useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const t = /^(\d{2}):(\d{2})$/.exec(time);
    if (!m || !t) return null;
    const [_, y, mo, d] = m;
    const [__, hh, mm] = t;
    // Interpret Y/M/D/H/M as wall-clock in fromTz — find UTC instant that renders to that wall time.
    // Method: start with UTC candidate = Date.UTC(y,m-1,d,h,m); adjust by offset iteratively.
    let utc = Date.UTC(+y, +mo - 1, +d, +hh, +mm);
    for (let i = 0; i < 3; i++) {
      const off = zoneOffsetMinutes(new Date(utc), fromTz);
      const newUtc = Date.UTC(+y, +mo - 1, +d, +hh, +mm) - off * 60000;
      if (newUtc === utc) break;
      utc = newUtc;
    }
    return new Date(utc);
  }, [date, time, fromTz]);

  const fmt = (d: Date, tz: string) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      dateStyle: "full",
      timeStyle: "medium",
      hourCycle: h12 ? "h12" : "h23",
    }).format(d);
  };

  const fromOff = parsed ? zoneOffsetMinutes(parsed, fromTz) : 0;
  const toOff = parsed ? zoneOffsetMinutes(parsed, toTz) : 0;
  const diffH = (toOff - fromOff) / 60;

  // Day difference for target
  const dayDiff = (() => {
    if (!parsed) return 0;
    const dFrom = new Intl.DateTimeFormat("en-CA", { timeZone: fromTz, year: "numeric", month: "2-digit", day: "2-digit" }).format(parsed);
    const dTo = new Intl.DateTimeFormat("en-CA", { timeZone: toTz, year: "numeric", month: "2-digit", day: "2-digit" }).format(parsed);
    const [y1, m1, d1] = dFrom.split("-").map(Number);
    const [y2, m2, d2] = dTo.split("-").map(Number);
    return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  })();

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);
  void tick;

  const toText = parsed ? fmt(parsed, toTz) : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm text-muted-foreground">Presets:</div>
        {PRESETS.map((p) => (
          <Button key={p.tz} size="sm" variant="outline" onClick={() => setToTz(p.tz)}>{p.city}</Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant={h12 ? "outline" : "default"} onClick={() => setH12(false)}>24h</Button>
          <Button size="sm" variant={h12 ? "default" : "outline"} onClick={() => setH12(true)}>12h</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border p-4 space-y-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Source</div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" /></div>
            <div><Label>Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" /></div>
          </div>
          <div>
            <Label>Time zone</Label>
            <select value={fromTz} onChange={(e) => setFromTz(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          {parsed && (
            <div className="text-sm text-muted-foreground">
              {fmt(parsed, fromTz)}<br />
              <span className="font-mono">{fmtOffset(fromOff)}</span>
              {isDst(fromTz) && <span className="ml-2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-xs">DST</span>}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Target</div>
            <Button variant="ghost" size="icon" onClick={() => { const a = fromTz; setFromTz(toTz); setToTz(a); }} title="Swap">
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <Label>Time zone</Label>
            <select value={toTz} onChange={(e) => setToTz(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          {parsed && (
            <>
              <div className="text-2xl font-semibold">{toText}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-muted-foreground">{fmtOffset(toOff)}</span>
                {isDst(toTz) && <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-xs">DST</span>}
                <span className="text-muted-foreground">·</span>
                <span className="text-foreground">{diffH >= 0 ? "+" : ""}{diffH}h vs source</span>
                {dayDiff !== 0 && (
                  <span className="rounded bg-primary/15 text-primary px-1.5 py-0.5 text-xs">{dayDiff > 0 ? `+${dayDiff} day` : `${dayDiff} day`}</span>
                )}
              </div>
              <CopyBtn text={toText} />
            </>
          )}
        </div>
      </div>

      {!parsed && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">Enter a valid date and time.</div>}

      {parsed && (
        <div className="rounded-xl border border-border p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">World clock</div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PRESETS.map((p) => (
              <div key={p.tz} className="flex justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">{p.city}</span>
                <span className="font-mono">{new Intl.DateTimeFormat("en-GB", { timeZone: p.tz, hour: "2-digit", minute: "2-digit", month: "short", day: "2-digit", hourCycle: h12 ? "h12" : "h23" }).format(parsed)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}