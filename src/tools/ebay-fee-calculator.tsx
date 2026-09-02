import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, Tag, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

const EBAY_CATEGORIES = [
  { id: "general", name: "Most Categories (Clothing, Home, Toys, Sports)", rate: 13.25, threshold: 7500, overRate: 2.35 },
  { id: "books", name: "Books, DVDs, Movies & Music", rate: 14.95, threshold: 7500, overRate: 2.35 },
  { id: "electronics", name: "Consumer Electronics, Computers & Tech", rate: 9.35, threshold: 7500, overRate: 2.35 },
  { id: "guitars", name: "Musical Instruments & Guitars", rate: 6.35, threshold: 7500, overRate: 2.35 },
  { id: "sneakers", name: "Athletic Sneakers (Over $150)", rate: 8.0, threshold: 150, overRate: 8.0 },
  { id: "jewelry", name: "Jewelry & Watches", rate: 15.0, threshold: 1000, overRate: 9.0 },
  { id: "motors", name: "Motors Parts & Accessories", rate: 12.35, threshold: 7500, overRate: 2.35 },
  { id: "heavy", name: "Heavy Equipment & Commercial", rate: 3.0, threshold: 15000, overRate: 0.5 },
];

const SELLER_LEVELS = [
  { id: "standard", name: "Standard / Above Standard", fvfDiscount: 0, penalty: 0 },
  { id: "top_rated", name: "Top Rated Plus (10% FVF Discount)", fvfDiscount: 10, penalty: 0 },
  { id: "below_standard", name: "Below Standard (+6% Surcharge)", fvfDiscount: 0, penalty: 6 },
];

