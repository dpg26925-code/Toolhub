import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, PackageSearch, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, Flame } from "lucide-react";

const PRESET_PRODUCTS = [
  { name: "Viral LED Sunset Lamp", price: 34.99, cost: 7.50, shipping: 4.20, ads: 12.00, comp: "high", trend: "steady", wow: 4 },
  { name: "Ergonomic Neck Cloud Massager", price: 49.99, cost: 9.80, shipping: 5.50, ads: 16.00, comp: "medium", trend: "rising", wow: 5 },
  { name: "Pet Hair Grooming Vacuum", price: 69.99, cost: 18.00, shipping: 8.50, ads: 20.00, comp: "low", trend: "rising", wow: 5 },
  { name: "Stainless Portable Blender", price: 39.99, cost: 11.20, shipping: 4.80, ads: 14.00, comp: "high", trend: "steady", wow: 4 },
];

export default function DropshippingCalculator() {
  const [productName, setProductName] = useState("Wireless Magnetic Power Bank");
  const [sellingPrice, setSellingPrice] = useState("44.99");
  const [supplierCost, setSupplierCost] = useState("9.50");
  const [shippingCost, setShippingCost] = useState("4.80");
  const [adSpendPerUnit, setAdSpendPerUnit] = useState("14.00");
  const [paymentFeeRate, setPaymentFeeRate] = useState("2.9");
  const [paymentFixedFee, setPaymentFixedFee] = useState("0.30");
  const [competitionLevel, setCompetitionLevel] = useState<"low" | "medium" | "high" | "saturated">("medium");
  const [trendStatus, setTrendStatus] = useState<"rising" | "steady" | "declining">("rising");
  const [wowFactor, setWowFactor] = useState<number>(4); // 1 to 5
  const [monthlyOrders, setMonthlyOrders] = useState("300");
  const [copied, setCopied] = useState(false);

  const pPrice = Math.max(0.1, parseFloat(sellingPrice) || 1);
  const pCost = Math.max(0, parseFloat(supplierCost) || 0);
  const pShipping = Math.max(0, parseFloat(shippingCost) || 0);
  const pAds = Math.max(0, parseFloat(adSpendPerUnit) || 0);
  const pRate = Math.max(0, parseFloat(paymentFeeRate) || 0) / 100;
  const pFixed = Math.max(0, parseFloat(paymentFixedFee) || 0);
  const pOrders = Math.max(1, parseInt(monthlyOrders) || 1);

  const handleApplyPreset = (p: typeof PRESET_PRODUCTS[0]) => {
    setProductName(p.name);
    setSellingPrice(String(p.price));
    setSupplierCost(String(p.cost));
    setShippingCost(String(p.shipping));
    setAdSpendPerUnit(String(p.ads));
    setCompetitionLevel(p.comp as any);
    setTrendStatus(p.trend as any);
    setWowFactor(p.wow);
    toast.info(`Loaded preset: ${p.name}`);
  };

  const calc = useMemo(() => {
    // Total Direct COGS + Freight
    const totalSupplierCost = pCost + pShipping;

    // Payment Processing Fee
    const paymentFee = (pPrice * pRate) + pFixed;

    // Total Cost Per Unit
    const totalUnitCost = totalSupplierCost + paymentFee + pAds;

    // Net Profit per Unit
    const netProfitPerUnit = pPrice - totalUnitCost;

    // Margins
    const grossMarginPercent = pPrice > 0 ? ((pPrice - totalSupplierCost) / pPrice) * 100 : 0;
    const netMarginPercent = pPrice > 0 ? (netProfitPerUnit / pPrice) * 100 : 0;
    const markupMultiple = totalSupplierCost > 0 ? pPrice / totalSupplierCost : 0;

    // Break-even Calculations
    // Break-even Selling Price given supplier cost, shipping, and ad spend
    // price * (1 - rate) = supplierCost + shipping + fixedFee + ads
    const breakEvenPrice = (1 - pRate) > 0 ? (totalSupplierCost + pFixed + pAds) / (1 - pRate) : 0;

    // Break-even ROAS = Selling Price / (Selling Price - SupplierCost - PaymentFee)
    const marginBeforeAds = pPrice - totalSupplierCost - paymentFee;
    const breakEvenRoas = marginBeforeAds > 0 ? pPrice / marginBeforeAds : 99;

    // Product Viability Scoring Algorithm (0 - 100)
    let score = 0;

    // 1. Margin weight (up to 35 pts)
    if (netMarginPercent >= 30) score += 35;
    else if (netMarginPercent >= 20) score += 28;
    else if (netMarginPercent >= 10) score += 18;
    else if (netMarginPercent > 0) score += 8;

    // 2. Markup Multiple weight (up to 20 pts: 3x markup is standard)
    if (markupMultiple >= 3.5) score += 20;
    else if (markupMultiple >= 2.8) score += 16;
    else if (markupMultiple >= 2.0) score += 10;
    else score += 4;

    // 3. Trend Score (up to 15 pts)
    if (trendStatus === "rising") score += 15;
    else if (trendStatus === "steady") score += 10;
    else score += 2;

    // 4. Competition adjustment (up to 15 pts)
    if (competitionLevel === "low") score += 15;
    else if (competitionLevel === "medium") score += 11;
    else if (competitionLevel === "high") score += 6;
    else score += 1;

    // 5. Problem-Solving / Wow factor (up to 15 pts)
    score += wowFactor * 3;

    score = Math.min(100, Math.max(0, score));

    let viabilityLabel = "🔥 High Potential Winner";
    let badgeColor = "text-emerald-600 dark:text-emerald-400 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30";

    if (score >= 80) {
      viabilityLabel = "🔥 High Potential Winner";
      badgeColor = "text-emerald-600 dark:text-emerald-400 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30";
    } else if (score >= 65) {
      viabilityLabel = "✨ Solid Candidate";
      badgeColor = "text-blue-600 dark:text-blue-400 border-blue-300 bg-blue-50 dark:bg-blue-950/30";
    } else if (score >= 50) {
      viabilityLabel = "⚠️ Moderate Risk";
      badgeColor = "text-amber-600 dark:text-amber-400 border-amber-300 bg-amber-50 dark:bg-amber-950/30";
    } else {
      viabilityLabel = "❌ Low Viability / High Risk";
      badgeColor = "text-rose-600 dark:text-rose-400 border-rose-300 bg-rose-50 dark:bg-rose-950/30";
    }

    // Monthly Projections
    const monthlyRevenue = pPrice * pOrders;
    const monthlyNetProfit = netProfitPerUnit * pOrders;
    const monthlyAdSpend = pAds * pOrders;
    const monthlyCogs = totalSupplierCost * pOrders;

    return {
      totalSupplierCost,
      paymentFee,
      totalUnitCost,
      netProfitPerUnit,
      grossMarginPercent,
      netMarginPercent,
      markupMultiple,
      breakEvenPrice,
      breakEvenRoas,
      score,
      viabilityLabel,
      badgeColor,
      monthlyRevenue,
      monthlyNetProfit,
      monthlyAdSpend,
      monthlyCogs,
    };
  }, [pPrice, pCost, pShipping, pAds, pRate, pFixed, competitionLevel, trendStatus, wowFactor, pOrders]);

  // Volume Scaling Table
  const scaleMilestones = useMemo(() => {
    const volumes = [50, 100, 250, 500, 1000];
    return volumes.map((v) => ({
      volume: v,
      revenue: v * pPrice,
      adSpend: v * pAds,
      cogs: v * calc.totalSupplierCost,
      netProfit: v * calc.netProfitPerUnit,
    }));
  }, [pPrice, pAds, calc.totalSupplierCost, calc.netProfitPerUnit]);

  const f = (n: number) => `$${n.toFixed(2)}`;

  const handleCopy = async () => {
    const text = `=== Dropshipping Product Viability Audit ===
Product: ${productName}
Selling Price: ${f(pPrice)}
Supplier Cost + Shipping: ${f(calc.totalSupplierCost)} (Cost: ${f(pCost)}, Ship: ${f(pShipping)})
Estimated Ad CAC: ${f(pAds)}
Payment Processing: ${f(calc.paymentFee)}

--- Viability & Margins ---
Product Score: ${calc.score}/100 (${calc.viabilityLabel})
Price Markup Multiple: ${calc.markupMultiple.toFixed(2)}x
Gross Profit Margin: ${calc.grossMarginPercent.toFixed(1)}%
NET PROFIT PER UNIT: ${f(calc.netProfitPerUnit)} (${calc.netMarginPercent.toFixed(1)}% margin)
Break-Even Selling Price: ${f(calc.breakEvenPrice)}
Target Break-Even ROAS: ${calc.breakEvenRoas.toFixed(2)}x

--- Monthly Scaling (${pOrders} Units) ---
Gross Monthly Revenue: ${f(calc.monthlyRevenue)}
Monthly Ad Budget: ${f(calc.monthlyAdSpend)}
Monthly Net Profit: ${f(calc.monthlyNetProfit)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Dropshipping product report copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Product Name", productName],
      ["Selling Price", pPrice.toFixed(2)],
      ["Supplier Cost", pCost.toFixed(2)],
      ["Shipping Cost", pShipping.toFixed(2)],
      ["Total Supplier Cost", calc.totalSupplierCost.toFixed(2)],
      ["Estimated Ad CAC", pAds.toFixed(2)],
      ["Payment Processing Fee", calc.paymentFee.toFixed(2)],
      ["Total Unit Cost", calc.totalUnitCost.toFixed(2)],
      ["Net Profit Per Unit", calc.netProfitPerUnit.toFixed(2)],
      ["Gross Margin (%)", `${calc.grossMarginPercent.toFixed(2)}%`],
      ["Net Margin (%)", `${calc.netMarginPercent.toFixed(2)}%`],
      ["Price Markup Multiple", `${calc.markupMultiple.toFixed(2)}x`],
      ["Product Viability Score (1-100)", calc.score.toString()],
      ["Viability Rating", calc.viabilityLabel],
      ["Break-Even Price", calc.breakEvenPrice.toFixed(2)],
      ["Break-Even Target ROAS", `${calc.breakEvenRoas.toFixed(2)}x`],
      [],
      ["Monthly Volume (Units)", "Revenue ($)", "Ad Budget ($)", "COGS ($)", "Net Profit ($)"],
      ...scaleMilestones.map((m) => [m.volume.toString(), m.revenue.toFixed(2), m.adSpend.toFixed(2), m.cogs.toFixed(2), m.netProfit.toFixed(2)]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dropshipping_viability_${productName.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Example Products:</span>
        {PRESET_PRODUCTS.map((p) => (
          <Button
            key={p.name}
            size="sm"
            variant="outline"
            onClick={() => handleApplyPreset(p)}
            className="h-7 text-xs font-medium"
          >
            <Sparkles className="mr-1 h-3 w-3 text-amber-500" />
            {p.name.split(" ")[0]} {p.name.split(" ")[1]}
          </Button>
        ))}
      </div>

      {/* Top Results Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Viability Score</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary">{calc.score}</span>
            <span className="text-xs font-medium text-muted-foreground">/ 100</span>
          </div>
          <p className="mt-1 text-xs font-bold truncate">
            {calc.viabilityLabel}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Profit Per Unit</span>
          <div className={`mt-1 text-3xl font-bold ${calc.netProfitPerUnit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
            {f(calc.netProfitPerUnit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {calc.netMarginPercent.toFixed(1)}% margin · {calc.markupMultiple.toFixed(1)}x markup
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Net Profit</span>
          <div className={`mt-1 text-3xl font-bold ${calc.monthlyNetProfit >= 0 ? "text-foreground" : "text-destructive"}`}>
            {f(calc.monthlyNetProfit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            At {pOrders} orders/month
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Break-Even ROAS</span>
          <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {calc.breakEvenRoas.toFixed(2)}x
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Floor price: <strong>{f(calc.breakEvenPrice)}</strong>
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Product & Supplier Sourcing */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <PackageSearch className="h-4 w-4 text-primary" /> Product Sourcing & Selling Price
          </h3>

          <div>
            <Label htmlFor="prodName" className="text-xs font-medium">Product Name / Title</Label>
            <Input
              id="prodName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sellingPrice" className="text-xs font-medium">Target Selling Price ($)</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0.1"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="supplierCost" className="text-xs font-medium">AliExpress/CJ Cost ($)</Label>
              <Input
                id="supplierCost"
                type="number"
                min="0"
                step="any"
                value={supplierCost}
                onChange={(e) => setSupplierCost(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="shippingCost" className="text-xs font-medium">Supplier Shipping / Packet ($)</Label>
              <Input
                id="shippingCost"
                type="number"
                min="0"
                step="any"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="adSpend" className="text-xs font-medium">Estimated Ad CAC / Order ($)</Label>
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
          </div>
        </div>

        {/* Right Column: Market Competition & Product Qualitative Factors */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> Market Factors & Competition
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="comp" className="text-xs font-medium">Competition Level</Label>
              <select
                id="comp"
                value={competitionLevel}
                onChange={(e) => setCompetitionLevel(e.target.value as any)}
                className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="low">Low (Blue Ocean)</option>
                <option value="medium">Medium (Manageable)</option>
                <option value="high">High (Established Ads)</option>
                <option value="saturated">Saturated (Extremely Competitive)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="trend" className="text-xs font-medium">Trend Velocity</Label>
              <select
                id="trend"
                value={trendStatus}
                onChange={(e) => setTrendStatus(e.target.value as any)}
                className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="rising">🚀 Rising / Viral</option>
                <option value="steady">📊 Steady Evergreen</option>
                <option value="declining">📉 Declining Interest</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="wow" className="text-xs font-medium">Problem-Solving / Wow (1-5)</Label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    size="sm"
                    variant={wowFactor === star ? "default" : "outline"}
                    onClick={() => setWowFactor(star)}
                    className="h-8 flex-1 text-xs"
                  >
                    {star}★
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="monthlyOrders" className="text-xs font-medium">Target Monthly Orders</Label>
              <Input
                id="monthlyOrders"
                type="number"
                min="1"
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          {calc.netProfitPerUnit < 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Warning: At current ad CAC ({f(pAds)}), your product operates at a loss of {f(Math.abs(calc.netProfitPerUnit))}/unit.</span>
            </div>
          )}
        </div>
      </div>

      {/* Scaling Projections Table */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">Scaling Roadmap & Unit Economics</h3>
            <p className="text-xs text-muted-foreground">Revenue and profit projections at scale</p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadCsv} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" onClick={handleCopy} className="h-8 text-xs gap-1 font-semibold">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Audit"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-left font-semibold">
              <tr>
                <th className="p-2.5">Monthly Sales Volume</th>
                <th className="p-2.5">Gross Revenue</th>
                <th className="p-2.5">Ad Budget</th>
                <th className="p-2.5">Product + Shipping COGS</th>
                <th className="p-2.5 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scaleMilestones.map((m) => (
                <tr key={m.volume} className={m.volume === pOrders ? "bg-primary/5 font-semibold" : ""}>
                  <td className="p-2.5 font-mono">{m.volume} orders/mo</td>
                  <td className="p-2.5 font-mono text-muted-foreground">{f(m.revenue)}</td>
                  <td className="p-2.5 font-mono text-muted-foreground">{f(m.adSpend)}</td>
                  <td className="p-2.5 font-mono text-muted-foreground">{f(m.cogs)}</td>
                  <td className={`p-2.5 font-mono text-right font-bold ${m.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                    {f(m.netProfit)}
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
