import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDecimal, DISCLAIMER, type OddsFormat } from "./_betting";

export default function BettingBankrollManager() {
  const [bankroll, setBankroll] = useState(1000);
  const [riskPct, setRiskPct] = useState(2);
  const [unitPct, setUnitPct] = useState(1);
  const [format, setFormat] = useState<OddsFormat>("decimal");
  const [odds, setOdds] = useState("2.00");
  const [winProb, setWinProb] = useState(52);
  const [nBets, setNBets] = useState(100);

  const decimal = toDecimal(odds, format);
  const b = Number.isFinite(decimal) && decimal > 1 ? decimal - 1 : NaN;
  const p = Math.max(0, Math.min(1, winProb / 100));
  const q = 1 - p;
  const kelly = Number.isFinite(b) && b > 0 ? (b * p - q) / b : NaN;
  const kellyFraction = Number.isFinite(kelly) ? Math.max(0, kelly) : 0;
  const kellyBet = bankroll * kellyFraction;
  const halfKellyBet = kellyBet / 2;

  const recBet = bankroll * (riskPct / 100);
  const unit = bankroll * (unitPct / 100);
  const maxBet = bankroll * 0.05;

  const projection = useMemo(() => {
    if (!Number.isFinite(decimal) || decimal <= 1) return [];
    const edge = p * (decimal - 1) - q;
    const bets = Math.max(1, Math.min(2000, nBets));
    const out: { n: number; ev: number; kellyGrowth: number }[] = [];
    for (let i = 0; i <= 10; i++) {
      const n = Math.round((bets * i) / 10);
      const ev = bankroll + recBet * edge * n;
      const f = kellyFraction;
      const g = f > 0 ? p * Math.log(1 + b * f) + q * Math.log(Math.max(1e-9, 1 - f)) : 0;
      const kellyGrowth = bankroll * Math.exp(g * n);
      out.push({ n, ev, kellyGrowth });
    }
    return out;
  }, [decimal, p, q, b, kellyFraction, bankroll, recBet, nBets]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label htmlFor="br">Bankroll ($)</Label><Input id="br" type="number" min={0} value={bankroll} onChange={(e) => setBankroll(Math.max(0, Number(e.target.value) || 0))} /></div>
        <div><Label htmlFor="rp">Risk per bet (%)</Label><Input id="rp" type="number" min={0} max={100} step={0.1} value={riskPct} onChange={(e) => setRiskPct(Math.max(0, Number(e.target.value) || 0))} /></div>
        <div><Label htmlFor="up">Unit size (%)</Label><Input id="up" type="number" min={0} max={100} step={0.1} value={unitPct} onChange={(e) => setUnitPct(Math.max(0, Number(e.target.value) || 0))} /></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <Label>Odds format</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={format} onChange={(e) => setFormat(e.target.value as OddsFormat)}>
            <option value="american">American</option><option value="fractional">Fractional</option><option value="decimal">Decimal</option>
          </select>
        </div>
        <div><Label htmlFor="o">Odds</Label><Input id="o" value={odds} onChange={(e) => setOdds(e.target.value)} /></div>
        <div><Label htmlFor="wp">Your win probability (%)</Label><Input id="wp" type="number" min={0} max={100} step={0.1} value={winProb} onChange={(e) => setWinProb(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} /></div>
        <div><Label htmlFor="nb">Projection (bets)</Label><Input id="nb" type="number" min={1} max={2000} value={nBets} onChange={(e) => setNBets(Math.max(1, Math.min(2000, Number(e.target.value) || 1)))} /></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Recommended bet" value={`$${recBet.toFixed(2)}`} accent />
        <Stat label="1 unit" value={`$${unit.toFixed(2)}`} />
        <Stat label="Max bet (5%)" value={`$${maxBet.toFixed(2)}`} />
        <Stat label="Full Kelly" value={`$${kellyBet.toFixed(2)}`} sub={`${(kellyFraction * 100).toFixed(2)}%`} />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Kelly Criterion</h3>
          <span className="text-xs text-muted-foreground">f* = (bp − q) / b</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
          <Row k="Full Kelly bet" v={`$${kellyBet.toFixed(2)}`} />
          <Row k="Half Kelly (safer)" v={`$${halfKellyBet.toFixed(2)}`} />
          <Row k="Edge per $ staked" v={Number.isFinite(decimal) ? `${((p * (decimal - 1) - q) * 100).toFixed(2)}%` : "—"} />
        </div>
        {kellyFraction === 0 && Number.isFinite(decimal) && (
          <p className="mt-3 text-xs text-destructive">No positive edge at these odds — Kelly recommends not betting.</p>
        )}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
            <tr><th className="px-3 py-2 text-left">After N bets</th><th className="px-3 py-2 text-right">Flat staking EV</th><th className="px-3 py-2 text-right">Kelly growth</th></tr>
          </thead>
          <tbody>
            {projection.map((r) => (
              <tr key={r.n} className="border-t">
                <td className="px-3 py-2 font-mono">{r.n}</td>
                <td className="px-3 py-2 text-right font-mono">${r.ev.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-mono">${r.kellyGrowth.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">For entertainment. Not financial advice. {DISCLAIMER}</p>
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? "bg-primary/10 border-primary/30" : "bg-background"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
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