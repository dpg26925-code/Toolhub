import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [price, setPrice] = useState(29.99);
  const [cost, setCost] = useState(8);
  const [shipping, setShipping] = useState(3);
  const [commission, setCommission] = useState(5);
  const [ads, setAds] = useState(2);

  const r = useMemo(() => {
    const fee = price * commission / 100;
    const net = price - cost - shipping - fee - ads;
    const margin = price > 0 ? (net / price) * 100 : 0;
    const roi = cost > 0 ? (net / (cost + ads)) * 100 : 0;
    const breakEvenPrice = (cost + shipping + ads) / (1 - commission / 100);
    return { fee, net, margin, roi, breakEvenPrice };
  }, [price, cost, shipping, commission, ads]);

  const f = (n: number) => `$${n.toFixed(2)}`;
  const inputs: [string, number, (v: number) => void][] = [
    ["Selling price (USD)", price, setPrice],
    ["Product cost", cost, setCost],
    ["Shipping cost", shipping, setShipping],
    ["TikTok commission (%)", commission, setCommission],
    ["Ad spend per unit", ads, setAds],
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        Demo mode — TikTok Shop fees vary by region. Typical commission: US 5–8%, UK 5%, SEA 1–5%.
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {inputs.map(([label, val, set]) => (
          <div key={label}><Label>{label}</Label><Input type="number" step="0.01" value={val} onChange={(e) => set(+e.target.value || 0)} className="mt-1"/></div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="TikTok fee" value={f(r.fee)}/>
        <Stat label="Net profit / unit" value={f(r.net)} highlight={r.net >= 0 ? "pos" : "neg"}/>
        <Stat label="Profit margin" value={`${r.margin.toFixed(1)}%`}/>
        <Stat label="ROI" value={`${r.roi.toFixed(1)}%`}/>
        <Stat label="Break-even price" value={f(r.breakEvenPrice)}/>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: "pos" | "neg" }) {
  const color = highlight === "pos" ? "text-emerald-500" : highlight === "neg" ? "text-destructive" : "";
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}