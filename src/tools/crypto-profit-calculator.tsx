import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, Coins, Sparkles, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const COIN_PRESETS = [
  { symbol: "BTC", name: "Bitcoin", defaultBuy: 65000, defaultSell: 95000 },
  { symbol: "ETH", name: "Ethereum", defaultBuy: 3200, defaultSell: 5000 },
  { symbol: "SOL", name: "Solana", defaultBuy: 180, defaultSell: 350 },
  { symbol: "BNB", name: "BNB", defaultBuy: 580, defaultSell: 900 },
  { symbol: "XRP", name: "XRP", defaultBuy: 0.60, defaultSell: 1.50 },
  { symbol: "DOGE", name: "Dogecoin", defaultBuy: 0.15, defaultSell: 0.45 },
];

const EXCHANGES = [
  { name: "Binance (0.10%)", fee: 0.10 },
  { name: "Bybit (0.06%)", fee: 0.06 },
  { name: "Coinbase Advanced (0.40%)", fee: 0.40 },
  { name: "Kraken (0.16%)", fee: 0.16 },
  { name: "KuCoin (0.10%)", fee: 0.10 },
];

export default function CryptoProfitCalculator() {
  const [positionType, setPositionType] = useState<"long" | "short">("long");
  const [inputMode, setInputMode] = useState<"fiat" | "coins">("fiat");
  const [investmentAmount, setInvestmentAmount] = useState("5000");
  const [coinQuantity, setCoinQuantity] = useState("0.0769");
  const [buyPrice, setBuyPrice] = useState("65000");
  const [sellPrice, setSellPrice] = useState("95000");
  const [tradingFeeRate, setTradingFeeRate] = useState("0.10"); // 0.1% per trade
  const [leverage, setLeverage] = useState("1"); // 1x spot
  const [taxRatePercent, setTaxRatePercent] = useState("20"); // 20% capital gains tax
  const [copied, setCopied] = useState(false);

  const pBuy = Math.max(0.000001, parseFloat(buyPrice) || 1);
  const pSell = Math.max(0.000001, parseFloat(sellPrice) || 1);
  const pFee = Math.max(0, parseFloat(tradingFeeRate) || 0) / 100;
  const pLev = Math.max(1, Math.min(100, parseFloat(leverage) || 1));
  const pTax = Math.min(60, Math.max(0, parseFloat(taxRatePercent) || 0)) / 100;

  // Sync fiat amount vs coin quantity
  const handleInvestmentChange = (val: string) => {
    setInvestmentAmount(val);
    const num = parseFloat(val) || 0;
    if (pBuy > 0) setCoinQuantity((num / pBuy).toFixed(6));
  };

  const handleCoinQuantityChange = (val: string) => {
    setCoinQuantity(val);
    const num = parseFloat(val) || 0;
    setInvestmentAmount((num * pBuy).toFixed(2));
  };

  const handleApplyCoin = (c: typeof COIN_PRESETS[0]) => {
    setBuyPrice(String(c.defaultBuy));
    setSellPrice(String(c.defaultSell));
    const fiat = parseFloat(investmentAmount) || 5000;
    setCoinQuantity((fiat / c.defaultBuy).toFixed(6));
    toast.info(`Loaded ${c.name} (${c.symbol})`);
  };

  const calc = useMemo(() => {
    const principal = inputMode === "fiat" ? parseFloat(investmentAmount) || 0 : (parseFloat(coinQuantity) || 0) * pBuy;
    const coins = pBuy > 0 ? (principal * pLev) / pBuy : 0;

    // Entry Fee = Position Size * Fee %
    const entryFee = (principal * pLev) * pFee;

    // Position Exit Value
    let grossValue = 0;
    let priceDiff = 0;

    if (positionType === "long") {
      grossValue = coins * pSell;
      priceDiff = pSell - pBuy;
    } else {
      // Short position: profit when sellPrice < buyPrice
      priceDiff = pBuy - pSell;
      grossValue = (principal * pLev) + (coins * priceDiff);
    }

    const exitFee = grossValue * pFee;
    const totalTradingFees = entryFee + exitFee;

    // Gross P&L
    const rawProfit = (coins * priceDiff);
    const profitBeforeTax = rawProfit - totalTradingFees;

    // Tax Estimation
    const taxAmount = profitBeforeTax > 0 ? profitBeforeTax * pTax : 0;
    const netProfit = profitBeforeTax - taxAmount;

    // Total Cash Received after close
    const finalPayout = Math.max(0, principal + netProfit);

    // ROI %
    const roi = principal > 0 ? (netProfit / principal) * 100 : 0;
    const priceChangePercent = pBuy > 0 ? ((pSell - pBuy) / pBuy) * 100 : 0;

    // Breakeven Exit Price
    // Long: pBuy * (1 + pFee) / (1 - pFee)
    // Short: pBuy * (1 - pFee) / (1 + pFee)
    const breakEvenPrice = positionType === "long"
      ? (pBuy * (1 + pFee)) / (1 - pFee)
      : (pBuy * (1 - pFee)) / (1 + pFee);

    return {
      principal,
      coins,
      entryFee,
      exitFee,
      totalTradingFees,
      rawProfit,
      taxAmount,
      netProfit,
      finalPayout,
      roi,
      priceChangePercent,
      breakEvenPrice,
    };
  }, [pBuy, pSell, pFee, pLev, pTax, inputMode, investmentAmount, coinQuantity, positionType]);

  // Target Exit Price Scenarios Table
  const scenarios = useMemo(() => {
    const percentages = [-50, -25, -10, 0, 10, 25, 50, 100, 200, 500];
    return percentages.map((pct) => {
      const targetPrice = pBuy * (1 + pct / 100);
      const priceDiff = positionType === "long" ? targetPrice - pBuy : pBuy - targetPrice;
      const profit = (calc.coins * priceDiff) - calc.totalTradingFees;
      const tax = profit > 0 ? profit * pTax : 0;
      const net = profit - tax;
      const r = calc.principal > 0 ? (net / calc.principal) * 100 : 0;
      return {
        pct,
        targetPrice,
        net,
        roi: r,
      };
    });
  }, [pBuy, calc.coins, calc.principal, calc.totalTradingFees, pTax, positionType]);

  const f = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleCopy = async () => {
    const text = `=== Crypto Profit & Loss Calculation ===
Trade Position: ${positionType.toUpperCase()} (${pLev}x Leverage)
Initial Capital: ${f(calc.principal)} (${calc.coins.toFixed(6)} Coins)
Entry Buy Price: ${f(pBuy)}
Exit Target Price: ${f(pSell)} (${calc.priceChangePercent >= 0 ? "+" : ""}${calc.priceChangePercent.toFixed(2)}%)
Breakeven Price: ${f(calc.breakEvenPrice)}

--- P&L Breakdown ---
Gross Profit: ${f(calc.rawProfit)}
Exchange Fees (Entry+Exit): -${f(calc.totalTradingFees)}
Estimated Taxes (${(pTax * 100).toFixed(0)}%): -${f(calc.taxAmount)}
----------------------------------------
NET PROFIT / LOSS: ${f(calc.netProfit)}
Return on Investment (ROI): ${calc.roi.toFixed(2)}%
Final Wallet Balance: ${f(calc.finalPayout)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Crypto profit summary copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Position Direction", positionType.toUpperCase()],
      ["Leverage Multiplier", `${pLev}x`],
      ["Initial Investment ($)", calc.principal.toFixed(2)],
      ["Coin Position Size", calc.coins.toFixed(6)],
      ["Buy Price ($)", pBuy.toFixed(4)],
      ["Sell Target Price ($)", pSell.toFixed(4)],
      ["Price Change (%)", `${calc.priceChangePercent.toFixed(2)}%`],
      ["Breakeven Price ($)", calc.breakEvenPrice.toFixed(4)],
      ["Trading Fees ($)", calc.totalTradingFees.toFixed(2)],
      ["Estimated Tax ($)", calc.taxAmount.toFixed(2)],
      ["Gross Profit ($)", calc.rawProfit.toFixed(2)],
      ["Net Profit / Loss ($)", calc.netProfit.toFixed(2)],
      ["ROI (%)", `${calc.roi.toFixed(2)}%`],
      ["Final Balance ($)", calc.finalPayout.toFixed(2)],
      [],
      ["Target Price Scenario (%)", "Exit Price ($)", "Net Profit ($)", "ROI (%)"],
      ...scenarios.map((s) => [`${s.pct >= 0 ? "+" : ""}${s.pct}%`, s.targetPrice.toFixed(2), s.net.toFixed(2), `${s.roi.toFixed(2)}%`]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crypto_profit_calc_${pBuy}_to_${pSell}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Quick Coin Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Popular Cryptos:</span>
        {COIN_PRESETS.map((c) => (
          <Button
            key={c.symbol}
            size="sm"
            variant="outline"
            onClick={() => handleApplyCoin(c)}
            className="h-7 text-xs font-medium"
          >
            <Coins className="mr-1 h-3 w-3 text-amber-500" />
            {c.symbol}
          </Button>
        ))}
      </div>

      {/* Top Results Banner */}
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
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Payout</span>
          <div className="mt-1 text-3xl font-bold text-foreground">
            {f(calc.finalPayout)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            From {f(calc.principal)} invested
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Breakeven Price</span>
          <div className="mt-1 text-2xl font-bold text-foreground">
            {f(calc.breakEvenPrice)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Covers {f(calc.totalTradingFees)} exchange fees
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated Tax</span>
          <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {f(calc.taxAmount)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            At {(pTax * 100).toFixed(0)}% capital gains rate
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Prices & Trade Position */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" /> Entry & Exit Prices
            </h3>

            {/* Long vs Short Toggle */}
            <div className="flex rounded-lg border bg-muted/40 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPositionType("long")}
                className={`rounded-md px-2.5 py-1 ${positionType === "long" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
              >
                Long (Buy)
              </button>
              <button
                type="button"
                onClick={() => setPositionType("short")}
                className={`rounded-md px-2.5 py-1 ${positionType === "short" ? "bg-rose-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
              >
                Short (Sell)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="buyPrice" className="text-xs font-medium">Buy / Entry Price ($)</Label>
              <Input
                id="buyPrice"
                type="number"
                min="0.000001"
                step="any"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="sellPrice" className="text-xs font-medium">Sell / Target Exit Price ($)</Label>
              <Input
                id="sellPrice"
                type="number"
                min="0.000001"
                step="any"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="investment" className="text-xs font-medium">Initial Capital ($)</Label>
              <Input
                id="investment"
                type="number"
                min="1"
                step="any"
                value={investmentAmount}
                onChange={(e) => handleInvestmentChange(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="quantity" className="text-xs font-medium">Crypto Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0.000001"
                step="any"
                value={coinQuantity}
                onChange={(e) => handleCoinQuantityChange(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Fees, Leverage & Taxes */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-primary" /> Fees, Leverage & Taxes
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="exchangeFee" className="text-xs font-medium">Exchange Fee / Trade (%)</Label>
              <Input
                id="exchangeFee"
                type="number"
                min="0"
                max="5"
                step="0.01"
                value={tradingFeeRate}
                onChange={(e) => setTradingFeeRate(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="taxRate" className="text-xs font-medium">Capital Gains Tax (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="60"
                step="1"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="leverage" className="text-xs font-medium">Futures / Margin Leverage: {leverage}x</Label>
              <span className="text-[11px] text-muted-foreground">{leverage === "1" ? "1x (Spot Trading)" : `${leverage}x Leverage`}</span>
            </div>
            <div className="mt-1.5 flex gap-1.5">
              {[1, 2, 5, 10, 20].map((lev) => (
                <Button
                  key={lev}
                  type="button"
                  size="sm"
                  variant={leverage === String(lev) ? "default" : "outline"}
                  onClick={() => setLeverage(String(lev))}
                  className="h-7 text-xs flex-1"
                >
                  {lev}x
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-2.5 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">💡 Exchange Fee Presets</p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {EXCHANGES.map((ex) => (
                <button
                  key={ex.name}
                  type="button"
                  onClick={() => setTradingFeeRate(ex.fee.toFixed(2))}
                  className="rounded bg-muted px-2 py-0.5 text-[11px] hover:bg-muted/80 font-mono"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Target Price Scenarios Table */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">Exit Price Target Matrix & Potential Returns</h3>
            <p className="text-xs text-muted-foreground">What happens to your profit if price moves -50% to +500%</p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadCsv} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" onClick={handleCopy} className="h-8 text-xs gap-1 font-semibold">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy P&L Report"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-left font-semibold">
              <tr>
                <th className="p-2.5">Price Move</th>
                <th className="p-2.5">Target Coin Price</th>
                <th className="p-2.5">Net Profit / Loss ($)</th>
                <th className="p-2.5 text-right">Net ROI (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scenarios.map((s) => (
                <tr key={s.pct} className={s.pct === 0 ? "bg-muted/20 font-semibold" : ""}>
                  <td className="p-2.5 font-mono">
                    <span className={s.pct > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : s.pct < 0 ? "text-destructive font-bold" : ""}>
                      {s.pct >= 0 ? `+${s.pct}%` : `${s.pct}%`}
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
