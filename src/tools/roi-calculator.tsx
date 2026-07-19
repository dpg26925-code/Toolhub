import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_acc";

export default function RoiCalculator() {
  const [invested, setInvested] = useState(10000);
  const [returned, setReturned] = useState(13500);
  const [years, setYears] = useState(2);
  const [fees, setFees] = useState(0);
  const r = useMemo(() => {
    const net = returned - invested - fees;
    const roi = invested > 0 ? (net / invested) * 100 : 0;
    const ann = years > 0 && invested > 0 ? (Math.pow((returned - fees) / invested, 1 / years) - 1) * 100 : 0;
    return { net, roi, ann };
  }, [invested, returned, years, fees]);
  const maxV = Math.max(invested, returned, 1);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Amount invested</Label><Input type="number" value={invested} onChange={(e) => setInvested(+e.target.value)} className="mt-1" /></div>
        <div><Label>Amount returned</Label><Input type="number" value={returned} onChange={(e) => setReturned(+e.target.value)} className="mt-1" /></div>
        <div><Label>Years</Label><Input type="number" step="0.1" value={years} onChange={(e) => setYears(+e.target.value)} className="mt-1" /></div>
        <div><Label>Fees</Label><Input type="number" value={fees} onChange={(e) => setFees(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 grid gap-3 sm:grid-cols-3 text-sm">
        <S label="Net profit" v={fmt(r.net)} />
        <S label="ROI" v={`${fmt(r.roi, 2)}%`} h />
        <S label="Annualized" v={`${fmt(r.ann, 2)}%`} />
      </div>
      <div className="space-y-2">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Invested {fmt(invested)}</div>
          <div className="h-4 rounded bg-muted"><div className="h-full rounded bg-muted-foreground/50" style={{ width: `${(invested / maxV) * 100}%` }} /></div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Returned {fmt(returned)}</div>
          <div className="h-4 rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${(returned / maxV) * 100}%` }} /></div>
        </div>
      </div>
      <Button size="sm" onClick={() => { copy(`ROI ${fmt(r.roi, 2)}% (annualized ${fmt(r.ann, 2)}%)`); toast.success("Copied"); }}>Copy</Button>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div></div>;
}