export default function EbayFeeCalculator() {
  const [itemPrice, setItemPrice] = useState("85.00");
  const [shippingCharged, setShippingCharged] = useState("9.99");
  const [shippingActual, setShippingActual] = useState("8.50");
  const [itemCost, setItemCost] = useState("30.00");
  const [categoryId, setCategoryId] = useState("general");
  const [sellerLevelId, setSellerLevelId] = useState("standard");
  const [hasStore, setHasStore] = useState(false);
  const [promotedRate, setPromotedRate] = useState("0");
  const [salesTaxRate, setSalesTaxRate] = useState("6.5"); // buyer sales tax where eBay levies FVF
  const [copied, setCopied] = useState(false);

  const pPrice = Math.max(0, parseFloat(itemPrice) || 0);
  const pShipCharged = Math.max(0, parseFloat(shippingCharged) || 0);
  const pShipActual = Math.max(0, parseFloat(shippingActual) || 0);
  const pCost = Math.max(0, parseFloat(itemCost) || 0);
  const pPromoted = Math.max(0, parseFloat(promotedRate) || 0);
  const pTax = Math.max(0, parseFloat(salesTaxRate) || 0);

  const selectedCat = EBAY_CATEGORIES.find((c) => c.id === categoryId) || EBAY_CATEGORIES[0];
  const selectedLevel = SELLER_LEVELS.find((l) => l.id === sellerLevelId) || SELLER_LEVELS[0];

  const calc = useMemo(() => {
    // Total amount paid by buyer (Item Price + Shipping Charged + Estimated State Sales Tax)
    // Note: eBay assesses Final Value Fee on the total transaction amount paid by the buyer including sales tax.
    const subtotal = pPrice + pShipCharged;
    const estTaxAmount = subtotal * (pTax / 100);
    const totalBuyerPaid = subtotal + estTaxAmount;

    // Fixed order fee: $0.30 for orders <= $10, $0.40 for orders > $10
    const fixedOrderFee = totalBuyerPaid > 10 ? 0.4 : 0.3;

    // Category base rate (Store subscribers generally get ~0.5% - 1.5% lower FVF depending on tier)
    const storeDiscountAdjustment = hasStore ? 0.8 : 0;
    const effectiveCategoryRate = Math.max(2, selectedCat.rate - storeDiscountAdjustment);

    // Variable Final Value Fee calculation with tier cap
    let variableFvf = 0;
    if (totalBuyerPaid <= selectedCat.threshold) {
      variableFvf = totalBuyerPaid * (effectiveCategoryRate / 100);
    } else {
      variableFvf =
        selectedCat.threshold * (effectiveCategoryRate / 100) +
        (totalBuyerPaid - selectedCat.threshold) * (selectedCat.overRate / 100);
    }

    // Top Rated Plus discount (10% off the final value fee) or Below Standard penalty (+6% on total)
    let fvfDiscountAmount = 0;
    let penaltyAmount = 0;
    if (selectedLevel.fvfDiscount > 0) {
      fvfDiscountAmount = variableFvf * (selectedLevel.fvfDiscount / 100);
    }
    if (selectedLevel.penalty > 0) {
      penaltyAmount = totalBuyerPaid * (selectedLevel.penalty / 100);
    }

    const netFinalValueFee = variableFvf - fvfDiscountAmount + fixedOrderFee + penaltyAmount;

    // Promoted Listings Standard Ad Fee: applied to (item price + shipping)
    const promotedAdFee = subtotal * (pPromoted / 100);

    // Total eBay deductions
    const totalEbayFees = netFinalValueFee + promotedAdFee;

    // Net cash payout from eBay to seller (Subtotal - Total eBay Fees)
    const sellerPayout = subtotal - totalEbayFees;

    // Net profit after deducting COGS and actual shipping cost
    const netProfit = sellerPayout - pCost - pShipActual;

    // Profit margin on selling price and ROI on cost
    const profitMargin = subtotal > 0 ? (netProfit / subtotal) * 100 : 0;
    const totalInvested = pCost + pShipActual;
    const roi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
    const effectiveFeePercent = subtotal > 0 ? (totalEbayFees / subtotal) * 100 : 0;

    return {
      subtotal,
      estTaxAmount,
      totalBuyerPaid,
      fixedOrderFee,
      variableFvf,
      fvfDiscountAmount,
      penaltyAmount,
      netFinalValueFee,
      promotedAdFee,
      totalEbayFees,
      sellerPayout,
      netProfit,
      profitMargin,
      roi,
      effectiveFeePercent,
    };
  }, [pPrice, pShipCharged, pShipActual, pCost, pPromoted, pTax, selectedCat, selectedLevel, hasStore]);

  const f = (n: number) => `$${n.toFixed(2)}`;

  const handleCopy = async () => {
    const text = `=== eBay Fee & Profit Calculation ===
Category: ${selectedCat.name}
Selling Price: ${f(pPrice)} (+ ${f(pShipCharged)} Shipping)
Item COGS: ${f(pCost)}
Actual Shipping Cost: ${f(pShipActual)}
--------------------------------------
eBay Final Value Fee: ${f(calc.netFinalValueFee)}
Promoted Listing Fee: ${f(calc.promotedAdFee)}
Total eBay Fees: ${f(calc.totalEbayFees)} (${calc.effectiveFeePercent.toFixed(1)}% effective)
Seller Payout: ${f(calc.sellerPayout)}
--------------------------------------
NET PROFIT: ${f(calc.netProfit)}
Profit Margin: ${calc.profitMargin.toFixed(1)}%
Return on Investment (ROI): ${calc.roi.toFixed(1)}%`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("eBay fee calculation copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Item Selling Price", pPrice.toFixed(2)],
      ["Shipping Charged to Buyer", pShipCharged.toFixed(2)],
      ["Subtotal", calc.subtotal.toFixed(2)],
      ["Buyer Estimated Sales Tax", calc.estTaxAmount.toFixed(2)],
      ["Total Buyer Payment", calc.totalBuyerPaid.toFixed(2)],
      ["Item Cost (COGS)", pCost.toFixed(2)],
      ["Actual Shipping Cost", pShipActual.toFixed(2)],
      ["Category", selectedCat.name],
      ["Seller Level", selectedLevel.name],
      ["eBay Final Value Fee", calc.netFinalValueFee.toFixed(2)],
      ["Promoted Listing Ad Fee", calc.promotedAdFee.toFixed(2)],
      ["Total eBay Fees", calc.totalEbayFees.toFixed(2)],
      ["Effective Fee (%)", `${calc.effectiveFeePercent.toFixed(2)}%`],
      ["Net Seller Payout", calc.sellerPayout.toFixed(2)],
      ["Net Profit", calc.netProfit.toFixed(2)],
      ["Profit Margin (%)", `${calc.profitMargin.toFixed(2)}%`],
      ["ROI (%)", `${calc.roi.toFixed(2)}%`],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ebay_fee_calc_${pPrice}_item.csv`);
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
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Seller Profit</span>
          <div className={`mt-1 text-3xl font-extrabold ${calc.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
            {f(calc.netProfit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {calc.profitMargin.toFixed(1)}% profit margin
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total eBay Fees</span>
          <div className="mt-1 text-3xl font-bold text-rose-600 dark:text-rose-400">
            {f(calc.totalEbayFees)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {calc.effectiveFeePercent.toFixed(1)}% of selling price
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Payout From eBay</span>
          <div className="mt-1 text-3xl font-bold text-foreground">
            {f(calc.sellerPayout)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Transferred to your bank
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Return on Cost (ROI)</span>
          <div className="mt-1 text-3xl font-bold text-primary">
            {calc.roi.toFixed(1)}%
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            On {f(pCost + pShipActual)} total cost
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Price & Costs */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-primary" /> Listing & Cost Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="itemPrice" className="text-xs font-medium">Item Sale Price ($)</Label>
              <Input
                id="itemPrice"
                type="number"
                min="0"
                step="any"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="itemCost" className="text-xs font-medium">Item Cost / COGS ($)</Label>
              <Input
                id="itemCost"
                type="number"
                min="0"
                step="any"
                value={itemCost}
                onChange={(e) => setItemCost(e.target.value)}
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
              <Label htmlFor="shippingActual" className="text-xs font-medium">Actual Shipping Paid ($)</Label>
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
              <Label htmlFor="promotedRate" className="text-xs font-medium">Promoted Listings Ad Fee (%)</Label>
              <Input
                id="promotedRate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={promotedRate}
                onChange={(e) => setPromotedRate(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="salesTax" className="text-xs font-medium">Buyer State Sales Tax (%)</Label>
              <Input
                id="salesTax"
                type="number"
                min="0"
                max="15"
                step="0.5"
                value={salesTaxRate}
                onChange={(e) => setSalesTaxRate(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Category & Seller Status */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> eBay Category & Seller Status
          </h3>

          <div>
            <Label htmlFor="category" className="text-xs font-medium">eBay Category</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {EBAY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.rate}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="sellerLevel" className="text-xs font-medium">Seller Performance Level</Label>
            <select
              id="sellerLevel"
              value={sellerLevelId}
              onChange={(e) => setSellerLevelId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SELLER_LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-2">
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={hasStore}
                onChange={(e) => setHasStore(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>I have an active eBay Store Subscription (Basic/Premium/Anchor)</span>
            </label>
            <p className="text-[11px] text-muted-foreground">
              Store subscribers enjoy discounted category fee rates and zero insertion fees.
            </p>
          </div>
        </div>
      </div>

      {/* Itemized Fee Breakdown Table */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">Fee Breakdown & Seller Cash Flow</h3>
            <p className="text-xs text-muted-foreground">Detailed audit of all charges, payouts, and net profit</p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadCsv} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" onClick={handleCopy} className="h-8 text-xs gap-1 font-semibold">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Summary"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-left font-semibold">
              <tr>
                <th className="p-2.5">Line Item</th>
                <th className="p-2.5">Rate / Calculation</th>
                <th className="p-2.5 text-right">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2.5 font-medium">Item Selling Price</td>
                <td className="p-2.5 text-muted-foreground">Gross item price</td>
                <td className="p-2.5 font-mono text-right font-semibold">{f(pPrice)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Shipping Charged to Buyer</td>
                <td className="p-2.5 text-muted-foreground">Collected shipping fee</td>
                <td className="p-2.5 font-mono text-right font-semibold">+{f(pShipCharged)}</td>
              </tr>
              <tr className="bg-muted/20">
                <td className="p-2.5 font-medium text-muted-foreground">Buyer Sales Tax (eBay Managed)</td>
                <td className="p-2.5 text-muted-foreground">{pTax}% on ${f(calc.subtotal)}</td>
                <td className="p-2.5 font-mono text-right text-muted-foreground">+{f(calc.estTaxAmount)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">- eBay Final Value Fee (Variable)</td>
                <td className="p-2.5 text-muted-foreground">{selectedCat.rate}% on {f(calc.totalBuyerPaid)}</td>
                <td className="p-2.5 font-mono text-right text-rose-600 dark:text-rose-400">-{f(calc.variableFvf)}</td>
              </tr>
              {calc.fvfDiscountAmount > 0 && (
                <tr className="bg-emerald-50 dark:bg-emerald-950/20">
                  <td className="p-2.5 font-medium text-emerald-600 dark:text-emerald-400">+ Top Rated Plus Discount</td>
                  <td className="p-2.5 text-muted-foreground">10% discount on FVF</td>
                  <td className="p-2.5 font-mono text-right text-emerald-600 dark:text-emerald-400">+{f(calc.fvfDiscountAmount)}</td>
                </tr>
              )}
              <tr>
                <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">- eBay Order Fixed Transaction Fee</td>
                <td className="p-2.5 text-muted-foreground">Per-order processing charge</td>
                <td className="p-2.5 font-mono text-right text-rose-600 dark:text-rose-400">-{f(calc.fixedOrderFee)}</td>
              </tr>
              {pPromoted > 0 && (
                <tr>
                  <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">- Promoted Listings Ad Fee</td>
                  <td className="p-2.5 text-muted-foreground">{pPromoted}% on {f(calc.subtotal)}</td>
                  <td className="p-2.5 font-mono text-right text-rose-600 dark:text-rose-400">-{f(calc.promotedAdFee)}</td>
                </tr>
              )}
              <tr className="bg-muted/30 font-semibold">
                <td className="p-2.5">Net Payout Transferred to Seller</td>
                <td className="p-2.5 text-muted-foreground">Subtotal - Total eBay Fees</td>
                <td className="p-2.5 font-mono text-right font-bold text-foreground">{f(calc.sellerPayout)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">- Actual Item Cost (COGS)</td>
                <td className="p-2.5 text-muted-foreground">Inventory cost</td>
                <td className="p-2.5 font-mono text-right text-muted-foreground">-{f(pCost)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">- Actual Shipping & Label Paid</td>
                <td className="p-2.5 text-muted-foreground">Postage & packaging</td>
                <td className="p-2.5 font-mono text-right text-muted-foreground">-{f(pShipActual)}</td>
              </tr>
              <tr className="bg-primary/5 font-semibold">
                <td className="p-2.5 text-primary text-sm">Final Net Seller Profit</td>
                <td className="p-2.5 text-xs text-primary">{calc.profitMargin.toFixed(1)}% profit margin</td>
                <td className={`p-2.5 font-mono text-right text-base font-bold ${calc.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  {f(calc.netProfit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
