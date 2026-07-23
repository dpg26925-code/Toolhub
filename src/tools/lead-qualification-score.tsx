import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tool() {
  const [budget, setBudget] = useState<"1"|"2"|"3"|"4">("3");
  const [authority, setAuthority] = useState<"1"|"2"|"3"|"4">("3");
  const [need, setNeed] = useState<"1"|"2"|"3"|"4">("3");
  const [timeline, setTimeline] = useState<"1"|"2"|"3"|"4">("2");
  const [size, setSize] = useState(100);
  const [engagement, setEngagement] = useState(6);

  const r = useMemo(() => {
    const b = +budget * 6, a = +authority * 6, n = +need * 6, t = +timeline * 6;
    const sizePts = size >= 1000 ? 20 : size >= 100 ? 15 : size >= 10 ? 10 : 5;
    const engPts = Math.min(20, engagement * 2);
    const total = Math.min(100, b + a + n + t + sizePts + engPts);
    const tier = total >= 80 ? "A · Hot" : total >= 60 ? "B · Warm" : total >= 40 ? "C · Nurture" : "D · Cold";
    return { total, tier, b, a, n, t, sizePts, engPts };
  }, [budget, authority, need, timeline, size, engagement]);

  const O = ({ label, v, set }: { label: string; v: string; set: (s: "1"|"2"|"3"|"4") => void }) => (
    <div><Label>{label}</Label>
      <Select value={v} onValueChange={(x) => set(x as "1"|"2"|"3"|"4")}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
        <SelectContent><SelectItem value="1">Low</SelectItem><SelectItem value="2">Some</SelectItem><SelectItem value="3">Good</SelectItem><SelectItem value="4">Excellent</SelectItem></SelectContent>
      </Select>
    </div>
  );

  const color = r.total >= 80 ? "text-emerald-500" : r.total >= 60 ? "text-blue-500" : r.total >= 40 ? "text-amber-500" : "text-muted-foreground";

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Scoring uses BANT (Budget · Authority · Need · Timeline) + company size + engagement.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <O label="Budget" v={budget} set={setBudget}/>
        <O label="Authority (decision maker)" v={authority} set={setAuthority}/>
        <O label="Need" v={need} set={setNeed}/>
        <O label="Timeline" v={timeline} set={setTimeline}/>
        <div><Label>Company size (employees)</Label><Input type="number" value={size} onChange={(e) => setSize(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Engagement level (0–10)</Label><Input type="number" min={0} max={10} value={engagement} onChange={(e) => setEngagement(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border bg-muted/30 p-4"><div className="text-xs text-muted-foreground">Lead score</div><div className={`text-4xl font-bold ${color}`}>{r.total}/100</div><div className={`mt-1 font-semibold ${color}`}>{r.tier}</div></div>
      <div className="rounded-lg border p-3 text-sm space-y-1">
        <div className="mb-1 font-semibold">Breakdown</div>
        <div className="flex justify-between"><span>Budget</span><span>{r.b}/24</span></div>
        <div className="flex justify-between"><span>Authority</span><span>{r.a}/24</span></div>
        <div className="flex justify-between"><span>Need</span><span>{r.n}/24</span></div>
        <div className="flex justify-between"><span>Timeline</span><span>{r.t}/24</span></div>
        <div className="flex justify-between"><span>Company size</span><span>{r.sizePts}/20</span></div>
        <div className="flex justify-between"><span>Engagement</span><span>{r.engPts}/20</span></div>
      </div>
    </div>
  );
}