import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [cost, setCost] = useState(50);
  const [price, setPrice] = useState(120);
  const [commission, setCommission] = useState(6);
  const [shipping, setShipping] = useState(10);
  const [ads, setAds] = useState(5);
  const [cod, setCod] = useState(2);

  const r = useMemo(() => {
    const commFee = price * commission / 100;
    const codFee = price * cod / 100;
    const totalFees = commFee + shipping + ads + codFee;
    const net = price - cost - totalFees;
    const margin = price > 0 ? (net / price) * 100 : 0;
    const beMargin = 15; // desired
    const bePrice = (cost + shipping + ads) / (1 - (commission + cod + beMargin) / 100);
    return { commFee, codFee, totalFees, net, margin, bePrice };
  }, [cost, price, commission, shipping, ads, cod]);

  const scenarios = [-20, -10, 0, 10, 20].map((delta) => {
    const p = price * (1 + delta / 100);
    const commFee = p * commission / 100, codFee = p * cod / 100;
    return { delta, price: p, net: p - cost - commFee - shipping - ads - codFee };
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Cost", cost, setCost],["Selling price", price, setPrice],["Commission %", commission, setCommission],["Shipping", shipping, setShipping],["Ads", ads, setAds],["COD fee %", cod, setCod]].map(([l, v, s]) => (
          <div key={l as string}><Label>{l as string}</Label><Input type="number" step="0.1" value={v as number} onChange={(e) => (s as (n: number) => void)(+e.target.value || 0)} className="mt-1"/></div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total fees" value={`$${r.totalFees.toFixed(2)}`}/>
        <Stat label="Net profit" value={`$${r.net.toFixed(2)}`} highlight={r.net >= 0 ? "pos" : "neg"}/>
        <Stat label="Margin" value={`${r.margin.toFixed(1)}%`}/>
        <Stat label="Break-even price (15% margin)" value={`$${r.bePrice.toFixed(2)}`}/>
      </div>
      <div className="rounded-lg border p-3">
        <h3 className="text-sm font-semibold">What-if: price changes</h3>
        <table className="mt-2 w-full text-sm"><thead><tr><th className="text-left">Δ</th><th className="text-right">Price</th><th className="text-right">Net</th></tr></thead>
          <tbody>{scenarios.map((s) => <tr key={s.delta} className="border-t"><td>{s.delta > 0 ? "+" : ""}{s.delta}%</td><td className="text-right">${s.price.toFixed(2)}</td><td className={`text-right ${s.net >= 0 ? "text-emerald-500" : "text-destructive"}`}>${s.net.toFixed(2)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: "pos" | "neg" }) {
  const c = highlight === "pos" ? "text-emerald-500" : highlight === "neg" ? "text-destructive" : "";
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${c}`}>{value}</div></div>;
}