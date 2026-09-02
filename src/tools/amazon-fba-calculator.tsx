import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, Package, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

const CATEGORIES = [
  { id: "home", name: "Home & Kitchen", rate: 15.0, minFee: 0.3 },
  { id: "apparel", name: "Clothing & Apparel", rate: 17.0, minFee: 0.3 },
  { id: "electronics", name: "Consumer Electronics", rate: 8.0, minFee: 0.3 },
  { id: "beauty", name: "Beauty & Personal Care", rate: 15.0, minFee: 0.3 },
  { id: "toys", name: "Toys & Games", rate: 15.0, minFee: 0.3 },
  { id: "sports", name: "Sports & Outdoors", rate: 15.0, minFee: 0.3 },
  { id: "books", name: "Books & Media", rate: 15.0, minFee: 0.3 },
  { id: "grocery", name: "Grocery & Gourmet Food", rate: 15.0, minFee: 0.3 },
  { id: "automotive", name: "Automotive & Industrial", rate: 12.0, minFee: 0.3 },
];

export default function AmazonFbaCalculator() {
  const [sellingPrice, setSellingPrice] = useState("34.99");
  const [productCost, setProductCost] = useState("8.50");
  const [lengthInches, setLengthInches] = useState("10");
  const [widthInches, setWidthInches] = useState("6");
  const [heightInches, setHeightInches] = useState("2");
  const [weightLbs, setWeightLbs] = useState("1.2");
  const [categoryId, setCategoryId] = useState("home");
  const [storageSeason, setStorageSeason] = useState<"standard" | "peak">("standard");
  const [storageMonths, setStorageMonths] = useState("1");
  const [inboundShipping, setInboundShipping] = useState("1.20");
  const [ppcAdSpend, setPpcAdSpend] = useState("3.50");
  const [monthlySales, setMonthlySales] = useState("200");
  const [copied, setCopied] = useState(false);

  const pPrice = Math.max(0, parseFloat(sellingPrice) || 0);
  const pCost = Math.max(0, parseFloat(productCost) || 0);
  const pLength = Math.max(0.1, parseFloat(lengthInches) || 1);
  const pWidth = Math.max(0.1, parseFloat(widthInches) || 1);
  const pHeight = Math.max(0.1, parseFloat(heightInches) || 1);
  const pWeight = Math.max(0.01, parseFloat(weightLbs) || 0.1);
  const pInbound = Math.max(0, parseFloat(inboundShipping) || 0);
  const pPpc = Math.max(0, parseFloat(ppcAdSpend) || 0);
  const pVolume = Math.max(1, parseInt(monthlySales) || 1);
  const pMonths = Math.max(1, parseInt(storageMonths) || 1);

  const selectedCategory = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];

  const calc = useMemo(() => {
    // 1. Calculate cubic feet volume
    const volumeCuInches = pLength * pWidth * pHeight;
    const volumeCuFt = volumeCuInches / 1728;

    // 2. Dimensional Weight (Amazon uses 139 divisor for standard, 166 for oversize)
    const dimWeightLbs = volumeCuInches / 139;
    const shippingWeightLbs = Math.max(pWeight, dimWeightLbs);

    // 3. Determine Size Tier
    // Sort dimensions: longest, median, shortest
    const dims = [pLength, pWidth, pHeight].sort((a, b) => b - a);
    const longest = dims[0];
    const median = dims[1];
    const shortest = dims[2];

    let sizeTier = "Large Standard";
    let fulfillmentFee = 3.86;

    if (longest <= 15 && median <= 12 && shortest <= 0.75 && pWeight <= 1.0) {
      sizeTier = "Small Standard";
      fulfillmentFee = 3.22;
    } else if (longest <= 18 && median <= 14 && shortest <= 8 && shippingWeightLbs <= 20) {
      sizeTier = "Large Standard";
      // Standard large pricing tier estimation
      if (shippingWeightLbs <= 0.5) fulfillmentFee = 3.86;
      else if (shippingWeightLbs <= 1.0) fulfillmentFee = 4.08;
      else if (shippingWeightLbs <= 1.5) fulfillmentFee = 4.75;
      else if (shippingWeightLbs <= 2.0) fulfillmentFee = 5.40;
      else if (shippingWeightLbs <= 3.0) fulfillmentFee = 6.10;
      else fulfillmentFee = 6.10 + Math.ceil(shippingWeightLbs - 3.0) * 0.38;
    } else {
      sizeTier = "Small / Medium Oversize";
      fulfillmentFee = 9.73 + Math.ceil(Math.max(0, shippingWeightLbs - 1)) * 0.42;
    }

    // 4. Amazon Referral Fee (min $0.30)
    const referralFee = Math.max(selectedCategory.minFee, pPrice * (selectedCategory.rate / 100));

    // 5. Monthly Storage Fee
    // Standard (Jan-Sep): $0.87 per cu ft, Peak Q4 (Oct-Dec): $2.40 per cu ft
    const storageRatePerCuFt = storageSeason === "standard" ? 0.87 : 2.40;
    const monthlyStorageFee = volumeCuFt * storageRatePerCuFt * pMonths;

    // Total Amazon Fees
    const totalAmazonFees = fulfillmentFee + referralFee + monthlyStorageFee;
    const effectiveAmazonFeePercent = pPrice > 0 ? (totalAmazonFees / pPrice) * 100 : 0;

    // Net Profit per unit = Selling Price - COGS - Inbound Shipping - Amazon Fees - PPC Ad Spend
    const totalUnitCost = pCost + pInbound + totalAmazonFees + pPpc;
    const netProfitPerUnit = pPrice - totalUnitCost;
    const netMargin = pPrice > 0 ? (netProfitPerUnit / pPrice) * 100 : 0;
    const investedPerUnit = pCost + pInbound + pPpc;
    const roi = investedPerUnit > 0 ? (netProfitPerUnit / investedPerUnit) * 100 : 0;

    // Monthly Totals
    const monthlyRevenue = pPrice * pVolume;
    const monthlyNetProfit = netProfitPerUnit * pVolume;
    const monthlyAmazonFees = totalAmazonFees * pVolume;
    const monthlyCogs = (pCost + pInbound) * pVolume;

    return {
      volumeCuFt,
      dimWeightLbs,
      shippingWeightLbs,
      sizeTier,
      fulfillmentFee,
      referralFee,
      monthlyStorageFee,
      totalAmazonFees,
      effectiveAmazonFeePercent,
      netProfitPerUnit,
      netMargin,
      roi,
      monthlyRevenue,
      monthlyNetProfit,
      monthlyAmazonFees,
      monthlyCogs,
    };
  }, [pLength, pWidth, pHeight, pWeight, pPrice, pCost, pInbound, pPpc, pVolume, pMonths, storageSeason, selectedCategory]);

  const f = (n: number) => `$${n.toFixed(2)}`;

  const handleCopy = async () => {
    const text = `=== Amazon FBA Profit Breakdown ===
Product: ${selectedCategory.name}
Selling Price: ${f(pPrice)}
Product COGS: ${f(pCost)}
Inbound Shipping: ${f(pInbound)}
PPC Ad Spend / Unit: ${f(pPpc)}

--- Amazon FBA Fees ---
Size Tier: ${calc.sizeTier} (Volume: ${calc.volumeCuFt.toFixed(3)} cu ft)
FBA Fulfillment Fee: ${f(calc.fulfillmentFee)}
Amazon Referral Fee: ${f(calc.referralFee)} (${selectedCategory.rate}%)
FBA Monthly Storage Fee: ${f(calc.monthlyStorageFee)}
Total Amazon Fees: ${f(calc.totalAmazonFees)} (${calc.effectiveAmazonFeePercent.toFixed(1)}%)

-----------------------------------
NET PROFIT PER UNIT: ${f(calc.netProfitPerUnit)}
Net Profit Margin: ${calc.netMargin.toFixed(1)}%
Return on Investment (ROI): ${calc.roi.toFixed(1)}%
Monthly Net Profit (${pVolume} units): ${f(calc.monthlyNetProfit)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Amazon FBA breakdown copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Selling Price", pPrice.toFixed(2)],
      ["Product Cost (COGS)", pCost.toFixed(2)],
      ["Inbound Freight / Unit", pInbound.toFixed(2)],
      ["PPC Ads / Unit", pPpc.toFixed(2)],
      ["Category", selectedCategory.name],
      ["Dimensions (L x W x H in)", `${pLength} x ${pWidth} x ${pHeight}`],
      ["Volume (Cubic Feet)", calc.volumeCuFt.toFixed(4)],
      ["Unit Weight (lbs)", pWeight.toFixed(2)],
      ["Size Tier", calc.sizeTier],
      ["FBA Fulfillment Fee", calc.fulfillmentFee.toFixed(2)],
      ["Amazon Referral Fee", calc.referralFee.toFixed(2)],
      ["Monthly Storage Fee", calc.monthlyStorageFee.toFixed(2)],
      ["Total Amazon Fees", calc.totalAmazonFees.toFixed(2)],
      ["Net Profit Per Unit", calc.netProfitPerUnit.toFixed(2)],
      ["Net Margin (%)", `${calc.netMargin.toFixed(2)}%`],
      ["ROI (%)", `${calc.roi.toFixed(2)}%`],
      ["Monthly Units Sold", pVolume.toString()],
      ["Monthly Gross Revenue", calc.monthlyRevenue.toFixed(2)],
      ["Monthly Net Profit", calc.monthlyNetProfit.toFixed(2)],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `amazon_fba_report_${pVolume}_units.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Top Results Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Profit Per Unit</span>
          <div className={`mt-1 text-3xl font-extrabold ${calc.netProfitPerUnit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
            {f(calc.netProfitPerUnit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {calc.netMargin.toFixed(1)}% profit margin · ROI: <strong>{calc.roi.toFixed(1)}%</strong>
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Amazon Fees</span>
          <div className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {f(calc.totalAmazonFees)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {calc.effectiveAmazonFeePercent.toFixed(1)}% of selling price
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Net Profit</span>
          <div className={`mt-1 text-3xl font-bold ${calc.monthlyNetProfit >= 0 ? "text-primary" : "text-destructive"}`}>
            {f(calc.monthlyNetProfit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            From {pVolume} monthly units
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">FBA Size Tier</span>
          <div className="mt-1 text-xl font-bold text-foreground truncate">
            {calc.sizeTier}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {calc.volumeCuFt.toFixed(3)} cu ft · {calc.shippingWeightLbs.toFixed(2)} lbs billable
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Product & Dimensions */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Package className="h-4 w-4 text-primary" /> Product Price & Physical Dimensions
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price" className="text-xs font-medium">Selling Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="cost" className="text-xs font-medium">Product Cost / COGS ($)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="any"
                value={productCost}
                onChange={(e) => setProductCost(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Package Dimensions (L x W x H in inches)</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <Input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Length"
                value={lengthInches}
                onChange={(e) => setLengthInches(e.target.value)}
                className="font-mono text-sm"
              />
              <Input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Width"
                value={widthInches}
                onChange={(e) => setWidthInches(e.target.value)}
                className="font-mono text-sm"
              />
              <Input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Height"
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="weight" className="text-xs font-medium">Unit Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                min="0.01"
                step="0.1"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="inbound" className="text-xs font-medium">Inbound Freight / Unit ($)</Label>
              <Input
                id="inbound"
                type="number"
                min="0"
                step="any"
                value={inboundShipping}
                onChange={(e) => setInboundShipping(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Amazon Fees & Logistics */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> Category & Fulfillment Parameters
          </h3>

          <div>
            <Label htmlFor="category" className="text-xs font-medium">Amazon Product Category</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.rate}% Referral Fee)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Storage Season</Label>
              <div className="mt-1 grid grid-cols-2 gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={storageSeason === "standard" ? "default" : "outline"}
                  onClick={() => setStorageSeason("standard")}
                  className="h-8 text-xs font-normal"
                >
                  Jan–Sep ($0.87)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={storageSeason === "peak" ? "default" : "outline"}
                  onClick={() => setStorageSeason("peak")}
                  className="h-8 text-xs font-normal"
                >
                  Q4 Peak ($2.40)
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="storageMonths" className="text-xs font-medium">Avg Months in FBA</Label>
              <Input
                id="storageMonths"
                type="number"
                min="1"
                max="12"
                value={storageMonths}
                onChange={(e) => setStorageMonths(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ppc" className="text-xs font-medium">PPC Ad Spend / Unit ($)</Label>
              <Input
                id="ppc"
                type="number"
                min="0"
                step="any"
                value={ppcAdSpend}
                onChange={(e) => setPpcAdSpend(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="monthlyUnits" className="text-xs font-medium">Estimated Monthly Units</Label>
              <Input
                id="monthlyUnits"
                type="number"
                min="1"
                value={monthlySales}
                onChange={(e) => setMonthlySales(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          {calc.netProfitPerUnit < 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Warning: At current prices and fees, you lose {f(Math.abs(calc.netProfitPerUnit))} per unit.</span>
            </div>
          )}
        </div>
      </div>

      {/* Itemized Fee Breakdown Table */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">FBA Cost Breakdown & Profit Audit</h3>
            <p className="text-xs text-muted-foreground">Every fee itemized per unit and projected monthly</p>
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

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-left font-semibold">
              <tr>
                <th className="p-2.5">Line Item</th>
                <th className="p-2.5">Details</th>
                <th className="p-2.5">Per Unit</th>
                <th className="p-2.5 text-right">Monthly ({pVolume} units)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2.5 font-medium">Customer Selling Price</td>
                <td className="p-2.5 text-muted-foreground">Gross Amazon listing price</td>
                <td className="p-2.5 font-mono font-semibold">{f(pPrice)}</td>
                <td className="p-2.5 font-mono text-right font-semibold">{f(calc.monthlyRevenue)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">- Amazon Referral Fee</td>
                <td className="p-2.5 text-muted-foreground">{selectedCategory.rate}% on {f(pPrice)}</td>
                <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">-{f(calc.referralFee)}</td>
                <td className="p-2.5 font-mono text-right text-rose-600 dark:text-rose-400">-{f(calc.referralFee * pVolume)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">- FBA Fulfillment Pick & Pack</td>
                <td className="p-2.5 text-muted-foreground">{calc.sizeTier} · {calc.shippingWeightLbs.toFixed(2)} lbs</td>
                <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">-{f(calc.fulfillmentFee)}</td>
                <td className="p-2.5 font-mono text-right text-rose-600 dark:text-rose-400">-{f(calc.fulfillmentFee * pVolume)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">- Monthly FBA Storage Fee</td>
                <td className="p-2.5 text-muted-foreground">{calc.volumeCuFt.toFixed(3)} cu ft ({pMonths} mo storage)</td>
                <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">-{f(calc.monthlyStorageFee)}</td>
                <td className="p-2.5 font-mono text-right text-rose-600 dark:text-rose-400">-{f(calc.monthlyStorageFee * pVolume)}</td>
              </tr>
              <tr className="bg-muted/20">
                <td className="p-2.5 font-medium">Subtotal: Total Amazon Fees</td>
                <td className="p-2.5 text-muted-foreground">{calc.effectiveAmazonFeePercent.toFixed(1)}% total Amazon cut</td>
                <td className="p-2.5 font-mono font-bold text-amber-600 dark:text-amber-400">-{f(calc.totalAmazonFees)}</td>
                <td className="p-2.5 font-mono text-right font-bold text-amber-600 dark:text-amber-400">-{f(calc.monthlyAmazonFees)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">- Product Cost (COGS)</td>
                <td className="p-2.5 text-muted-foreground">Manufacturing / Supplier unit cost</td>
                <td className="p-2.5 font-mono text-muted-foreground">-{f(pCost)}</td>
                <td className="p-2.5 font-mono text-right text-muted-foreground">-{f(pCost * pVolume)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">- Inbound Shipping to FBA</td>
                <td className="p-2.5 text-muted-foreground">Freight & customs per unit</td>
                <td className="p-2.5 font-mono text-muted-foreground">-{f(pInbound)}</td>
                <td className="p-2.5 font-mono text-right text-muted-foreground">-{f(pInbound * pVolume)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">- Amazon PPC / Advertising</td>
                <td className="p-2.5 text-muted-foreground">Sponsored products ad spend</td>
                <td className="p-2.5 font-mono text-muted-foreground">-{f(pPpc)}</td>
                <td className="p-2.5 font-mono text-right text-muted-foreground">-{f(pPpc * pVolume)}</td>
              </tr>
              <tr className="bg-primary/5 font-semibold">
                <td className="p-2.5 text-primary text-sm">Net Seller Profit</td>
                <td className="p-2.5 text-xs text-primary">{calc.netMargin.toFixed(1)}% margin · {calc.roi.toFixed(1)}% ROI</td>
                <td className={`p-2.5 font-mono text-base font-bold ${calc.netProfitPerUnit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  {f(calc.netProfitPerUnit)}
                </td>
                <td className={`p-2.5 font-mono text-base font-bold text-right ${calc.monthlyNetProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  {f(calc.monthlyNetProfit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
