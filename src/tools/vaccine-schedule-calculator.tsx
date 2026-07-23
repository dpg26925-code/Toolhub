import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SCHEDULE = [
  { name: "Hepatitis B (dose 1)", months: 0 },
  { name: "Hepatitis B (dose 2)", months: 1 },
  { name: "Rotavirus / DTaP / Hib / PCV / IPV (2 mo)", months: 2 },
  { name: "Rotavirus / DTaP / Hib / PCV / IPV (4 mo)", months: 4 },
  { name: "Hepatitis B (dose 3) / DTaP / Hib / PCV / IPV (6 mo)", months: 6 },
  { name: "MMR / Varicella (12 mo)", months: 12 },
  { name: "DTaP booster / Hib / PCV (15 mo)", months: 15 },
  { name: "Hepatitis A (18 mo)", months: 18 },
  { name: "DTaP / IPV / MMR / Varicella (4 yr)", months: 48 },
  { name: "Tdap / HPV / MenACWY (11 yr)", months: 132 },
];

export default function Tool() {
  const [dob, setDob] = useState("");
  const list = useMemo(() => {
    if (!dob) return [];
    const d = new Date(dob);
    return SCHEDULE.map((s) => { const dt = new Date(d); dt.setMonth(dt.getMonth() + s.months); return { ...s, date: dt }; });
  }, [dob]);
  const today = new Date();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Based on the US CDC childhood immunization schedule. Consult your pediatrician for individual recommendations.</div>
      <div className="max-w-xs"><Label>Child date of birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1"/></div>
      {list.length > 0 && (
        <div className="rounded-lg border">
          <table className="w-full text-sm"><thead className="bg-muted"><tr><th className="p-2 text-left">Vaccine</th><th className="p-2 text-left">Due</th><th className="p-2 text-left">Status</th></tr></thead>
          <tbody>{list.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.date.toDateString()}</td>
              <td className="p-2">{r.date < today ? <span className="text-emerald-500">✓ Due</span> : <span className="text-muted-foreground">Upcoming</span>}</td>
            </tr>
          ))}</tbody></table>
        </div>
      )}
    </div>
  );
}