import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, Video, Sparkles, TrendingUp, DollarSign, Globe2 } from "lucide-react";

type CountryConfig = {
  id: string;
  name: string;
  currency: string;
  symbol: string;
  defaultPrice: string;
  defaultCost: string;
  defaultShip: string;
  categories: { id: string; name: string; rate: number }[];
  transactionRate: number; // %
  fixedTransactionFee: number;
  withdrawalMethods: { id: string; name: string; fee: number }[];
};

const COUNTRIES: CountryConfig[] = [
  {
    id: "br",
    name: "Brazil (BRL)",
    currency: "BRL",
    symbol: "R$",
    defaultPrice: "120",
    defaultCost: "45",
    defaultShip: "15",
    categories: [
      { id: "fashion", name: "Moda & Roupas", rate: 8.0 },
      { id: "beauty", name: "Beleza & Cuidados", rate: 7.0 },
      { id: "electronics", name: "Eletrônicos & Acessórios", rate: 6.0 },
      { id: "home", name: "Casa & Cozinha", rate: 6.0 },
      { id: "general", name: "Outras Categorias", rate: 5.0 },
    ],
    transactionRate: 2.0,
    fixedTransactionFee: 0,
    withdrawalMethods: [
      { id: "pix", name: "PIX (Instantâneo - Grátis)", fee: 0 },
      { id: "ted", name: "TED Bancário", fee: 5.0 },
      { id: "international", name: "Transferência Internacional", fee: 15.0 },
    ],
  },
  {
    id: "ph",
    name: "Philippines (PHP)",
    currency: "PHP",
    symbol: "₱",
    defaultPrice: "850",
    defaultCost: "320",
    defaultShip: "65",
    categories: [
      { id: "fashion", name: "Fashion & Apparel", rate: 6.5 },
      { id: "beauty", name: "Beauty & Personal Care", rate: 6.0 },
      { id: "electronics", name: "Electronics & Gadgets", rate: 5.0 },
      { id: "home", name: "Home Living", rate: 5.5 },
      { id: "fmcg", name: "Food & Supplements", rate: 5.0 },
    ],
    transactionRate: 2.24, // 2% + VAT
    fixedTransactionFee: 0,
    withdrawalMethods: [
      { id: "gcash", name: "GCash / Maya (Free)", fee: 0 },
      { id: "bank", name: "Local Bank Transfer", fee: 10.0 },
    ],
  },
  {
    id: "us",
    name: "United States (USD)",
    currency: "USD",
    symbol: "$",
    defaultPrice: "29.99",
    defaultCost: "8.50",
    defaultShip: "4.50",
    categories: [
      { id: "apparel", name: "Apparel & Shoes", rate: 8.0 },
      { id: "beauty", name: "Beauty & Health", rate: 6.0 },
      { id: "electronics", name: "Consumer Electronics", rate: 6.0 },
      { id: "home", name: "Home & Garden", rate: 6.0 },
      { id: "general", name: "General Merchandise", rate: 6.0 },
    ],
    transactionRate: 2.9,
    fixedTransactionFee: 0.3,
    withdrawalMethods: [
      { id: "ach", name: "ACH Bank Transfer (Free)", fee: 0 },
      { id: "wire", name: "Same-Day Wire", fee: 15.0 },
    ],
  },
  {
    id: "uk",
    name: "United Kingdom (GBP)",
    currency: "GBP",
    symbol: "£",
    defaultPrice: "24.99",
    defaultCost: "7.00",
    defaultShip: "3.20",
    categories: [
      { id: "fashion", name: "Fashion & Accessories", rate: 9.0 },
      { id: "beauty", name: "Beauty & Cosmetics", rate: 7.0 },
      { id: "electronics", name: "Tech & Gadgets", rate: 5.0 },
      { id: "home", name: "Home & Kitchen", rate: 6.0 },
      { id: "general", name: "All Other Categories", rate: 5.0 },
    ],
    transactionRate: 2.0,
    fixedTransactionFee: 0.2,
    withdrawalMethods: [
      { id: "faster_payments", name: "UK Faster Payments (Free)", fee: 0 },
      { id: "international", name: "International Transfer", fee: 10.0 },
    ],
  },
  {
    id: "vn",
    name: "Vietnam (VND)",
    currency: "VND",
    symbol: "₫",
    defaultPrice: "250000",
    defaultCost: "95000",
    defaultShip: "25000",
    categories: [
      { id: "fashion", name: "Thời Trang & May Mặc", rate: 5.0 },
      { id: "beauty", name: "Mỹ Phẩm & Chăm Sóc Da", rate: 4.5 },
      { id: "electronics", name: "Thiết Bị Điện Tử", rate: 4.0 },
      { id: "home", name: "Đời Sống & Gia Dụng", rate: 4.0 },
      { id: "general", name: "Các Ngành Hàng Khác", rate: 4.0 },
    ],
    transactionRate: 3.0,
    fixedTransactionFee: 0,
    withdrawalMethods: [
      { id: "local_bank", name: "Chuyển Khoản Ngân Hàng (Free)", fee: 0 },
      { id: "ewallet", name: "Ví Điện Tử (Momo / ZaloPay)", fee: 2000 },
    ],
  },
  {
    id: "id",
    name: "Indonesia (IDR)",
    currency: "IDR",
    symbol: "Rp",
    defaultPrice: "150000",
    defaultCost: "60000",
    defaultShip: "18000",
    categories: [
      { id: "fashion", name: "Fashion & Pakaian", rate: 6.0 },
      { id: "beauty", name: "Kecantikan & Skincare", rate: 5.5 },
      { id: "electronics", name: "Elektronik & Gadget", rate: 4.5 },
      { id: "home", name: "Perlengkapan Rumah", rate: 5.0 },
      { id: "fmcg", name: "Makanan & Minuman", rate: 4.0 },
    ],
    transactionRate: 2.0,
    fixedTransactionFee: 0,
    withdrawalMethods: [
      { id: "bca", name: "BCA / Mandiri / BRI (Free)", fee: 0 },
      { id: "gopay", name: "GoPay / OVO", fee: 2500 },
    ],
  },
];

