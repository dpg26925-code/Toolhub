import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Calculator } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ForexPipCalculator() {
  const [pair, setPair] = useState("EURUSD");
  const [lots, setLots] = useState(1);
  const [pips, setPips] = useState(20);
  const [quote, setQuote] = useState(1.1);
  const [copied, setCopied] = useState(false);

  const r = useMemo(() => {
    const isJpy = pair.endsWith("JPY");
    const pipSize = isJpy ? 0.01 : 0.0001;
    const unitsPerLot = 100000;
    const pipValueUsd = (pipSize * unitsPerLot * lots) / (isJpy ? quote : 1);
    const total = pipValueUsd * pips;
    return { pipValueUsd, total };
  }, [pair, lots, pips, quote]);

  const handleCopy = async () => {
    const summary = `=== Forex Pip Value Calculation ===
Currency Pair: ${pair}
Position Size: ${lots} lot(s)
Pips Gained/Lost: ${pips} pips
Exchange Rate: ${quote}
---------------------------------
Pip Value per Lot: $${r.pipValueUsd.toFixed(2)}
Total Pip Profit / Loss: $${r.total.toFixed(2)}`;

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Pip calculation copied to clipboard!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Result Banner */}
      <div className="rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Pip Gain / Value
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-brand sm:text-5xl">
                ${r.total.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                USD
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Pip value for <strong>{lots} lot(s)</strong> = <strong>${r.pipValueUsd.toFixed(2)} / pip</strong>
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleCopy}
            className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy Pip Value
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-brand" />
            Pip Calculator Parameters
          </Label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Currency Pair</Label>
            <Select value={pair} onValueChange={setPair}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "EURJPY", "NZDUSD", "USDCHF"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lots" className="text-xs font-semibold">Lots (1 lot = 100,000 units)</Label>
            <Input id="lots" type="number" step="0.01" value={lots} onChange={(e) => setLots(+e.target.value || 0)} className="font-mono text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pips" className="text-xs font-semibold">Pips Count</Label>
            <Input id="pips" type="number" value={pips} onChange={(e) => setPips(+e.target.value || 0)} className="font-mono text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote" className="text-xs font-semibold">Current Exchange Rate</Label>
            <Input id="quote" type="number" step="0.0001" value={quote} onChange={(e) => setQuote(+e.target.value || 0)} className="font-mono text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}