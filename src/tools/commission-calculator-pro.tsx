import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, Plus, Trash2, TrendingUp, Sparkles, DollarSign } from "lucide-react";

type Tier = {
  id: string;
  minSales: number;
  maxSales: number | null; // null for unlimited
  rate: number; // percentage
};

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "USD ($)" },
  { code: "EUR", symbol: "€", name: "EUR (€)" },
  { code: "GBP", symbol: "£", name: "GBP (£)" },
  { code: "CAD", symbol: "CA$", name: "CAD (CA$)" },
  { code: "AUD", symbol: "A$", name: "AUD (A$)" },
  { code: "PHP", symbol: "₱", name: "PHP (₱)" },
  { code: "VND", symbol: "₫", name: "VND (₫)" },
  { code: "JPY", symbol: "¥", name: "JPY (¥)" },
  { code: "INR", symbol: "₹", name: "INR (₹)" },
  { code: "BRL", symbol: "R$", name: "BRL (R$)" },
];

const PRESET_TIERS: Tier[] = [
  { id: "1", minSales: 1, maxSales: 10, rate: 5 },
  { id: "2", minSales: 11, maxSales: 50, rate: 8 },
  { id: "3", minSales: 51, maxSales: 100, rate: 12 },
  { id: "4", minSales: 101, maxSales: null, rate: 15 },
];

