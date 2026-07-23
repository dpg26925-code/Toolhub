import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toDecimal, fromDecimal, impliedProbability, payout, DISCLAIMER, type OddsFormat } from "./_betting";

type Leg = { id: string; label: string; odds: string };
const rid = () => Math.random().toString(36).slice(2, 9);

export default function ParlayCalculator() {
  const [format, setFormat] = useState<OddsFormat>("american");
  const [stake, setStake] = useState<number>(100);
  const [legs, setLegs] = useState<Leg[]>([
    { id: rid(), label: "Leg 1", odds: "+150" },
    { id: rid(), label: "Leg 2", odds: "-110" },
    { id: rid(), label: "Leg 3", odds: "+200" },
  ]);

  const per = legs.map((l) => toDecimal(l.odds, format));
  const combined = useMemo(
    () => per.every((d) => Number.isFinite(d) && d > 1) ? per.reduce((a, b) => a * b, 1) : NaN,
    [per],
  );
  const prob = impliedProbability(combined);
  const { total, profit } = payout(stake, combined);

  const add = () => { if (legs.length < 10) setLegs([...legs, { id: rid(), label: `Leg ${legs.length + 1}`, odds: "+100" }]); };
  const remove = (id: string) => setLegs((ls) => ls.length > 1 ? ls.filter((l) => l.id !== id) : ls);
  const update = (id: string, patch: Partial<Leg>) => setLegs((ls) => ls.map((l) => l.id === id ? { ...l, ...patch } : l));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Odds format</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={format} onChange={(e) => setFormat(e.target.value as OddsFormat)}>
            <option value="american">American</option>
            <option value="fractional">Fractional</option>
            <option value="decimal">Decimal</option>
          </select>
        </div>
        <div>
          <Label htmlFor="stake">Stake ($)</Label>
          <Input id="stake" type="number" min={0} value={stake} onChange={(e) => setStake(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <div className="space-y-2">
        {legs.map((l, i) => {
          const d = per[i];
          const ok = Number.isFinite(d) && d > 1;
          return (
            <div key={l.id} className="grid grid-cols-12 items-center gap-2 rounded-lg border bg-card p-3">
              <Input className="col-span-5" value={l.label} onChange={(e) => update(l.id, { label: e.target.value })} />
              <Input className="col-span-3" value={l.odds} onChange={(e) => update(l.id, { odds: e.target.value })} placeholder={format === "american" ? "+150" : format === "fractional" ? "3/2" : "2.50"} />
              <div className="col-span-3 text-right font-mono text-sm">{ok ? `${d.toFixed(3)} · ${(impliedProbability(d) * 100).toFixed(1)}%` : "—"}</div>
              <Button className="col-span-1" size="sm" variant="ghost" onClick={() => remove(l.id)} disabled={legs.length <= 1}>×</Button>
            </div>
          );
        })}
        <Button variant="outline" size="sm" onClick={add} disabled={legs.length >= 10}>+ Add leg ({legs.length}/10)</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Combined odds" value={fromDecimal(combined, format)} accent />
        <Stat label="Implied probability" value={`${(prob * 100).toFixed(2)}%`} />
        <Stat label="Potential payout" value={`$${total.toFixed(2)}`} />
        <Stat label="Profit" value={`$${profit.toFixed(2)}`} />
      </div>

      <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? "bg-primary/10 border-primary/30" : "bg-background"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}