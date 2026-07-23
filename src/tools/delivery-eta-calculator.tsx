import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROUTES: Record<string, { express: number; standard: number; sea: number; label: string }> = {
  cn_us: { express: 4, standard: 8, sea: 30, label: "China → US" },
  cn_eu: { express: 5, standard: 10, sea: 32, label: "China → EU" },
  cn_au: { express: 3, standard: 6, sea: 22, label: "China → Australia" },
  vn_us: { express: 5, standard: 9, sea: 30, label: "Vietnam → US" },
  in_us: { express: 4, standard: 8, sea: 35, label: "India → US" },
};

export default function Tool() {
  const [ship, setShip] = useState(new Date().toISOString().slice(0, 10));
  const [route, setRoute] = useState("cn_us");
  const [service, setService] = useState<"express" | "standard" | "sea">("express");

  const r = useMemo(() => {
    const info = ROUTES[route];
    const days = info[service];
    const start = new Date(ship);
    const calendar = new Date(start); calendar.setDate(calendar.getDate() + days);
    let d = new Date(start); let workDays = days; let workDaysCounted = 0;
    while (workDaysCounted < workDays) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) workDaysCounted++; }
    return { days, calendar, working: d, info };
  }, [ship, route, service]);

  const fmt = (d: Date) => d.toDateString();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Ship date</Label><Input type="date" value={ship} onChange={(e) => setShip(e.target.value)} className="mt-1"/></div>
        <div><Label>Route</Label><Select value={route} onValueChange={setRoute}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(ROUTES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Service</Label><Select value={service} onValueChange={(v) => setService(v as typeof service)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="express">Express air</SelectItem><SelectItem value="standard">Standard air</SelectItem><SelectItem value="sea">Sea freight</SelectItem></SelectContent></Select></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Transit days" value={`${r.days}`}/>
        <Stat label="ETA (calendar)" value={fmt(r.calendar)}/>
        <Stat label="ETA (working days)" value={fmt(r.working)} highlight/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}