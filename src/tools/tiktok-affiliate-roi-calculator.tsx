import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [views, setViews] = useState(100000);
  const [ctr, setCtr] = useState(2);
  const [cvr, setCvr] = useState(3);
  const [aov, setAov] = useState(30);
  const [comm, setComm] = useState(10);
  const [cost, setCost] = useState(50);

  const r = useMemo(() => {
    const clicks = views * (ctr / 100);
    const sales = clicks * (cvr / 100);
    const revenue = sales * aov;
    const earn = revenue * (comm / 100);
    const roi = cost > 0 ? ((earn - cost) / cost) * 100 : 0;
    const beViews = comm > 0 && ctr > 0 && cvr > 0 && aov > 0 ? cost / (aov * (comm / 100) * (cvr / 100) * (ctr / 100)) : Infinity;
    return { clicks, sales, revenue, earn, roi, beViews };
  }, [views, ctr, cvr, aov, comm, cost]);

  const inputs: [string, number, (v: number) => void, string?][] = [
    ["Video views", views, setViews],
    ["Click-through rate (%)", ctr, setCtr, "0.1"],
    ["Conversion rate (%)", cvr, setCvr, "0.1"],
    ["Avg order value ($)", aov, setAov],
    ["Commission (%)", comm, setComm, "0.1"],
    ["Your cost ($, ads/samples)", cost, setCost],
  ];

  const scenarios = [1, 2, 3, 5].map((c) => ({ cvr: c, earn: views * (ctr / 100) * (c / 100) * aov * (comm / 100) }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {inputs.map(([label, val, set, step]) => (
          <div key={label}><Label>{label}</Label><Input type="number" step={step ?? "1"} value={val} onChange={(e) => set(+e.target.value || 0)} className="mt-1"/></div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Clicks" value={r.clicks.toLocaleString(undefined, { maximumFractionDigits: 0 })}/>
        <Stat label="Sales" value={r.sales.toFixed(0)}/>
        <Stat label="Revenue" value={`$${r.revenue.toFixed(2)}`}/>
        <Stat label="Your earnings" value={`$${r.earn.toFixed(2)}`} highlight/>
        <Stat label="ROI" value={`${r.roi.toFixed(1)}%`}/>
        <Stat label="Break-even views" value={isFinite(r.beViews) ? r.beViews.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—"}/>
      </div>
      <div className="rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Earnings by CVR scenario</h3>
        <table className="mt-2 w-full text-sm"><thead><tr><th className="text-left">CVR</th><th className="text-right">Earnings</th></tr></thead>
          <tbody>{scenarios.map((s) => <tr key={s.cvr} className="border-t"><td>{s.cvr}%</td><td className="text-right">${s.earn.toFixed(2)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}