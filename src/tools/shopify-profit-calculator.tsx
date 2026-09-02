import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, ShoppingBag, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

const SHOPIFY_PLANS = [
  { id: "basic", name: "Shopify Basic", monthlyFee: 39, transactionRate: 2.9, fixedFee: 0.3 },
  { id: "shopify", name: "Shopify Standard", monthlyFee: 105, transactionRate: 2.7, fixedFee: 0.3 },
  { id: "advanced", name: "Shopify Advanced", monthlyFee: 399, transactionRate: 2.5, fixedFee: 0.3 },
  { id: "starter", name: "Shopify Starter", monthlyFee: 5, transactionRate: 5.0, fixedFee: 0.3 },
  { id: "custom", name: "Custom Gateway", monthlyFee: 0, transactionRate: 2.9, fixedFee: 0.3 },
];

export default function ShopifyProfitCalculator() {
  const [sellingPrice, setSellingPrice] = useState("49.99");
  const [productCost, setProductCost] = useState("12.50");
  const [shippingCharged, setShippingCharged] = useState("4.99");
  const [shippingActual, setShippingActual] = useState("5.50");
  const [planId, setPlanId] = useState("basic");
  const [gatewayRate, setGatewayRate] = useState("2.9");
  const [gatewayFixed, setGatewayFixed] = useState("0.30");
  const [shopifyMonthly, setShopifyMonthly] = useState("39");
  const [monthlyVolume, setMonthlyVolume] = useState("150");
  const [adSpendPerUnit, setAdSpendPerUnit] = useState("8.00");
  const [monthlyAppsOverhead, setMonthlyAppsOverhead] = useState("30");
  const [copied, setCopied] = useState(false);

  const handlePlanChange = (id: string) => {
    setPlanId(id);
    const selected = SHOPIFY_PLANS.find((p) => p.id === id);
    if (selected) {
      setShopifyMonthly(String(selected.monthlyFee));
      setGatewayRate(String(selected.transactionRate));
      setGatewayFixed(String(selected.fixedFee));
    }
  };

  const pPrice = Math.max(0, parseFloat(sellingPrice) || 0);
  const pCost = Math.max(0, parseFloat(productCost) || 0);
  const pShipCharged = Math.max(0, parseFloat(shippingCharged) || 0);
  const pShipActual = Math.max(0, parseFloat(shippingActual) || 0);
  const pRate = Math.max(0, parseFloat(gatewayRate) || 0);
  const pFixed = Math.max(0, parseFloat(gatewayFixed) || 0);
  const pShopify = Math.max(0, parseFloat(shopifyMonthly) || 0);
  const pVolume = Math.max(1, parseInt(monthlyVolume) || 1);
  const pAds = Math.max(0, parseFloat(adSpendPerUnit) || 0);
  const pApps = Math.max(0, parseFloat(monthlyAppsOverhead) || 0);

  const calc = useMemo(() => {
    // Total charged to customer per order
    const totalOrderValue = pPrice + pShipCharged;

    // Payment Processing Fee per order
    const paymentFee = (totalOrderValue * (pRate / 100)) + pFixed;

    // Fixed monthly overhead per unit
    const fixedOverheadPerUnit = (pShopify + pApps) / pVolume;

    // Gross Profit per unit (Price + Shipping Charged - Cost - Actual Shipping)
    const grossProfitPerUnit = (pPrice + pShipCharged) - (pCost + pShipActual);

    // Net Profit per unit after fees, ads, and allocated overhead
    const netProfitPerUnit = grossProfitPerUnit - paymentFee - pAds - fixedOverheadPerUnit;

    // Margins
    const netMarginPercent = totalOrderValue > 0 ? (netProfitPerUnit / totalOrderValue) * 100 : 0;
    const grossMarginPercent = totalOrderValue > 0 ? (grossProfitPerUnit / totalOrderValue) * 100 : 0;

    // Monthly Totals
    const monthlyRevenue = totalOrderValue * pVolume;
    const monthlyGrossProfit = grossProfitPerUnit * pVolume;
    const monthlyNetProfit = netProfitPerUnit * pVolume;
    const monthlyPaymentFees = paymentFee * pVolume;
    const monthlyTotalAds = pAds * pVolume;
    const monthlyTotalCogs = (pCost + pShipActual) * pVolume;
    const monthlyFixedCosts = pShopify + pApps;

    // Yearly Projection
    const yearlyRevenue = monthlyRevenue * 12;
    const yearlyNetProfit = monthlyNetProfit * 12;

    // Break-even Calculations
    // Contribution Margin per unit before fixed overhead = grossProfitPerUnit - paymentFee - pAds
    const contributionMargin = grossProfitPerUnit - paymentFee - pAds;
    const breakEvenUnits = contributionMargin > 0 ? Math.ceil(monthlyFixedCosts / contributionMargin) : 0;

    // Break-even selling price given current volume & costs
    // sellingPrice - paymentFee(sellingPrice) - unitCosts = (fixedCosts / volume)
    // price * (1 - rate/100) = cogs + shipDiff + fixedFee + ads + (fixedCosts/vol)
    const netUnitCostBase = pCost + pShipActual - pShipCharged + pFixed + pAds + fixedOverheadPerUnit;
    const breakEvenPrice = (1 - pRate / 100) > 0 ? netUnitCostBase / (1 - pRate / 100) : 0;

    return {
      totalOrderValue,
      paymentFee,
      fixedOverheadPerUnit,
      grossProfitPerUnit,
      netProfitPerUnit,
      netMarginPercent,
      grossMarginPercent,
      monthlyRevenue,
      monthlyGrossProfit,
      monthlyNetProfit,
      monthlyPaymentFees,
      monthlyTotalAds,
      monthlyTotalCogs,
      monthlyFixedCosts,
      yearlyRevenue,
      yearlyNetProfit,
      breakEvenUnits,
      breakEvenPrice,
      contributionMargin,
    };
  }, [pPrice, pCost, pShipCharged, pShipActual, pRate, pFixed, pShopify, pVolume, pAds, pApps]);

  const f = (n: number) => `$${n.toFixed(2)}`;

  const handleCopy = async () => {
    const text = `=== Shopify Profit Calculator Report ===
Monthly Sales Volume: ${pVolume} units
Order Selling Price: ${f(pPrice)} (+ ${f(pShipCharged)} shipping)
Product COGS: ${f(pCost)}
Actual Shipping: ${f(pShipActual)}
Payment Gateway Fee: ${f(calc.paymentFee)} (${pRate}% + $${pFixed})
Ad Spend / CAC: ${f(pAds)}
Allocated Fixed Overhead: ${f(calc.fixedOverheadPerUnit)}

--------------------------------------
Gross Profit Per Unit: ${f(calc.grossProfitPerUnit)} (${calc.grossMarginPercent.toFixed(1)}%)
Net Profit Per Unit: ${f(calc.netProfitPerUnit)} (${calc.netMarginPercent.toFixed(1)}%)
Monthly Net Profit: ${f(calc.monthlyNetProfit)}
Annual Net Profit: ${f(calc.yearlyNetProfit)}
Break-Even Volume: ${calc.breakEvenUnits} units/month
Break-Even Selling Price: ${f(calc.breakEvenPrice)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Shopify profit report copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Per Unit ($)", "Monthly Total ($)", "Yearly Total ($)"],
      ["Customer Selling Price", pPrice.toFixed(2), (pPrice * pVolume).toFixed(2), (pPrice * pVolume * 12).toFixed(2)],
      ["Shipping Charged to Buyer", pShipCharged.toFixed(2), (pShipCharged * pVolume).toFixed(2), (pShipCharged * pVolume * 12).toFixed(2)],
      ["Total Gross Revenue", calc.totalOrderValue.toFixed(2), calc.monthlyRevenue.toFixed(2), calc.yearlyRevenue.toFixed(2)],
      ["Product Cost (COGS)", pCost.toFixed(2), (pCost * pVolume).toFixed(2), (pCost * pVolume * 12).toFixed(2)],
      ["Actual Shipping & Handling", pShipActual.toFixed(2), (pShipActual * pVolume).toFixed(2), (pShipActual * pVolume * 12).toFixed(2)],
      ["Payment Processing Fees", calc.paymentFee.toFixed(2), calc.monthlyPaymentFees.toFixed(2), (calc.monthlyPaymentFees * 12).toFixed(2)],
      ["Marketing / Ad Spend (CAC)", pAds.toFixed(2), calc.monthlyTotalAds.toFixed(2), (calc.monthlyTotalAds * 12).toFixed(2)],
      ["Shopify & App Subscriptions", calc.fixedOverheadPerUnit.toFixed(2), calc.monthlyFixedCosts.toFixed(2), (calc.monthlyFixedCosts * 12).toFixed(2)],
      ["Gross Profit", calc.grossProfitPerUnit.toFixed(2), calc.monthlyGrossProfit.toFixed(2), (calc.monthlyGrossProfit * 12).toFixed(2)],
      ["Net Profit", calc.netProfitPerUnit.toFixed(2), calc.monthlyNetProfit.toFixed(2), calc.yearlyNetProfit.toFixed(2)],
      ["Net Margin (%)", `${calc.netMarginPercent.toFixed(2)}%`, `${calc.netMarginPercent.toFixed(2)}%`, `${calc.netMarginPercent.toFixed(2)}%`],
      ["Break-Even Volume (Units)", calc.breakEvenUnits.toString(), "", ""],
      ["Break-Even Selling Price", calc.breakEvenPrice.toFixed(2), "", ""],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shopify_profit_report_${pVolume}_units.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Profit Per Order</span>
          <div className={`mt-1 text-3xl font-extrabold ${calc.netProfitPerUnit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
            {f(calc.netProfitPerUnit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {calc.netMarginPercent.toFixed(1)}% Net Margin
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Net Profit</span>
          <div className={`mt-1 text-3xl font-bold ${calc.monthlyNetProfit >= 0 ? "text-primary" : "text-destructive"}`}>
            {f(calc.monthlyNetProfit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            From {f(calc.monthlyRevenue)} monthly sales
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Break-Even Volume</span>
          <div className="mt-1 text-3xl font-bold text-foreground">
            {calc.breakEvenUnits} <span className="text-sm font-normal text-muted-foreground">units/mo</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Break-even price: <strong>{f(calc.breakEvenPrice)}</strong>
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Annual Projection</span>
          <div className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {f(calc.yearlyNetProfit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Gross annual: {f(calc.yearlyRevenue)}
          </p>
        </div>
      </div>

      {/* Main Form Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Product & Pricing */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4 text-primary" /> Product & Shipping Economics
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sellingPrice" className="text-xs font-medium">Selling Price ($)</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="productCost" className="text-xs font-medium">Product Cost / COGS ($)</Label>
              <Input
                id="productCost"
                type="number"
                min="0"
                step="any"
                value={productCost}
                onChange={(e) => setProductCost(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="shippingCharged" className="text-xs font-medium">Shipping Charged to Buyer ($)</Label>
              <Input
                id="shippingCharged"
                type="number"
                min="0"
                step="any"
                value={shippingCharged}
                onChange={(e) => setShippingCharged(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="shippingActual" className="text-xs font-medium">Actual Shipping Cost Paid ($)</Label>
              <Input
                id="shippingActual"
                type="number"
                min="0"
                step="any"
                value={shippingActual}
                onChange={(e) => setShippingActual(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="adSpend" className="text-xs font-medium">Ad Spend / CAC per Unit ($)</Label>
              <Input
                id="adSpend"
                type="number"
                min="0"
                step="any"
                value={adSpendPerUnit}
                onChange={(e) => setAdSpendPerUnit(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="volume" className="text-xs font-medium">Expected Monthly Sales (Units)</Label>
              <Input
                id="volume"
                type="number"
                min="1"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Platform Fees & Subscriptions */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> Shopify Plan & Payment Fees
          </h3>

          <div>
            <Label className="text-xs font-medium">Shopify Subscription Tier</Label>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              {SHOPIFY_PLANS.slice(0, 3).map((p) => (
                <Button
                  key={p.id}
                  type="button"
                  size="sm"
                  variant={planId === p.id ? "default" : "outline"}
                  onClick={() => handlePlanChange(p.id)}
                  className="h-8 text-xs font-normal"
                >
                  {p.name.replace("Shopify ", "")} (${p.monthlyFee}/mo)
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="gatewayRate" className="text-xs font-medium">Gateway Rate (%)</Label>
              <Input
                id="gatewayRate"
                type="number"
                min="0"
                step="0.1"
                value={gatewayRate}
                onChange={(e) => setGatewayRate(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="gatewayFixed" className="text-xs font-medium">Fixed Trans Fee ($)</Label>
              <Input
                id="gatewayFixed"
                type="number"
                min="0"
                step="0.01"
                value={gatewayFixed}
                onChange={(e) => setGatewayFixed(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="shopifyFee" className="text-xs font-medium">Shopify Monthly Plan ($)</Label>
              <Input
                id="shopifyFee"
                type="number"
                min="0"
                value={shopifyMonthly}
                onChange={(e) => setShopifyMonthly(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="appsFee" className="text-xs font-medium">Monthly Apps & Themes ($)</Label>
              <Input
                id="appsFee"
                type="number"
                min="0"
                value={monthlyAppsOverhead}
                onChange={(e) => setMonthlyAppsOverhead(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          {calc.netProfitPerUnit < 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Negative profit! You are losing {f(Math.abs(calc.netProfitPerUnit))} on every sale at current pricing.</span>
            </div>
          )}
        </div>
      </div>

      {/* Itemized Cost Breakdown Progress Bar */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">Where Does Every Dollar Go? (Per Unit Breakdown)</h3>
            <p className="text-xs text-muted-foreground">Visual breakdown of your {f(calc.totalOrderValue)} customer order value</p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadCsv} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" onClick={handleCopy} className="h-8 text-xs gap-1 font-semibold">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Report"}
            </Button>
          </div>
        </div>

        {/* Visual Stacked Bar */}
        {calc.totalOrderValue > 0 && (
          <div className="space-y-2">
            <div className="flex h-6 w-full overflow-hidden rounded-md text-[10px] font-bold text-white shadow-inner">
              <div style={{ width: `${Math.max(0, (pCost / calc.totalOrderValue) * 100)}%` }} className="bg-slate-600 flex items-center justify-center truncate px-1" title={`Product Cost: ${f(pCost)}`}>
                COGS
              </div>
              <div style={{ width: `${Math.max(0, (pShipActual / calc.totalOrderValue) * 100)}%` }} className="bg-blue-600 flex items-center justify-center truncate px-1" title={`Shipping: ${f(pShipActual)}`}>
                Ship
              </div>
              <div style={{ width: `${Math.max(0, (calc.paymentFee / calc.totalOrderValue) * 100)}%` }} className="bg-purple-600 flex items-center justify-center truncate px-1" title={`Gateway: ${f(calc.paymentFee)}`}>
                Gateway
              </div>
              <div style={{ width: `${Math.max(0, (pAds / calc.totalOrderValue) * 100)}%` }} className="bg-amber-600 flex items-center justify-center truncate px-1" title={`Ads CAC: ${f(pAds)}`}>
                Ads
              </div>
              <div style={{ width: `${Math.max(0, (calc.fixedOverheadPerUnit / calc.totalOrderValue) * 100)}%` }} className="bg-rose-600 flex items-center justify-center truncate px-1" title={`Overhead: ${f(calc.fixedOverheadPerUnit)}`}>
                Plan
              </div>
              {calc.netProfitPerUnit > 0 && (
                <div style={{ width: `${Math.max(0, (calc.netProfitPerUnit / calc.totalOrderValue) * 100)}%` }} className="bg-emerald-600 flex items-center justify-center truncate px-1" title={`Net Profit: ${f(calc.netProfitPerUnit)}`}>
                  Profit
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-600" /> COGS: <strong>{f(pCost)}</strong></span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Shipping: <strong>{f(pShipActual)}</strong></span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Gateway: <strong>{f(calc.paymentFee)}</strong></span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Ad CAC: <strong>{f(pAds)}</strong></span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Plan & Apps: <strong>{f(calc.fixedOverheadPerUnit)}</strong></span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Net Profit: <strong>{f(calc.netProfitPerUnit)}</strong></span>
            </div>
          </div>
        )}

        {/* Detailed Itemized Table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-left font-semibold">
              <tr>
                <th className="p-2.5">Financial Line Item</th>
                <th className="p-2.5">Per Order</th>
                <th className="p-2.5">Monthly Total ({pVolume} orders)</th>
                <th className="p-2.5 text-right">Annual Projected</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2.5 font-medium">Gross Customer Revenue</td>
                <td className="p-2.5 font-mono">{f(calc.totalOrderValue)}</td>
                <td className="p-2.5 font-mono">{f(calc.monthlyRevenue)}</td>
                <td className="p-2.5 font-mono text-right">{f(calc.yearlyRevenue)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">- Product COGS & Fulfillment</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(pCost + pShipActual)}</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(calc.monthlyTotalCogs)}</td>
                <td className="p-2.5 font-mono text-muted-foreground text-right">{f(calc.monthlyTotalCogs * 12)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">- Payment Gateway Processing</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(calc.paymentFee)}</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(calc.monthlyPaymentFees)}</td>
                <td className="p-2.5 font-mono text-muted-foreground text-right">{f(calc.monthlyPaymentFees * 12)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">- Marketing & Ad Spend (CAC)</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(pAds)}</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(calc.monthlyTotalAds)}</td>
                <td className="p-2.5 font-mono text-muted-foreground text-right">{f(calc.monthlyTotalAds * 12)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">- Shopify Plan & App Subscriptions</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(calc.fixedOverheadPerUnit)}</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(calc.monthlyFixedCosts)}</td>
                <td className="p-2.5 font-mono text-muted-foreground text-right">{f(calc.monthlyFixedCosts * 12)}</td>
              </tr>
              <tr className="bg-primary/5 font-semibold">
                <td className="p-2.5 text-primary">Final Net Profit</td>
                <td className={`p-2.5 font-mono font-bold ${calc.netProfitPerUnit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>{f(calc.netProfitPerUnit)}</td>
                <td className={`p-2.5 font-mono font-bold ${calc.monthlyNetProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>{f(calc.monthlyNetProfit)}</td>
                <td className={`p-2.5 font-mono font-bold text-right ${calc.yearlyNetProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>{f(calc.yearlyNetProfit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
