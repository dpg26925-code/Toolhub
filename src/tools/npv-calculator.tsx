import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

function npv(rate: number, flows: number[]) {
  return flows.reduce((s, f, i) => s + f / Math.pow(1 + rate / 100, i), 0);
}
function irr(flows: number[]): number | null {
  let lo = -99, hi = 1000;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const v = npv(mid, flows);
    if (Math.abs(v) < 0.01) return mid;
    if (v > 0) lo = mid; else hi = mid;
  }
  return null;
}

export default function NpvCalculator() {
  const [initial, setInitial] = useState(10000);
  const [rate, setRate] = useState(10);
  const [flowsText, setFlowsText] = useState("3000\n4000\n4000\n3000");
  const r = useMemo(() => {
    const flows = [-Math.abs(initial), ...flowsText.split(/[\n,]+/).map((s) => +s.trim()).filter((n) => !isNaN(n))];
    const value = npv(rate, flows);
    const i = irr(flows);
    const disc = flows.map((f, k) => ({ year: k, flow: f, pv: f / Math.pow(1 + rate / 100, k) }));
    return { value, irr: i, disc };
  }, [initial, rate, flowsText]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Initial investment</Label><Input type="number" value={initial} onChange={(e) => setInitial(+e.target.value)} className="mt-1" /></div>
        <div><Label>Discount rate (%)</Label><Input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1" /></div>
        <div className="sm:col-span-2">
          <Label>Cash flows (one per line, year 1+)</Label>
          <textarea value={flowsText} onChange={(e) => setFlowsText(e.target.value)} rows={5} className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm font-mono" />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-3 text-sm">
        <S label="NPV" v={fmt(r.value)} h />
        <S label="IRR" v={r.irr === null ? "—" : `${fmt(r.irr, 2)}%`} />
        <S label="Decision" v={r.value > 0 ? "✓ Accept" : "✗ Reject"} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="p-2 text-left">Year</th><th className="p-2 text-right">Cash flow</th><th className="p-2 text-right">PV</th></tr></thead>
          <tbody>{r.disc.map((d) => <tr key={d.year} className="border-t border-border"><td className="p-2">{d.year}</td><td className="p-2 text-right">{fmt(d.flow)}</td><td className="p-2 text-right">{fmt(d.pv)}</td></tr>)}</tbody>
        </table>
      </div>
      <Button size="sm" onClick={() => { copy(`NPV ${fmt(r.value)} · IRR ${r.irr === null ? "n/a" : fmt(r.irr, 2) + "%"}`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}