import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, Calculator, ShieldCheck, ArrowRightLeft } from "lucide-react";
import {
  PAIRS,
  LOT_UNITS,
  LotType,
  pipSize,
  pipValueUSD,
  priceDiffPips,
  fmt,
} from "./_trading";

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
    }
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const res = document.execCommand("copy");
    document.body.removeChild(textArea);
    return res;
  } catch {
    return false;
  }
}

export default function PositionSizeCalculator() {
  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [pair, setPair] = useState("EUR/USD");
  const [entry, setEntry] = useState(1.10000);
  const [sl, setSl] = useState(1.09500);
  const [lotType, setLotType] = useState<LotType>("standard");
  const [copied, setCopied] = useState<string | null>(null);

  const calc = useMemo(() => {
    const riskUSD = (balance * riskPct) / 100;
    const pips = priceDiffPips(pair, entry, sl);
    const pv1lot = pipValueUSD(pair, LOT_UNITS[lotType], entry);
    const lots = pips > 0 && pv1lot > 0 ? riskUSD / (pips * pv1lot) : 0;
    const units = lots * LOT_UNITS[lotType];
    return { riskUSD, pips, pv1lot, lots, units };
  }, [balance, riskPct, pair, entry, sl, lotType]);

  const summary = `=== Trade Position Sizing ===
Currency Pair: ${pair}
Account Balance: $${fmt(balance)}
Risk: $${fmt(calc.riskUSD)} (${riskPct}%)
Entry Price: ${entry}
Stop Loss: ${sl}
Stop Distance: ${fmt(calc.pips, 1)} pips
Recommended Position Size: ${fmt(calc.lots, 2)} ${lotType} lots (${fmt(calc.units, 0)} units)
Pip Value / Lot: $${fmt(calc.pv1lot, 2)}`;

  const handleCopySummary = async () => {
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied("summary");
      toast.success("Trade summary copied to clipboard!");
      setTimeout(() => setCopied(null), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleCopyLot = async () => {
    const ok = await copyToClipboard(fmt(calc.lots, 2));
    if (ok) {
      setCopied("lot");
      toast.success(`Lot size ${fmt(calc.lots, 2)} copied!`);
      setTimeout(() => setCopied(null), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Calculated Output Banner */}
      <div className="rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recommended Position Size
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-brand sm:text-5xl">
                {fmt(calc.lots, 2)}
              </span>
              <span className="text-lg font-semibold text-foreground">
                {lotType} lots
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Equivalent to <strong>{fmt(calc.units, 0)}</strong> units · Risking <strong>${fmt(calc.riskUSD)}</strong> ({riskPct}%)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleCopyLot}
              className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
            >
              {copied === "lot" ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                  Copied Lot!
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy Lot Size
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopySummary}
            >
              {copied === "summary" ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                  Copied Details!
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy Trade Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Input Parameters Form */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-brand" />
            Trade Parameters
          </Label>
          <span className="text-xs text-muted-foreground">Auto-updates calculations in real time</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Balance */}
          <div className="space-y-1.5">
            <Label htmlFor="account-balance" className="text-xs font-semibold">
              Account Balance ($)
            </Label>
            <Input
              id="account-balance"
              type="number"
              min={1}
              value={balance}
              onChange={(e) => setBalance(Math.max(0, +e.target.value))}
              className="font-mono text-sm"
            />
          </div>

          {/* Risk Percentage */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label htmlFor="risk-pct" className="text-xs font-semibold">
                Risk Percentage (%)
              </Label>
              <span className="text-xs font-bold text-brand">${fmt(calc.riskUSD)}</span>
            </div>
            <div className="flex gap-1.5">
              <Input
                id="risk-pct"
                type="number"
                step="0.1"
                min={0.1}
                max={100}
                value={riskPct}
                onChange={(e) => setRiskPct(Math.max(0, +e.target.value))}
                className="font-mono text-sm w-24"
              />
              {[0.5, 1, 2, 3, 5].map((p) => (
                <Button
                  key={p}
                  size="xs"
                  variant={riskPct === p ? "default" : "outline"}
                  onClick={() => setRiskPct(p)}
                  className="flex-1 text-xs"
                >
                  {p}%
                </Button>
              ))}
            </div>
          </div>

          {/* Currency Pair */}
          <div className="space-y-1.5">
            <Label htmlFor="pair-select" className="text-xs font-semibold">
              Currency Pair
            </Label>
            <select
              id="pair-select"
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-ring"
            >
              {PAIRS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Entry Price */}
          <div className="space-y-1.5">
            <Label htmlFor="entry-price" className="text-xs font-semibold">
              Entry Price
            </Label>
            <Input
              id="entry-price"
              type="number"
              step="0.00001"
              value={entry}
              onChange={(e) => setEntry(+e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Stop Loss Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label htmlFor="sl-price" className="text-xs font-semibold">
                Stop Loss Price
              </Label>
              <span className="text-xs font-medium text-muted-foreground">
                Distance: {fmt(calc.pips, 1)} pips
              </span>
            </div>
            <Input
              id="sl-price"
              type="number"
              step="0.00001"
              value={sl}
              onChange={(e) => setSl(+e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Lot Type */}
          <div className="space-y-1.5">
            <Label htmlFor="lot-type" className="text-xs font-semibold">
              Contract / Lot Unit
            </Label>
            <select
              id="lot-type"
              value={lotType}
              onChange={(e) => setLotType(e.target.value as LotType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-ring"
            >
              <option value="standard">Standard (100,000 units)</option>
              <option value="mini">Mini (10,000 units)</option>
              <option value="micro">Micro (1,000 units)</option>
            </select>
          </div>
        </div>

        {/* Detailed Trade Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-muted/40 p-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
              Max Risk
            </span>
            <span className="text-base font-bold text-foreground mt-0.5 block">
              ${fmt(calc.riskUSD)}
            </span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
              Stop Distance
            </span>
            <span className="text-base font-bold text-foreground mt-0.5 block">
              {fmt(calc.pips, 1)} pips
            </span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
              Pip Value / Lot
            </span>
            <span className="text-base font-bold text-foreground mt-0.5 block">
              ${fmt(calc.pv1lot, 2)}
            </span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
              Total Units
            </span>
            <span className="text-base font-bold text-brand mt-0.5 block">
              {fmt(calc.units, 0)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            Formula: <code>Position Lots = Risk ($) / (Stop Loss Pips × Pip Value per Lot)</code>
          </span>
        </div>
      </div>
    </div>
  );
}