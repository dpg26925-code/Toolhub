import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TtCpmCalc() {
  const [cost, setCost] = useState(500);
  const [impressions, setImpressions] = useState(120000);
  const cpm = impressions ? (cost / impressions) * 1000 : 0;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Ad spend ($)</Label><Input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(+e.target.value || 0)} className="mt-1" /></div>
        <div><Label>Impressions</Label><Input type="number" min={0} value={impressions} onChange={(e) => setImpressions(+e.target.value || 0)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border bg-card p-6 text-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Cost per 1,000 impressions</div>
        <div className="mt-2 text-5xl font-bold">${cpm.toFixed(2)}</div>
        <div className="mt-2 text-sm text-muted-foreground">Reverse: at this CPM, $100 buys {cpm > 0 ? Math.round((100 / cpm) * 1000).toLocaleString() : "—"} impressions.</div>
      </div>
    </div>
  );
}