import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDecimal, fromDecimal, impliedProbability, payout, DISCLAIMER, type OddsFormat } from "./_betting";

export default function OddsCalculator() {
  const [format, setFormat] = useState<OddsFormat>("american");
  const [odds, setOdds] = useState<string>("+150");
  const [stake, setStake] = useState<number>(100);

  const decimal = useMemo(() => toDecimal(odds, format), [odds, format]);
  const prob = impliedProbability(decimal);
  const { total, profit } = payout(stake, decimal);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Odds format</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={format} onChange={(e) => setFormat(e.target.value as OddsFormat)}>
            <option value="american">American (+150)</option>
            <option value="fractional">Fractional (3/2)</option>
            <option value="decimal">Decimal (2.50)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="odds">Odds</Label>
          <Input id="odds" value={odds} onChange={(e) => setOdds(e.target.value)} placeholder={format === "american" ? "+150" : format === "fractional" ? "3/2" : "2.50"} />
        </div>
        <div>
          <Label htmlFor="stake">Stake ($)</Label>
          <Input id="stake" type="number" min={0} value={stake} onChange={(e) => setStake(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Implied probability" value={`${(prob * 100).toFixed(2)}%`} accent />
        <Stat label="Potential payout" value={`$${total.toFixed(2)}`} />
        <Stat label="Profit" value={`$${profit.toFixed(2)}`} />
        <Stat label="Decimal odds" value={Number.isFinite(decimal) ? decimal.toFixed(3) : "—"} />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-sm font-semibold">Converted odds</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
          <Row k="American" v={fromDecimal(decimal, "american")} />
          <Row k="Fractional" v={fromDecimal(decimal, "fractional")} />
          <Row k="Decimal" v={fromDecimal(decimal, "decimal")} />
        </div>
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
      <span className="text-muted-foreground">{k}</span><span className="font-mono font-semibold">{v}</span>
    </div>
  );
}