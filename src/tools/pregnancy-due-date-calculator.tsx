import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [method, setMethod] = useState<"lmp" | "conception" | "us">("lmp");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weeks, setWeeks] = useState(8);

  const r = useMemo(() => {
    const d = new Date(date); let due: Date; let concept: Date;
    if (method === "lmp") { due = new Date(d); due.setDate(d.getDate() + 280); concept = new Date(d); concept.setDate(d.getDate() + 14); }
    else if (method === "conception") { due = new Date(d); due.setDate(d.getDate() + 266); concept = new Date(d); }
    else { due = new Date(d); due.setDate(d.getDate() + (280 - weeks * 7)); concept = new Date(due); concept.setDate(due.getDate() - 266); }
    const today = new Date();
    const gestDays = Math.floor((today.getTime() - (method === "lmp" ? d.getTime() : concept.getTime() - 14 * 86400000)) / 86400000);
    const gw = Math.floor(gestDays / 7); const gd = gestDays % 7;
    const tri = gw < 13 ? "First" : gw < 27 ? "Second" : "Third";
    return { due, concept, gw, gd, tri };
  }, [method, date, weeks]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Method</Label><Select value={method} onValueChange={(v) => setMethod(v as typeof method)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="lmp">Last menstrual period</SelectItem><SelectItem value="conception">Conception date</SelectItem><SelectItem value="us">Ultrasound</SelectItem></SelectContent></Select></div>
        <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1"/></div>
        {method === "us" && <div><Label>Gestational age (weeks)</Label><Input type="number" value={weeks} onChange={(e) => setWeeks(+e.target.value || 0)} className="mt-1"/></div>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Estimated due date" value={r.due.toDateString()} highlight/>
        <Stat label="Approx. conception" value={r.concept.toDateString()}/>
        <Stat label="Current gestational age" value={`${r.gw}w ${r.gd}d`}/>
        <Stat label="Trimester" value={r.tri}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}