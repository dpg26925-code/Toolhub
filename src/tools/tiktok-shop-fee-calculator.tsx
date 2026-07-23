import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATS: Record<string, number> = { fashion: 5, beauty: 5, electronics: 3, home: 5, food: 5, "sports & outdoors": 4, other: 5 };
const PROCESSING = 2.9; // %
const FIXED_FEE = 0.3;

export default function Tool() {
  const [price, setPrice] = useState(29.99);
  const [cat, setCat] = useState("beauty");
  const [shipping, setShipping] = useState(3);

  const r = useMemo(() => {
    const commRate = CATS[cat] ?? 5;
    const commission = price * commRate / 100;
    const processing = price * PROCESSING / 100 + FIXED_FEE;
    const totalFee = commission + processing;
    const settlement = price - totalFee;
    const marginAfterShip = settlement - shipping;
    return { commRate, commission, processing, totalFee, settlement, marginAfterShip };
  }, [price, cat, shipping]);

  const bar = (v: number, max: number) => `${Math.max(2, (v / max) * 100).toFixed(0)}%`;
  const max = price || 1;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Demo mode — TikTok Shop fees vary by region and program. Verify with your seller dashboard.</div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Selling price</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Category</Label>
          <Select value={cat} onValueChange={setCat}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent>{Object.keys(CATS).map((c) => <SelectItem key={c} value={c} className="capitalize">{c} ({CATS[c]}%)</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Shipping cost</Label><Input type="number" step="0.01" value={shipping} onChange={(e) => setShipping(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border p-4 space-y-2">
        <FeeBar label={`Commission (${r.commRate}%)`} value={r.commission} width={bar(r.commission, max)} color="bg-rose-500"/>
        <FeeBar label={`Payment processing (${PROCESSING}% + $${FIXED_FEE})`} value={r.processing} width={bar(r.processing, max)} color="bg-amber-500"/>
        <FeeBar label="Shipping" value={shipping} width={bar(shipping, max)} color="bg-blue-500"/>
        <FeeBar label="Net settlement" value={r.settlement} width={bar(r.settlement, max)} color="bg-emerald-500"/>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Total fees" value={`$${r.totalFee.toFixed(2)}`}/>
        <Stat label="After shipping" value={`$${r.marginAfterShip.toFixed(2)}`} highlight/>
      </div>
    </div>
  );
}

function FeeBar({ label, value, width, color }: { label: string; value: number; width: string; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs"><span>{label}</span><span className="font-medium">${value.toFixed(2)}</span></div>
      <div className="h-3 rounded-full bg-muted"><div className={`h-full rounded-full ${color}`} style={{ width }}/></div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-emerald-500" : ""}`}>{value}</div></div>;
}