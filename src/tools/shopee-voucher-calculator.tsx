import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [discount, setDiscount] = useState(20);
  const [minSpend, setMinSpend] = useState(100);
  const [limit, setLimit] = useState(500);
  const [avgOrder, setAvgOrder] = useState(150);
  const [redemptionRate, setRedemptionRate] = useState(30);

  const r = useMemo(() => {
    const uses = Math.round(limit * redemptionRate / 100);
    const grossRevenue = uses * avgOrder;
    const discountCost = uses * discount;
    const netRevenue = grossRevenue - discountCost;
    const effectiveDiscount = avgOrder > 0 ? (discount / avgOrder) * 100 : 0;
    const beRedemptions = discount > 0 ? Math.ceil(discount / (avgOrder - minSpend > 0 ? avgOrder - minSpend : 1)) : 0;
    return { uses, grossRevenue, discountCost, netRevenue, effectiveDiscount, beRedemptions };
  }, [discount, minSpend, limit, avgOrder, redemptionRate]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Voucher discount ($)</Label><Input type="number" value={discount} onChange={(e) => setDiscount(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Min spend ($)</Label><Input type="number" value={minSpend} onChange={(e) => setMinSpend(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Usage limit (vouchers)</Label><Input type="number" value={limit} onChange={(e) => setLimit(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Avg order value ($)</Label><Input type="number" value={avgOrder} onChange={(e) => setAvgOrder(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Redemption rate (%)</Label><Input type="number" value={redemptionRate} onChange={(e) => setRedemptionRate(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Expected redemptions" value={r.uses.toString()}/>
        <Stat label="Gross revenue" value={`$${r.grossRevenue.toFixed(2)}`}/>
        <Stat label="Discount cost" value={`$${r.discountCost.toFixed(2)}`}/>
        <Stat label="Net revenue" value={`$${r.netRevenue.toFixed(2)}`} highlight/>
        <Stat label="Effective discount rate" value={`${r.effectiveDiscount.toFixed(1)}%`}/>
        <Stat label="Break-even sales/voucher" value={`${r.beRedemptions}`}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}