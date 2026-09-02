import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, TrendingUp, TrendingDown, DollarSign, Sparkles, LineChart } from "lucide-react";

const STOCK_PRESETS = [
  { symbol: "NVDA", name: "NVIDIA", buy: 115.00, sell: 160.00, shares: 100 },
  { symbol: "AAPL", name: "Apple", buy: 185.00, sell: 235.00, shares: 75 },
  { symbol: "TSLA", name: "Tesla", buy: 210.00, sell: 295.00, shares: 50 },
  { symbol: "SPY", name: "S&P 500 ETF", buy: 510.00, sell: 585.00, shares: 20 },
];

export default function StockProfitCalculator() {
  const [ticker, setTicker] = useState("NVDA");
  const [buyPrice, setBuyPrice] = useState("115.00");
  const [sellPrice, setSellPrice] = useState("160.00");
  const [sharesCount, setSharesCount] = useState("100");
  const [buyCommission, setBuyCommission] = useState("0"); // most brokers $0
  const [sellCommission, setSellCommission] = useState("0");
  const [holdingPeriod, setHoldingPeriod] = useState<"short" | "long">("short");
  const [taxRatePercent, setTaxRatePercent] = useState("24"); // 24% short term default
  const [leverage, setLeverage] = useState("1"); // 1x cash
  const [marginInterestRate, setMarginInterestRate] = useState("8.5"); // 8.5% annual
  const [holdingDays, setHoldingDays] = useState("60");
  const [copied, setCopied] = useState(false);

  const handleHoldingPeriodChange = (type: "short" | "long") => {
    setHoldingPeriod(type);
    if (type === "long") {
      setTaxRatePercent("15"); // Long-term capital gains ~15%
    } else {
      setTaxRatePercent("24"); // Short-term ordinary tax rate ~24%
    }
  };

  const pBuy = Math.max(0.01, parseFloat(buyPrice) || 1);
  const pSell = Math.max(0.01, parseFloat(sellPrice) || 1);
  const pShares = Math.max(1, parseFloat(sharesCount) || 1);
  const pBuyComm = Math.max(0, parseFloat(buyCommission) || 0);
  const pSellComm = Math.max(0, parseFloat(sellCommission) || 0);
  const pTax = Math.min(60, Math.max(0, parseFloat(taxRatePercent) || 0)) / 100;
  const pLev = Math.max(1, Math.min(10, parseFloat(leverage) || 1));
  const pMarginRate = Math.max(0, parseFloat(marginInterestRate) || 0) / 100;
  const pDays = Math.max(1, parseInt(holdingDays) || 1);

  const calc = useMemo(() => {
    // Total Purchase Value
    const totalPurchaseValue = pBuy * pShares;

    // Actual Cash Invested (if leverage > 1, cash = purchase / leverage)
    const cashInvested = totalPurchaseValue / pLev;
    const borrowedAmount = totalPurchaseValue - cashInvested;

    // Margin Borrow Interest = Borrowed * (Annual Rate / 365) * Days
    const marginInterestCost = borrowedAmount * (pMarginRate / 365) * pDays;

    // Gross Sale Value
    const totalSaleValue = pSell * pShares;

    // Gross Capital P&L
    const grossProfit = totalSaleValue - totalPurchaseValue;

    // Total Trading & Borrow Fees
    const totalFees = pBuyComm + pSellComm + marginInterestCost;

    // Profit Before Tax
    const profitBeforeTax = grossProfit - totalFees;

    // Capital Gains Tax
    const taxAmount = profitBeforeTax > 0 ? profitBeforeTax * pTax : 0;

    // Net Profit
    const netProfit = profitBeforeTax - taxAmount;

    // Return on Invested Capital (ROI %)
    const roi = cashInvested > 0 ? (netProfit / cashInvested) * 100 : 0;
    const priceChangePercent = pBuy > 0 ? ((pSell - pBuy) / pBuy) * 100 : 0;

    // Total Net Proceeds
    const totalProceeds = Math.max(0, cashInvested + netProfit);

    // Breakeven Exit Price per share
    // (pBuy * pShares + totalFees) / pShares
    const breakEvenPrice = (totalPurchaseValue + totalFees) / pShares;

    return {
      totalPurchaseValue,
      cashInvested,
      borrowedAmount,
      marginInterestCost,
      totalSaleValue,
      grossProfit,
      totalFees,
      profitBeforeTax,
      taxAmount,
      netProfit,
      roi,
      priceChangePercent,
      totalProceeds,
      breakEvenPrice,
    };
  }, [pBuy, pSell, pShares, pBuyComm, pSellComm, pTax, pLev, pMarginRate, pDays]);

  // Target Exit Price Scenarios Matrix
  const scenarios = useMemo(() => {
    const moves = [-30, -20, -10, 0, 10, 20, 30, 50, 100];
    return moves.map((m) => {
      const targetPrice = pBuy * (1 + m / 100);
      const gross = (targetPrice * pShares) - calc.totalPurchaseValue;
      const profit = gross - calc.totalFees;
      const tax = profit > 0 ? profit * pTax : 0;
      const net = profit - tax;
      const r = calc.cashInvested > 0 ? (net / calc.cashInvested) * 100 : 0;
      return {
        move: m,
        targetPrice,
        net,
        roi: r,
      };
    });
  }, [pBuy, pShares, calc.totalPurchaseValue, calc.totalFees, calc.cashInvested, pTax]);

  const f = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleCopy = async () => {
    const text = `=== Stock Trade Profit & Loss Report ===
Stock Ticker: ${ticker.toUpperCase()} (${pShares} Shares)
Buy Price: ${f(pBuy)} | Total Investment: ${f(calc.totalPurchaseValue)}
Sell Target Price: ${f(pSell)} (${calc.priceChangePercent >= 0 ? "+" : ""}${calc.priceChangePercent.toFixed(2)}%)
Holding Period: ${holdingPeriod === "long" ? "Long-Term (>1 Year)" : "Short-Term (<1 Year)"}
Breakeven Price: ${f(calc.breakEvenPrice)}

--- Financial Results ---
Gross Profit: ${f(calc.grossProfit)}
Brokerage Commissions & Fees: -${f(calc.totalFees)}
Estimated Capital Gains Tax (${(pTax * 100).toFixed(0)}%): -${f(calc.taxAmount)}
----------------------------------------
NET PROFIT / LOSS: ${f(calc.netProfit)}
Return on Invested Capital (ROI): ${calc.roi.toFixed(2)}%
Total Return of Capital: ${f(calc.totalProceeds)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Stock profit report copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Stock Symbol", ticker.toUpperCase()],
      ["Number of Shares", pShares.toString()],
      ["Buy Price per Share ($)", pBuy.toFixed(2)],
      ["Sell Price per Share ($)", pSell.toFixed(2)],
      ["Total Purchase Value ($)", calc.totalPurchaseValue.toFixed(2)],
      ["Cash Capital Invested ($)", calc.cashInvested.toFixed(2)],
      ["Borrowed Margin Capital ($)", calc.borrowedAmount.toFixed(2)],
      ["Holding Period", holdingPeriod === "long" ? "Long-Term" : "Short-Term"],
      ["Estimated Tax Rate (%)", `${(pTax * 100).toFixed(1)}%`],
      ["Breakeven Exit Price ($)", calc.breakEvenPrice.toFixed(2)],
      ["Gross Profit / Loss ($)", calc.grossProfit.toFixed(2)],
      ["Brokerage & Margin Fees ($)", calc.totalFees.toFixed(2)],
      ["Estimated Tax ($)", calc.taxAmount.toFixed(2)],
      ["Net Profit / Loss ($)", calc.netProfit.toFixed(2)],
      ["ROI (%)", `${calc.roi.toFixed(2)}%`],
      ["Total Account Proceeds ($)", calc.totalProceeds.toFixed(2)],
      [],
      ["Target Move (%)", "Target Price ($)", "Net Profit ($)", "Net ROI (%)"],
      ...scenarios.map((s) => [`${s.move >= 0 ? "+" : ""}${s.move}%`, s.targetPrice.toFixed(2), s.net.toFixed(2), `${s.roi.toFixed(2)}%`]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_profit_calc_${ticker.toUpperCase()}_${pShares}_shares.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Popular Stocks:</span>
        {STOCK_PRESETS.map((p) => (
          <Button
            key={p.symbol}
            size="sm"
            variant="outline"
            onClick={() => {
              setTicker(p.symbol);
              setBuyPrice(p.buy.toFixed(2));
              setSellPrice(p.sell.toFixed(2));
              setSharesCount(String(p.shares));
              toast.info(`Loaded ${p.name} (${p.symbol})`);
            }}
            className="h-7 text-xs font-medium"
          >
            <LineChart className="mr-1 h-3 w-3 text-primary" />
            {p.symbol}
          </Button>
        ))}
      </div>

      {/* Top Results Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Profit / Loss</span>
          <div className={`mt-1 text-3xl font-extrabold ${calc.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
            {calc.netProfit >= 0 ? `+${f(calc.netProfit)}` : f(calc.netProfit)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            ROI: <strong className={calc.roi >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>{calc.roi.toFixed(2)}%</strong>
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Proceeds</span>
          <div className="mt-1 text-3xl font-bold text-foreground">
            {f(calc.totalProceeds)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            From {f(calc.cashInvested)} initial cash
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Breakeven Price</span>
          <div className="mt-1 text-2xl font-bold text-foreground">
            {f(calc.breakEvenPrice)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Covers buy/sell fees & margin
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated Tax</span>
          <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {f(calc.taxAmount)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            At {(pTax * 100).toFixed(0)}% ({holdingPeriod === "long" ? "Long-term" : "Short-term"})
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Ticker & Share Details */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-primary" /> Stock Symbol & Purchase Price
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ticker" className="text-xs font-medium">Stock Ticker Symbol</Label>
              <Input
                id="ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="mt-1 font-mono text-sm uppercase font-bold"
              />
            </div>
            <div>
              <Label htmlFor="shares" className="text-xs font-medium">Number of Shares</Label>
              <Input
                id="shares"
                type="number"
                min="0.1"
                step="any"
                value={sharesCount}
                onChange={(e) => setSharesCount(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="buyPrice" className="text-xs font-medium">Buy Price per Share ($)</Label>
              <Input
                id="buyPrice"
                type="number"
                min="0.01"
                step="any"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="sellPrice" className="text-xs font-medium">Sell Price per Share ($)</Label>
              <Input
                id="sellPrice"
                type="number"
                min="0.01"
                step="any"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="buyComm" className="text-xs font-medium">Buy Commission ($)</Label>
              <Input
                id="buyComm"
                type="number"
                min="0"
                step="any"
                value={buyCommission}
                onChange={(e) => setBuyCommission(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="sellComm" className="text-xs font-medium">Sell Commission ($)</Label>
              <Input
                id="sellComm"
                type="number"
                min="0"
                step="any"
                value={sellCommission}
                onChange={(e) => setSellCommission(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Holding Period, Margin & Taxes */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> Holding Period, Taxes & Margin
          </h3>

          <div>
            <Label className="text-xs font-medium">Capital Gains Tax Holding Category</Label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant={holdingPeriod === "short" ? "default" : "outline"}
                onClick={() => handleHoldingPeriodChange("short")}
                className="h-8 text-xs font-normal"
              >
                Short-Term (&lt;1 Year)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={holdingPeriod === "long" ? "default" : "outline"}
                onClick={() => handleHoldingPeriodChange("long")}
                className="h-8 text-xs font-normal"
              >
                Long-Term (&gt;1 Year)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="taxRate" className="text-xs font-medium">Tax Rate (%): {taxRatePercent}%</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="60"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="leverage" className="text-xs font-medium">Margin Leverage (1x–4x)</Label>
              <Input
                id="leverage"
                type="number"
                min="1"
                max="4"
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          {pLev > 1 && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-2.5 text-xs">
              <div>
                <Label htmlFor="marginRate" className="text-[11px] font-medium">Annual Margin Rate (%)</Label>
                <Input
                  id="marginRate"
                  type="number"
                  min="0"
                  value={marginInterestRate}
                  onChange={(e) => setMarginInterestRate(e.target.value)}
                  className="mt-1 h-7 font-mono text-xs"
                />
              </div>
              <div>
                <Label htmlFor="days" className="text-[11px] font-medium">Holding Days</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  value={holdingDays}
                  onChange={(e) => setHoldingDays(e.target.value)}
                  className="mt-1 h-7 font-mono text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Target Price Scenarios Table */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">Stock Target Return Scenarios</h3>
            <p className="text-xs text-muted-foreground">Profit & ROI matrix at different exit price targets</p>
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
                <th className="p-2.5">Stock Price Move</th>
                <th className="p-2.5">Target Exit Price</th>
                <th className="p-2.5">Net Profit / Loss ($)</th>
                <th className="p-2.5 text-right">Net ROI (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scenarios.map((s) => (
                <tr key={s.move} className={s.move === 0 ? "bg-muted/20 font-semibold" : ""}>
                  <td className="p-2.5 font-mono">
                    <span className={s.move > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : s.move < 0 ? "text-destructive font-bold" : ""}>
                      {s.move >= 0 ? `+${s.move}%` : `${s.move}%`}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono">{f(s.targetPrice)}</td>
                  <td className={`p-2.5 font-mono font-bold ${s.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                    {s.net >= 0 ? `+${f(s.net)}` : f(s.net)}
                  </td>
                  <td className={`p-2.5 font-mono text-right font-bold ${s.roi >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                    {s.roi >= 0 ? `+${s.roi.toFixed(1)}%` : `${s.roi.toFixed(1)}%`}
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