export default function TikTokShopFeeCalculator() {
  const [countryId, setCountryId] = useState("ph");
  const country = COUNTRIES.find((c) => c.id === countryId) || COUNTRIES[1];

  const [price, setPrice] = useState(country.defaultPrice);
  const [cost, setCost] = useState(country.defaultCost);
  const [shipping, setShipping] = useState(country.defaultShip);
  const [categoryId, setCategoryId] = useState(country.categories[0].id);
  const [isFreeShippingSubsidized, setIsFreeShippingSubsidized] = useState(false);
  const [sellerVoucher, setSellerVoucher] = useState("0");
  const [creatorAffiliateRate, setCreatorAffiliateRate] = useState("10"); // 10% affiliate commission
  const [hasAffiliateCreator, setHasAffiliateCreator] = useState(true);
  const [withdrawalId, setWithdrawalId] = useState(country.withdrawalMethods[0].id);
  const [monthlyVolume, setMonthlyVolume] = useState("100");
  const [copied, setCopied] = useState(false);

  const handleCountryChange = (newCountryId: string) => {
    setCountryId(newCountryId);
    const newCountry = COUNTRIES.find((c) => c.id === newCountryId) || COUNTRIES[0];
    setPrice(newCountry.defaultPrice);
    setCost(newCountry.defaultCost);
    setShipping(newCountry.defaultShip);
    setCategoryId(newCountry.categories[0].id);
    setWithdrawalId(newCountry.withdrawalMethods[0].id);
  };

  const selectedCategory = country.categories.find((cat) => cat.id === categoryId) || country.categories[0];
  const selectedWithdrawal = country.withdrawalMethods.find((w) => w.id === withdrawalId) || country.withdrawalMethods[0];

  const pPrice = Math.max(0, parseFloat(price) || 0);
  const pCost = Math.max(0, parseFloat(cost) || 0);
  const pShipping = Math.max(0, parseFloat(shipping) || 0);
  const pVoucher = Math.max(0, parseFloat(sellerVoucher) || 0);
  const pAffiliateRate = hasAffiliateCreator ? Math.max(0, parseFloat(creatorAffiliateRate) || 0) : 0;
  const pVolume = Math.max(1, parseInt(monthlyVolume) || 1);

  const calc = useMemo(() => {
    // Effective price paid by buyer (Item price - Seller voucher discount)
    const effectivePrice = Math.max(0, pPrice - pVoucher);

    // 1. TikTok Shop Marketplace Commission Fee
    const commissionFee = (effectivePrice * selectedCategory.rate) / 100;

    // 2. Transaction & Payment Processing Fee
    const transactionFee = (effectivePrice * country.transactionRate) / 100 + country.fixedTransactionFee;

    // 3. Creator Affiliate Commission (if seller collaborates with TikTok creators)
    const creatorAffiliateFee = (effectivePrice * pAffiliateRate) / 100;

    // 4. Shipping cost borne by seller if free shipping subsidized
    const sellerShippingExpense = isFreeShippingSubsidized ? pShipping : 0;

    // 5. Withdrawal / Payout Fee per order (allocated)
    const withdrawalFee = selectedWithdrawal.fee;

    // Total TikTok Platform & Payment Deductions
    const totalPlatformDeductions = commissionFee + transactionFee + creatorAffiliateFee;

    // Net Seller Payout per Order (Amount deposited by TikTok Shop)
    const netSellerPayout = effectivePrice - totalPlatformDeductions;

    // Net Profit per Unit (Payout - COGS - Seller Shipping - Withdrawal)
    const netProfit = netSellerPayout - pCost - sellerShippingExpense;

    // Margins
    const netMarginPercent = pPrice > 0 ? (netProfit / pPrice) * 100 : 0;
    const grossMarginPercent = pPrice > 0 ? ((pPrice - pCost) / pPrice) * 100 : 0;
    const totalInvested = pCost + sellerShippingExpense;
    const roi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

    // Monthly Totals
    const monthlyGrossSales = pPrice * pVolume;
    const monthlyNetProfit = netProfit * pVolume;
    const monthlyPlatformFees = totalPlatformDeductions * pVolume;
    const monthlyCogs = pCost * pVolume;

    return {
      effectivePrice,
      commissionFee,
      transactionFee,
      creatorAffiliateFee,
      sellerShippingExpense,
      withdrawalFee,
      totalPlatformDeductions,
      netSellerPayout,
      netProfit,
      netMarginPercent,
      grossMarginPercent,
      roi,
      monthlyGrossSales,
      monthlyNetProfit,
      monthlyPlatformFees,
      monthlyCogs,
    };
  }, [pPrice, pVoucher, pCost, pShipping, isFreeShippingSubsidized, pAffiliateRate, pVolume, selectedCategory, country, selectedWithdrawal]);

  const f = (n: number) => {
    if (country.currency === "VND" || country.currency === "IDR") {
      return `${country.symbol} ${Math.round(n).toLocaleString()}`;
    }
    return `${country.symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCopy = async () => {
    const text = `=== TikTok Shop Fee & Profit Calculation (${country.name}) ===
Product Category: ${selectedCategory.name}
Selling Price: ${f(pPrice)}
Seller Voucher Discount: ${f(pVoucher)}
Product COGS: ${f(pCost)}
Shipping Paid by Seller: ${isFreeShippingSubsidized ? f(pShipping) : "Covered by Buyer"}

--- Deductions & Fees ---
TikTok Marketplace Commission: ${f(calc.commissionFee)} (${selectedCategory.rate}%)
Payment & Transaction Fee: ${f(calc.transactionFee)} (${country.transactionRate}%)
Creator Affiliate Commission: ${f(calc.creatorAffiliateFee)} (${pAffiliateRate}%)
Total Platform Deductions: ${f(calc.totalPlatformDeductions)}
Net Deposit from TikTok: ${f(calc.netSellerPayout)}

--------------------------------------
NET PROFIT PER UNIT: ${f(calc.netProfit)}
Net Profit Margin: ${calc.netMarginPercent.toFixed(1)}%
Return on Investment (ROI): ${calc.roi.toFixed(1)}%
Monthly Net Profit (${pVolume} units): ${f(calc.monthlyNetProfit)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("TikTok Shop fee breakdown copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Country", country.name],
      ["Currency", country.currency],
      ["Category", selectedCategory.name],
      ["Selling Price", pPrice.toFixed(2)],
      ["Seller Voucher Discount", pVoucher.toFixed(2)],
      ["Effective Customer Price", calc.effectivePrice.toFixed(2)],
      ["Product Cost (COGS)", pCost.toFixed(2)],
      ["Seller Shipping Expense", calc.sellerShippingExpense.toFixed(2)],
      ["Platform Commission Fee", calc.commissionFee.toFixed(2)],
      ["Transaction Processing Fee", calc.transactionFee.toFixed(2)],
      ["Creator Affiliate Commission", calc.creatorAffiliateFee.toFixed(2)],
      ["Total Platform Deductions", calc.totalPlatformDeductions.toFixed(2)],
      ["Net Seller Payout", calc.netSellerPayout.toFixed(2)],
      ["Net Profit Per Unit", calc.netProfit.toFixed(2)],
      ["Net Margin (%)", `${calc.netMarginPercent.toFixed(2)}%`],
      ["ROI (%)", `${calc.roi.toFixed(2)}%`],
      ["Monthly Sales Units", pVolume.toString()],
      ["Monthly Gross Sales", calc.monthlyGrossSales.toFixed(2)],
      ["Monthly Net Profit", calc.monthlyNetProfit.toFixed(2)],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tiktok_shop_fee_report_${country.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Top Country Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Marketplace Country:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {COUNTRIES.map((c) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={countryId === c.id ? "default" : "outline"}
              onClick={() => handleCountryChange(c.id)}
              className="h-8 text-xs font-medium"
            >
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Top Results Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Profit Per Unit</span>
          <div className={`mt-1 text-3xl font-extrabold ${calc.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
            {f(calc.netProfit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {calc.netMarginPercent.toFixed(1)}% profit margin · ROI: <strong>{calc.roi.toFixed(1)}%</strong>
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total TikTok Fees</span>
          <div className="mt-1 text-3xl font-bold text-rose-600 dark:text-rose-400">
            {f(calc.totalPlatformDeductions)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Commission + payment + creator cut
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Deposit Payout</span>
          <div className="mt-1 text-3xl font-bold text-foreground">
            {f(calc.netSellerPayout)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Deposited into your bank account
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Net Income</span>
          <div className={`mt-1 text-3xl font-bold ${calc.monthlyNetProfit >= 0 ? "text-primary" : "text-destructive"}`}>
            {f(calc.monthlyNetProfit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            From {pVolume} monthly orders
          </p>
        </div>
      </div>

      {/* Inputs Configuration Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Product & Shipping */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-primary" /> Product Price & Inventory Cost
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price" className="text-xs font-medium">Selling Price ({country.symbol})</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="cost" className="text-xs font-medium">Product Cost / COGS ({country.symbol})</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="any"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="voucher" className="text-xs font-medium">Seller Voucher Discount ({country.symbol})</Label>
              <Input
                id="voucher"
                type="number"
                min="0"
                step="any"
                value={sellerVoucher}
                onChange={(e) => setSellerVoucher(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="shipping" className="text-xs font-medium">Shipping Cost ({country.symbol})</Label>
              <Input
                id="shipping"
                type="number"
                min="0"
                step="any"
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1">
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={isFreeShippingSubsidized}
                onChange={(e) => setIsFreeShippingSubsidized(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Seller pays for Free Shipping ({f(pShipping)})</span>
            </label>
            <p className="text-[11px] text-muted-foreground">
              Uncheck if shipping is paid directly by the buyer or subsidized by TikTok platform campaign vouchers.
            </p>
          </div>
        </div>

        {/* Right Column: Platform Fees & Affiliates */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> Category Commission & Affiliate Cut
          </h3>

          <div>
            <Label htmlFor="category" className="text-xs font-medium">Product Category</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {country.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.rate}% Commission)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAffiliateCreator}
                  onChange={(e) => setHasAffiliateCreator(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>TikTok Creator Affiliate Commission (%)</span>
              </label>
              {hasAffiliateCreator && (
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={creatorAffiliateRate}
                  onChange={(e) => setCreatorAffiliateRate(e.target.value)}
                  className="h-7 w-16 font-mono text-xs font-bold text-primary"
                />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Commission paid to TikTok creators when they sell your product through video tags or live streams.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="withdrawal" className="text-xs font-medium">Payout Method</Label>
              <select
                id="withdrawal"
                value={withdrawalId}
                onChange={(e) => setWithdrawalId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {country.withdrawalMethods.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="monthlyVolume" className="text-xs font-medium">Monthly Orders</Label>
              <Input
                id="monthlyVolume"
                type="number"
                min="1"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Fee Breakdown Table */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">Itemized TikTok Shop Payout & Profit Breakdown</h3>
            <p className="text-xs text-muted-foreground">Detailed accounting per order for {country.name}</p>
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
                <th className="p-2.5">Rate / Calculation</th>
                <th className="p-2.5">Per Unit ({country.symbol})</th>
                <th className="p-2.5 text-right">Monthly ({pVolume} orders)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2.5 font-medium">Customer Selling Price</td>
                <td className="p-2.5 text-muted-foreground">Original listing price</td>
                <td className="p-2.5 font-mono font-semibold">{f(pPrice)}</td>
                <td className="p-2.5 font-mono text-right font-semibold">{f(calc.monthlyGrossSales)}</td>
              </tr>
              {pVoucher > 0 && (
                <tr className="bg-muted/20">
                  <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">- Seller Voucher Discount</td>
                  <td className="p-2.5 text-muted-foreground">Funded by store</td>
                  <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">-{f(pVoucher)}</td>
                  <td className="p-2.5 font-mono text-right text-rose-600 dark:text-rose-400">-{f(pVoucher * pVolume)}</td>
                </tr>
              )}
              <tr>
                <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">- TikTok Marketplace Commission</td>
                <td className="p-2.5 text-muted-foreground">{selectedCategory.rate}% on {f(calc.effectivePrice)}</td>
                <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">-{f(calc.commissionFee)}</td>
                <td className="p-2.5 font-mono text-right text-rose-600 dark:text-rose-400">-{f(calc.commissionFee * pVolume)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">- Payment & Transaction Processing</td>
                <td className="p-2.5 text-muted-foreground">{country.transactionRate}% gateway charge</td>
                <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">-{f(calc.transactionFee)}</td>
                <td className="p-2.5 font-mono text-right text-rose-600 dark:text-rose-400">-{f(calc.transactionFee * pVolume)}</td>
              </tr>
              {hasAffiliateCreator && (
                <tr>
                  <td className="p-2.5 font-medium text-rose-600 dark:text-rose-400">- Creator Affiliate Commission</td>
                  <td className="p-2.5 text-muted-foreground">{pAffiliateRate}% paid to promoting creators</td>
                  <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">-{f(calc.creatorAffiliateFee)}</td>
                  <td className="p-2.5 font-mono text-right text-rose-600 dark:text-rose-400">-{f(calc.creatorAffiliateFee * pVolume)}</td>
                </tr>
              )}
              <tr className="bg-muted/30 font-semibold">
                <td className="p-2.5">Net Payout Deposited by TikTok</td>
                <td className="p-2.5 text-muted-foreground">Effective Price - Platform Fees</td>
                <td className="p-2.5 font-mono font-bold text-foreground">{f(calc.netSellerPayout)}</td>
                <td className="p-2.5 font-mono text-right font-bold text-foreground">{f(calc.netSellerPayout * pVolume)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">- Product Inventory Cost (COGS)</td>
                <td className="p-2.5 text-muted-foreground">Supplier unit cost</td>
                <td className="p-2.5 font-mono text-muted-foreground">-{f(pCost)}</td>
                <td className="p-2.5 font-mono text-right text-muted-foreground">-{f(calc.monthlyCogs)}</td>
              </tr>
              {calc.sellerShippingExpense > 0 && (
                <tr>
                  <td className="p-2.5 font-medium text-muted-foreground">- Free Shipping Subsidy</td>
                  <td className="p-2.5 text-muted-foreground">Paid by seller</td>
                  <td className="p-2.5 font-mono text-muted-foreground">-{f(calc.sellerShippingExpense)}</td>
                  <td className="p-2.5 font-mono text-right text-muted-foreground">-{f(calc.sellerShippingExpense * pVolume)}</td>
                </tr>
              )}
              <tr className="bg-primary/5 font-semibold">
                <td className="p-2.5 text-primary text-sm">Final Net Seller Profit</td>
                <td className="p-2.5 text-xs text-primary">{calc.netMarginPercent.toFixed(1)}% margin · {calc.roi.toFixed(1)}% ROI</td>
                <td className={`p-2.5 font-mono text-base font-bold ${calc.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  {f(calc.netProfit)}
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
