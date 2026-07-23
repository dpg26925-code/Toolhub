import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CARRIERS = [
  { name: "DHL Express", perKg: 15, base: 25, days: 3, dim: 5000 },
  { name: "FedEx Priority", perKg: 14, base: 28, days: 3, dim: 5000 },
  { name: "UPS Worldwide", perKg: 13, base: 26, days: 4, dim: 5000 },
  { name: "EMS", perKg: 8, base: 15, days: 7, dim: 6000 },
  { name: "USPS Priority Int'l", perKg: 10, base: 20, days: 10, dim: 6000 },
];

export default function Tool() {
  const [w, setW] = useState(2);
  const [L, setL] = useState(30);
  const [W, setWi] = useState(20);
  const [H, setH] = useState(15);

  const rows = useMemo(() => {
    return CARRIERS.map((c) => {
      const dim = (L * W * H) / c.dim;
      const chargeable = Math.max(w, dim);
      const cost = c.base + chargeable * c.perKg;
      return { ...c, chargeable, cost };
    }).sort((a, b) => a.cost - b.cost);
  }, [w, L, W, H]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Demo rates — Real carrier quotes depend on account, zone and fuel surcharges.</div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Weight (kg)</Label><Input type="number" step="0.1" value={w} onChange={(e) => setW(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Length (cm)</Label><Input type="number" value={L} onChange={(e) => setL(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Width (cm)</Label><Input type="number" value={W} onChange={(e) => setWi(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Height (cm)</Label><Input type="number" value={H} onChange={(e) => setH(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-2 text-left">Carrier</th><th className="p-2 text-right">Chargeable</th><th className="p-2 text-right">Days</th><th className="p-2 text-right">Cost</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={r.name} className={`border-t ${i === 0 ? "bg-emerald-500/5" : ""}`}>
              <td className="p-2 font-medium">{r.name}{i === 0 && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-500">CHEAPEST</span>}</td>
              <td className="p-2 text-right">{r.chargeable.toFixed(1)} kg</td>
              <td className="p-2 text-right">{r.days}</td>
              <td className="p-2 text-right font-semibold">${r.cost.toFixed(2)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}