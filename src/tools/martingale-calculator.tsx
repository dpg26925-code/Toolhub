import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDecimal, DISCLAIMER, type OddsFormat } from "./_betting";

export default function MartingaleCalculator() {
  const [format, setFormat] = useState<OddsFormat>("decimal");
  const [odds, setOdds] = useState("2.00");
  const [base, setBase] = useState(10);
  const [maxLosses, setMaxLosses] = useState(8);

  const decimal = toDecimal(odds, format);
  const profitPerWin = Number.isFinite(decimal) && decimal > 1 ? decimal - 1 : NaN;

  const rows = useMemo(() => {
    if (!Number.isFinite(profitPerWin) || profitPerWin <= 0) return [];
    const out: { step: number; bet: number; cumLoss: number; winPayout: number; netIfWin: number }[] = [];
    let cum = 0; let bet = base;
    for (let i = 1; i <= maxLosses; i++) {
      bet = (cum + base) / profitPerWin;
      const winPayout = bet * decimal;
      out.push({ step: i, bet, cumLoss: cum + bet, winPayout, netIfWin: winPayout - (cum + bet) });
      cum += bet;
    }
    return out;
  }, [profitPerWin, base, maxLosses, decimal]);

  const bankroll = rows.length ? rows[rows.length - 1].cumLoss : 0;
  const bustProb = Number.isFinite(decimal) && decimal > 1 ? Math.pow(1 - 1 / decimal, maxLosses) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <Label>Odds format</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={format} onChange={(e) => setFormat(e.target.value as OddsFormat)}>
            <option value="american">American</option>
            <option value="fractional">Fractional</option>
            <option value="decimal">Decimal</option>
          </select>
        </div>
        <div><Label htmlFor="o">Odds</Label><Input id="o" value={odds} onChange={(e) => setOdds(e.target.value)} /></div>
        <div><Label htmlFor="b">Base bet ($)</Label><Input id="b" type="number" min={0} value={base} onChange={(e) => setBase(Math.max(0, Number(e.target.value) || 0))} /></div>
        <div><Label htmlFor="m">Max losing streak</Label><Input id="m" type="number" min={1} max={20} value={maxLosses} onChange={(e) => setMaxLosses(Math.min(20, Math.max(1, Number(e.target.value) || 1)))} /></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Required bankroll" value={`$${bankroll.toFixed(2)}`} accent />
        <Stat label="Target profit per cycle" value={`$${base.toFixed(2)}`} />
        <Stat label={`Bust probability (${maxLosses} losses)`} value={`${(bustProb * 100).toFixed(3)}%`} />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Step</th>
              <th className="px-3 py-2 text-right">Bet</th>
              <th className="px-3 py-2 text-right">Cumulative loss if lost</th>
              <th className="px-3 py-2 text-right">Payout if won</th>
              <th className="px-3 py-2 text-right">Net if won</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.step} className="border-t">
                <td className="px-3 py-2 font-mono">{r.step}</td>
                <td className="px-3 py-2 text-right font-mono">${r.bet.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-mono text-destructive">${r.cumLoss.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-mono">${r.winPayout.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-mono text-primary">+${r.netIfWin.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <p className="font-semibold text-destructive">Risk warning</p>
        <p className="mt-1 text-muted-foreground">Martingale exponentially increases bet size. A long losing streak — statistically inevitable given enough time — can wipe out your entire bankroll or hit the table limit. {DISCLAIMER}</p>
      </div>
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