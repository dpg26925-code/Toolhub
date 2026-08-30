import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Calculator, TrendingUp } from "lucide-react";

export default function ShopeeProfitCalculator() {
  const [cost, setCost] = useState(50);
  const [price, setPrice] = useState(120);
  const [commission, setCommission] = useState(6);
  const [shipping, setShipping] = useState(10);
  const [ads, setAds] = useState(5);
  const [cod, setCod] = useState(2);
  const [copied, setCopied] = useState(false);

  const r = useMemo(() => {
    const commFee = (price * commission) / 100;
    const codFee = (price * cod) / 100;
    const totalFees = commFee + shipping + ads + codFee;
    const net = price - cost - totalFees;
    const margin = price > 0 ? (net / price) * 100 : 0;
    const beMargin = 15;
    const bePrice = (cost + shipping + ads) / (1 - (commission + cod + beMargin) / 100 || 1);
    return { commFee, codFee, totalFees, net, margin, bePrice };
  }, [cost, price, commission, shipping, ads, cod]);

  const scenarios = [-20, -10, 0, 10, 20].map((delta) => {
    const p = price * (1 + delta / 100);
    const commFee = (p * commission) / 100;
    const codFee = (p * cod) / 100;
    return { delta, price: p, net: p - cost - commFee - shipping - ads - codFee };
  });

  const handleCopy = async () => {
    const summary = `=== Shopee Profit Calculation ===
Selling Price: $${price.toFixed(2)}
Product Cost: $${cost.toFixed(2)}
Total Fees (Commission + Shipping + Ads + COD): $${r.totalFees.toFixed(2)}
---------------------------------
Net Profit: $${r.net.toFixed(2)}
Profit Margin: ${r.margin.toFixed(1)}%
Target 15% Margin Price: $${r.bePrice.toFixed(2)}`;

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Shopee profit summary copied to clipboard!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Profit Output Banner */}
      <div className="rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Estimated Net Profit
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold ${r.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                ${r.net.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                ({r.margin.toFixed(1)}% margin)
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Total Platform & Marketing Fees: <strong>${r.totalFees.toFixed(2)}</strong>
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
                Copy Breakdown
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-brand" />
            Shopee Cost & Commission Parameters
          </Label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="sp-cost" className="text-xs font-semibold">Product Cost ($)</Label>
            <Input id="sp-cost" type="number" step="0.1" value={cost} onChange={(e) => setCost(+e.target.value || 0)} className="font-mono text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-price" className="text-xs font-semibold">Selling Price ($)</Label>
            <Input id="sp-price" type="number" step="0.1" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="font-mono text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-comm" className="text-xs font-semibold">Shopee Commission (%)</Label>
            <Input id="sp-comm" type="number" step="0.1" value={commission} onChange={(e) => setCommission(+e.target.value || 0)} className="font-mono text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-ship" className="text-xs font-semibold">Seller Shipping Cost ($)</Label>
            <Input id="sp-ship" type="number" step="0.1" value={shipping} onChange={(e) => setShipping(+e.target.value || 0)} className="font-mono text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-ads" className="text-xs font-semibold">Shopee Ads / Marketing ($)</Label>
            <Input id="sp-ads" type="number" step="0.1" value={ads} onChange={(e) => setAds(+e.target.value || 0)} className="font-mono text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-cod" className="text-xs font-semibold">Payment / COD Fee (%)</Label>
            <Input id="sp-cod" type="number" step="0.1" value={cod} onChange={(e) => setCod(+e.target.value || 0)} className="font-mono text-sm" />
          </div>
        </div>

        {/* Pricing Scenarios */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-brand" />
            Price Sensitivity Simulation
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-1.5">Price Adjustment</th>
                <th className="text-right py-1.5">Adjusted Price</th>
                <th className="text-right py-1.5">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.delta} className="border-b border-border/50 font-mono">
                  <td className="py-2">{s.delta > 0 ? `+${s.delta}%` : `${s.delta}%`}</td>
                  <td className="text-right py-2">${s.price.toFixed(2)}</td>
                  <td className={`text-right py-2 font-bold ${s.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                    ${s.net.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}