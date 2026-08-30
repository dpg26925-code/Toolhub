import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Calculator, Sparkles, TrendingUp } from "lucide-react";

export default function TikTokShopProfitCalculator() {
  const [price, setPrice] = useState(29.99);
  const [cost, setCost] = useState(8.0);
  const [shipping, setShipping] = useState(3.0);
  const [commission, setCommission] = useState(6.0);
  const [ads, setAds] = useState(2.5);
  const [copied, setCopied] = useState(false);

  const r = useMemo(() => {
    const fee = (price * commission) / 100;
    const net = price - cost - shipping - fee - ads;
    const margin = price > 0 ? (net / price) * 100 : 0;
    const roi = cost + ads > 0 ? (net / (cost + ads)) * 100 : 0;
    const breakEvenPrice = (cost + shipping + ads) / (1 - commission / 100 || 1);
    return { fee, net, margin, roi, breakEvenPrice };
  }, [price, cost, shipping, commission, ads]);

  const f = (n: number) => `$${n.toFixed(2)}`;

  const handleCopy = async () => {
    const summary = `=== TikTok Shop Profit Calculation ===
Selling Price: ${f(price)}
Product Cost: ${f(cost)}
Shipping: ${f(shipping)}
Platform Commission: ${commission}% (${f(r.fee)})
Ad Spend / Unit: ${f(ads)}
---------------------------------
Net Profit per Unit: ${f(r.net)}
Profit Margin: ${r.margin.toFixed(1)}%
Return on Investment (ROI): ${r.roi.toFixed(1)}%
Break-Even Selling Price: ${f(r.breakEvenPrice)}`;

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Profit breakdown copied to clipboard!");
    setTimeout(() => setCopied(false), 1500);
  };

  const setPreset = (p: number, c: number, s: number, comm: number, a: number) => {
    setPrice(p);
    setCost(c);
    setShipping(s);
    setCommission(comm);
    setAds(a);
    toast.info("Preset loaded");
  };

  return (
    <div className="space-y-6">
      {/* Result Card */}
      <div className="rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Profit Per Unit
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold ${r.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                {f(r.net)}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                ({r.margin.toFixed(1)}% margin)
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              ROI: <strong>{r.roi.toFixed(1)}%</strong> · Break-even: <strong>{f(r.breakEvenPrice)}</strong>
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
                Copy Profit Breakdown
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-brand" />
            Cost & Revenue Inputs
          </Label>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Presets:</span>
            <Button size="xs" variant="outline" onClick={() => setPreset(19.99, 4.5, 2.5, 6, 1.5)} className="text-xs h-7">
              Beauty & Care
            </Button>
            <Button size="xs" variant="outline" onClick={() => setPreset(39.99, 12, 4, 6, 4)} className="text-xs h-7">
              Fashion & Apparel
            </Button>
            <Button size="xs" variant="outline" onClick={() => setPreset(49.99, 15, 3.5, 6, 5)} className="text-xs h-7">
              Gadgets & Home
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="tt-price" className="text-xs font-semibold">Selling Price ($)</Label>
            <Input id="tt-price" type="number" step="0.01" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="font-mono text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tt-cost" className="text-xs font-semibold">Product Manufacturing Cost ($)</Label>
            <Input id="tt-cost" type="number" step="0.01" value={cost} onChange={(e) => setCost(+e.target.value || 0)} className="font-mono text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tt-shipping" className="text-xs font-semibold">Shipping / Packaging Cost ($)</Label>
            <Input id="tt-shipping" type="number" step="0.01" value={shipping} onChange={(e) => setShipping(+e.target.value || 0)} className="font-mono text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tt-commission" className="text-xs font-semibold">TikTok Shop Fee (%)</Label>
            <Input id="tt-commission" type="number" step="0.1" value={commission} onChange={(e) => setCommission(+e.target.value || 0)} className="font-mono text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tt-ads" className="text-xs font-semibold">Ad Spend / Affiliate per Unit ($)</Label>
            <Input id="tt-ads" type="number" step="0.01" value={ads} onChange={(e) => setAds(+e.target.value || 0)} className="font-mono text-sm" />
          </div>
        </div>

        {/* Breakdown summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-muted/40 p-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">TikTok Fee</span>
            <span className="text-base font-bold text-foreground mt-0.5 block">{f(r.fee)}</span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">Profit Margin</span>
            <span className="text-base font-bold text-brand mt-0.5 block">{r.margin.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">Return on Spend</span>
            <span className="text-base font-bold text-foreground mt-0.5 block">{r.roi.toFixed(1)}% ROI</span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">Break-even Min Price</span>
            <span className="text-base font-bold text-foreground mt-0.5 block">{f(r.breakEvenPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}