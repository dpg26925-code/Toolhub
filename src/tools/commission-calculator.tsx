import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { name: "Amazon Associates", rate: 4 },
  { name: "ClickBank", rate: 50 },
  { name: "ShareASale", rate: 20 },
  { name: "Impact", rate: 15 },
];

function fmt(n: number) { return `$${n.toFixed(2)}`; }

export default function CommissionCalculator() {
  const [sale, setSale] = useState("100");
  const [rate, setRate] = useState("10");
  const [bonus, setBonus] = useState("0");

  const saleN = parseFloat(sale) || 0;
  const rateN = parseFloat(rate) || 0;
  const bonusN = parseFloat(bonus) || 0;

  const commission = saleN * (rateN / 100);
  const total = commission + bonusN;
  const effective = saleN > 0 ? (total / saleN) * 100 : 0;

  const table = useMemo(() => {
    const bases = [10, 50, 100, 250, 500, 1000, 2500];
    return bases.map((b) => ({ sale: b, commission: b * (rateN / 100), net: b * (rateN / 100) + bonusN }));
  }, [rateN, bonusN]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.name} size="sm" variant="outline" onClick={() => setRate(String(p.rate))}>
            {p.name} ({p.rate}%)
          </Button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Sale value ($)</Label><Input type="number" value={sale} onChange={(e) => setSale(e.target.value)} className="mt-1" /></div>
        <div><Label>Commission rate (%)</Label><Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1" /></div>
        <div><Label>Fixed bonus ($)</Label><Input type="number" value={bonus} onChange={(e) => setBonus(e.target.value)} className="mt-1" /></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">Commission</div><div className="mt-1 text-2xl font-bold">{fmt(commission)}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">Total earnings</div><div className="mt-1 text-2xl font-bold text-primary">{fmt(total)}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">Effective rate</div><div className="mt-1 text-2xl font-bold">{effective.toFixed(1)}%</div></div>
      </div>

      <div>
        <Label>Sale value → Commission table</Label>
        <div className="mt-2 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr><th className="p-2">Sale</th><th className="p-2">Commission</th><th className="p-2">Net (with bonus)</th></tr></thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.sale} className="border-t">
                  <td className="p-2 font-mono">${row.sale}</td>
                  <td className="p-2 font-mono">{fmt(row.commission)}</td>
                  <td className="p-2 font-mono font-semibold">{fmt(row.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}