export default function CommissionCalculatorPro() {
  const [salePrice, setSalePrice] = useState("120");
  const [commissionType, setCommissionType] = useState<"percentage" | "fixed" | "tiered">("tiered");
  const [percentageRate, setPercentageRate] = useState("10");
  const [fixedAmount, setFixedAmount] = useState("25");
  const [salesVolume, setSalesVolume] = useState("35");
  const [currency, setCurrency] = useState("USD");
  const [bonus, setBonus] = useState("0");
  const [tiers, setTiers] = useState<Tier[]>(PRESET_TIERS);
  const [copied, setCopied] = useState(false);

  const curr = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const fmt = (n: number) => {
    if (currency === "VND" || currency === "JPY") {
      return `${curr.symbol}${Math.round(n).toLocaleString()}`;
    }
    return `${curr.symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const pSalePrice = Math.max(0, parseFloat(salePrice) || 0);
  const pSalesVolume = Math.max(0, parseInt(salesVolume) || 0);
  const pPercentageRate = Math.max(0, parseFloat(percentageRate) || 0);
  const pFixedAmount = Math.max(0, parseFloat(fixedAmount) || 0);
  const pBonus = Math.max(0, parseFloat(bonus) || 0);

  // Calculation logic
  const calculation = useMemo(() => {
    const grossRevenue = pSalePrice * pSalesVolume;
    let baseCommission = 0;
    const tierBreakdown: { tierLabel: string; units: number; rate: number; earnings: number }[] = [];

    if (commissionType === "percentage") {
      baseCommission = grossRevenue * (pPercentageRate / 100);
    } else if (commissionType === "fixed") {
      baseCommission = pFixedAmount * pSalesVolume;
    } else {
      // Tiered calculation
      let remainingUnits = pSalesVolume;
      for (const tier of tiers) {
        if (remainingUnits <= 0) break;
        const tierCap = tier.maxSales !== null ? tier.maxSales - tier.minSales + 1 : remainingUnits;
        const unitsInThisTier = Math.min(remainingUnits, Math.max(0, tierCap));

        if (unitsInThisTier > 0) {
          const tierGross = unitsInThisTier * pSalePrice;
          const tierEarnings = tierGross * (tier.rate / 100);
          baseCommission += tierEarnings;
          tierBreakdown.push({
            tierLabel: tier.maxSales ? `${tier.minSales} - ${tier.maxSales} sales` : `${tier.minSales}+ sales`,
            units: unitsInThisTier,
            rate: tier.rate,
            earnings: tierEarnings,
          });
          remainingUnits -= unitsInThisTier;
        }
      }
    }

    const totalEarnings = baseCommission + pBonus;
    const effectiveRate = grossRevenue > 0 ? (totalEarnings / grossRevenue) * 100 : 0;
    const avgPerSale = pSalesVolume > 0 ? totalEarnings / pSalesVolume : 0;

    // Projections (assuming volume is monthly)
    const dailyEarnings = totalEarnings / 30;
    const weeklyEarnings = (totalEarnings * 12) / 52;
    const monthlyEarnings = totalEarnings;
    const annualEarnings = totalEarnings * 12;

    return {
      grossRevenue,
      baseCommission,
      totalEarnings,
      effectiveRate,
      avgPerSale,
      tierBreakdown,
      projections: {
        daily: dailyEarnings,
        weekly: weeklyEarnings,
        monthly: monthlyEarnings,
        annual: annualEarnings,
      },
    };
  }, [pSalePrice, pSalesVolume, commissionType, pPercentageRate, pFixedAmount, pBonus, tiers]);

  // Dynamic multi-volume simulation table
  const volumeSimulation = useMemo(() => {
    const sampleVolumes = [5, 10, 25, 50, 100, 200, 500];
    return sampleVolumes.map((vol) => {
      let comm = 0;
      if (commissionType === "percentage") {
        comm = vol * pSalePrice * (pPercentageRate / 100);
      } else if (commissionType === "fixed") {
        comm = vol * pFixedAmount;
      } else {
        let rem = vol;
        for (const t of tiers) {
          if (rem <= 0) break;
          const cap = t.maxSales !== null ? t.maxSales - t.minSales + 1 : rem;
          const u = Math.min(rem, Math.max(0, cap));
          comm += u * pSalePrice * (t.rate / 100);
          rem -= u;
        }
      }
      const gross = vol * pSalePrice;
      const rate = gross > 0 ? (comm / gross) * 100 : 0;
      return { volume: vol, gross, commission: comm, effectiveRate: rate };
    });
  }, [pSalePrice, commissionType, pPercentageRate, pFixedAmount, tiers]);

  const handleCopy = async () => {
    const text = `=== Commission Calculator Pro Summary ===
Currency: ${curr.code}
Sale Price: ${fmt(pSalePrice)}
Sales Volume: ${pSalesVolume} units
Gross Sales Revenue: ${fmt(calculation.grossRevenue)}
Commission Model: ${commissionType.toUpperCase()}
Total Commission: ${fmt(calculation.totalEarnings)}
Average per Sale: ${fmt(calculation.avgPerSale)}
Effective Rate: ${calculation.effectiveRate.toFixed(2)}%

--- Projections ---
Monthly Earnings: ${fmt(calculation.projections.monthly)}
Annual Earnings: ${fmt(calculation.projections.annual)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Commission summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Sale Price", pSalePrice.toString()],
      ["Sales Volume", pSalesVolume.toString()],
      ["Gross Revenue", calculation.grossRevenue.toFixed(2)],
      ["Commission Model", commissionType],
      ["Base Commission", calculation.baseCommission.toFixed(2)],
      ["Fixed Bonus", pBonus.toFixed(2)],
      ["Total Earnings", calculation.totalEarnings.toFixed(2)],
      ["Effective Commission Rate (%)", calculation.effectiveRate.toFixed(2)],
      ["Monthly Projection", calculation.projections.monthly.toFixed(2)],
      ["Annual Projection", calculation.projections.annual.toFixed(2)],
      [],
      ["Volume Scenario", "Gross Revenue", "Total Commission", "Effective Rate (%)"],
      ...volumeSimulation.map((v) => [v.volume.toString(), v.gross.toFixed(2), v.commission.toFixed(2), `${v.effectiveRate.toFixed(2)}%`]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `commission_projection_${salesVolume}_sales.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded!");
  };

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier ? (lastTier.maxSales ? lastTier.maxSales + 1 : lastTier.minSales + 50) : 1;
    const newTier: Tier = {
      id: Date.now().toString(),
      minSales: newMin,
      maxSales: newMin + 49,
      rate: lastTier ? lastTier.rate + 3 : 5,
    };
    setTiers([...tiers, newTier]);
  };

  const handleUpdateTier = (id: string, field: keyof Tier, value: number | null) => {
    setTiers(tiers.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleRemoveTier = (id: string) => {
    if (tiers.length <= 1) {
      toast.error("You must have at least one tier.");
      return;
    }
    setTiers(tiers.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Results Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Commission</span>
          <div className="mt-1 text-3xl font-extrabold text-primary">{fmt(calculation.totalEarnings)}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            From {fmt(calculation.grossRevenue)} gross sales
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Effective Rate</span>
          <div className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {calculation.effectiveRate.toFixed(2)}%
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Avg {fmt(calculation.avgPerSale)} per unit sold
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Estimate</span>
          <div className="mt-1 text-3xl font-bold text-foreground">{fmt(calculation.projections.monthly)}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {fmt(calculation.projections.weekly)} / week
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Annual Projection</span>
          <div className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">{fmt(calculation.projections.annual)}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            At current sales pace
          </p>
        </div>
      </div>

      {/* Inputs Section */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="text-sm font-semibold">Commission Parameters</h3>
            <p className="text-xs text-muted-foreground">Configure your product pricing, commission type, and volume targets</p>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="currencySelect" className="text-xs font-medium text-muted-foreground">Currency:</Label>
            <select
              id="currencySelect"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-8 rounded-md border bg-background px-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Structure Selector */}
        <div>
          <Label className="text-xs font-medium">Commission Structure</Label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={commissionType === "percentage" ? "default" : "outline"}
              size="sm"
              onClick={() => setCommissionType("percentage")}
              className="h-9 text-xs"
            >
              Percentage Rate (%)
            </Button>
            <Button
              type="button"
              variant={commissionType === "fixed" ? "default" : "outline"}
              size="sm"
              onClick={() => setCommissionType("fixed")}
              className="h-9 text-xs"
            >
              Fixed Amount / Sale
            </Button>
            <Button
              type="button"
              variant={commissionType === "tiered" ? "default" : "outline"}
              size="sm"
              onClick={() => setCommissionType("tiered")}
              className="h-9 text-xs"
            >
              Tiered Volume Brackets
            </Button>
          </div>
        </div>

        {/* Core Inputs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="salePrice" className="text-xs font-medium">Sale Price Per Unit ({curr.symbol})</Label>
            <Input
              id="salePrice"
              type="number"
              min="0"
              step="any"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="mt-1 font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="salesVolume" className="text-xs font-medium">Number of Sales (Units)</Label>
            <Input
              id="salesVolume"
              type="number"
              min="1"
              value={salesVolume}
              onChange={(e) => setSalesVolume(e.target.value)}
              className="mt-1 font-mono text-sm"
            />
          </div>

          {commissionType === "percentage" && (
            <div>
              <Label htmlFor="percentageRate" className="text-xs font-medium">Commission Rate (%)</Label>
              <Input
                id="percentageRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={percentageRate}
                onChange={(e) => setPercentageRate(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          )}

          {commissionType === "fixed" && (
            <div>
              <Label htmlFor="fixedAmount" className="text-xs font-medium">Fixed Payout / Unit ({curr.symbol})</Label>
              <Input
                id="fixedAmount"
                type="number"
                min="0"
                step="any"
                value={fixedAmount}
                onChange={(e) => setFixedAmount(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          )}

          <div>
            <Label htmlFor="bonus" className="text-xs font-medium">Fixed Bonus / Accelerator ({curr.symbol})</Label>
            <Input
              id="bonus"
              type="number"
              min="0"
              step="any"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              className="mt-1 font-mono text-sm"
            />
          </div>
        </div>

        {/* Tier Builder */}
        {commissionType === "tiered" && (
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tiered Volume Brackets
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Higher sales unlock higher commission rates progressively.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddTier} className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" /> Add Tier
              </Button>
            </div>

            <div className="space-y-2">
              {tiers.map((tier, idx) => (
                <div key={tier.id} className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2 text-xs">
                  <span className="w-14 font-semibold text-muted-foreground">Tier {idx + 1}:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">From</span>
                    <Input
                      type="number"
                      min="1"
                      value={tier.minSales}
                      onChange={(e) => handleUpdateTier(tier.id, "minSales", parseInt(e.target.value) || 1)}
                      className="h-7 w-16 font-mono text-xs"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      placeholder="Max (unlimited)"
                      value={tier.maxSales ?? ""}
                      onChange={(e) => handleUpdateTier(tier.id, "maxSales", e.target.value ? parseInt(e.target.value) : null)}
                      className="h-7 w-20 font-mono text-xs"
                    />
                    <span className="text-muted-foreground">sales:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={tier.rate}
                      onChange={(e) => handleUpdateTier(tier.id, "rate", parseFloat(e.target.value) || 0)}
                      className="h-7 w-16 font-mono text-xs font-bold text-primary"
                    />
                    <span className="font-semibold">%</span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTier(tier.id)}
                    className="ml-auto h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tier Breakdown Output (if tiered) */}
      {commissionType === "tiered" && calculation.tierBreakdown.length > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Current Tier Application ({salesVolume} Units)
          </h4>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-left font-semibold">
                <tr>
                  <th className="p-2.5">Bracket</th>
                  <th className="p-2.5">Units in Tier</th>
                  <th className="p-2.5">Commission Rate</th>
                  <th className="p-2.5 text-right">Tier Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {calculation.tierBreakdown.map((t, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-medium">{t.tierLabel}</td>
                    <td className="p-2.5 font-mono">{t.units} units</td>
                    <td className="p-2.5 font-mono text-primary font-semibold">{t.rate}%</td>
                    <td className="p-2.5 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {fmt(t.earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multi-Volume Simulation Table */}
      <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Earnings by Volume Scenario
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Compare commission earnings across different volume benchmarks
            </p>
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
                <th className="p-2.5">Sales Units</th>
                <th className="p-2.5">Gross Revenue</th>
                <th className="p-2.5">Total Commission</th>
                <th className="p-2.5">Effective Rate</th>
                <th className="p-2.5 text-right">Avg / Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {volumeSimulation.map((v) => (
                <tr key={v.volume} className={v.volume === pSalesVolume ? "bg-primary/5 font-semibold" : ""}>
                  <td className="p-2.5 font-mono">
                    {v.volume} sales {v.volume === pSalesVolume && <span className="ml-1 text-[10px] text-primary">(current)</span>}
                  </td>
                  <td className="p-2.5 font-mono text-muted-foreground">{fmt(v.gross)}</td>
                  <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{fmt(v.commission)}</td>
                  <td className="p-2.5 font-mono">{v.effectiveRate.toFixed(1)}%</td>
                  <td className="p-2.5 font-mono text-right">{fmt(v.commission / v.volume)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
