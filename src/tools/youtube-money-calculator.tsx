import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, Video, Sparkles, TrendingUp, DollarSign } from "lucide-react";

const NICHES = [
  { id: "finance", name: "Personal Finance, Investing & Crypto", avgCpm: 18.5, lowCpm: 12.0, highCpm: 32.0 },
  { id: "tech", name: "Tech, SaaS, AI & Software Development", avgCpm: 12.5, lowCpm: 8.0, highCpm: 22.0 },
  { id: "business", name: "Business, Marketing & E-Commerce", avgCpm: 14.0, lowCpm: 9.0, highCpm: 25.0 },
  { id: "education", name: "Education, Science & History", avgCpm: 8.5, lowCpm: 5.0, highCpm: 14.0 },
  { id: "health", name: "Health, Fitness & Nutrition", avgCpm: 7.5, lowCpm: 4.5, highCpm: 12.5 },
  { id: "lifestyle", name: "Lifestyle, Travel & Vlogging", avgCpm: 5.0, lowCpm: 3.0, highCpm: 8.5 },
  { id: "gaming", name: "Gaming & Esports", avgCpm: 3.2, lowCpm: 1.8, highCpm: 5.5 },
  { id: "entertainment", name: "Entertainment, Comedy & Pop Culture", avgCpm: 3.0, lowCpm: 1.5, highCpm: 5.0 },
  { id: "music", name: "Music & Art", avgCpm: 2.2, lowCpm: 1.0, highCpm: 4.0 },
];

export default function YouTubeMoneyCalculator() {
  const [viewsInput, setViewsInput] = useState("25000");
  const [viewPeriod, setViewPeriod] = useState<"daily" | "monthly">("daily");
  const [nicheId, setNicheId] = useState("tech");
  const [cpmRate, setCpmRate] = useState("12.50");
  const [monetizedPlaybacksPercent, setMonetizedPlaybacksPercent] = useState("65");
  const [videoLengthType, setVideoLengthType] = useState<"standard" | "long" | "shorts">("standard");
  const [monthlySponsorships, setMonthlySponsorships] = useState("500");
  const [copied, setCopied] = useState(false);

  const selectedNiche = NICHES.find((n) => n.id === nicheId) || NICHES[0];

  const handleNicheChange = (id: string) => {
    setNicheId(id);
    const n = NICHES.find((item) => item.id === id);
    if (n) {
      setCpmRate(n.avgCpm.toFixed(2));
    }
  };

  const pViews = Math.max(0, parseInt(viewsInput) || 0);
  const pCpm = Math.max(0.1, parseFloat(cpmRate) || 0.1);
  const pMonetizedRatio = Math.min(100, Math.max(5, parseFloat(monetizedPlaybacksPercent) || 60)) / 100;
  const pSponsors = Math.max(0, parseFloat(monthlySponsorships) || 0);

  const calc = useMemo(() => {
    // Standardize to Daily Views
    const dailyViews = viewPeriod === "daily" ? pViews : pViews / 30;
    const monthlyViews = dailyViews * 30;
    const yearlyViews = dailyViews * 365;

    // Mid-roll multiplier for videos > 8 minutes (can fit 2-3 ad breaks)
    // Shorts CPM is drastically lower (pool revenue share model ~$0.04 - $0.10 RPM)
    let lengthMultiplier = 1.0;
    if (videoLengthType === "long") lengthMultiplier = 1.45; // ~45% boost from mid-rolls
    if (videoLengthType === "shorts") lengthMultiplier = 0.08; // Shorts revenue is ~8% of long form

    // YouTube Partner Program split: 55% to creator, 45% to YouTube
    const creatorRevShare = 0.55;

    // Gross CPM adjusted for video format
    const effectiveCpm = pCpm * lengthMultiplier;

    // RPM = Revenue Per 1,000 Total Views received by creator
    // Formula: (Effective CPM * Monetized Ratio * 55% Creator Share)
    const effectiveRpm = (effectiveCpm * pMonetizedRatio * creatorRevShare);

    // AdSense Estimated Earnings
    const dailyAdSense = (dailyViews / 1000) * effectiveRpm;
    const monthlyAdSense = (monthlyViews / 1000) * effectiveRpm;
    const yearlyAdSense = (yearlyViews / 1000) * effectiveRpm;

    // Total Earnings including sponsorships & affiliate revenue
    const dailyTotal = dailyAdSense + (pSponsors / 30);
    const monthlyTotal = monthlyAdSense + pSponsors;
    const yearlyTotal = yearlyAdSense + (pSponsors * 12);

    return {
      dailyViews,
      monthlyViews,
      yearlyViews,
      effectiveCpm,
      effectiveRpm,
      dailyAdSense,
      monthlyAdSense,
      yearlyAdSense,
      dailyTotal,
      monthlyTotal,
      yearlyTotal,
    };
  }, [pViews, viewPeriod, pCpm, pMonetizedRatio, videoLengthType, pSponsors]);

  // Milestone Views Comparison
  const milestones = useMemo(() => {
    const volumes = [5000, 10000, 25000, 50000, 100000, 500000, 1000000];
    return volumes.map((v) => {
      const adMonthly = (v * 30 / 1000) * calc.effectiveRpm;
      const adYearly = adMonthly * 12;
      return {
        daily: v,
        monthly: v * 30,
        monthlyRev: adMonthly,
        yearlyRev: adYearly,
      };
    });
  }, [calc.effectiveRpm]);

  const f = (n: number) => `$${n.toFixed(2)}`;

  const handleCopy = async () => {
    const text = `=== YouTube Channel Revenue Projection ===
Niche: ${selectedNiche.name}
Daily Views: ${calc.dailyViews.toLocaleString()} (${calc.monthlyViews.toLocaleString()} / mo)
Video Format: ${videoLengthType.toUpperCase()}
Advertiser CPM: ${f(calc.effectiveCpm)}
Estimated Creator RPM: ${f(calc.effectiveRpm)} (per 1k total views)

--- Earnings Forecast ---
Daily AdSense: ${f(calc.dailyAdSense)}
Monthly AdSense: ${f(calc.monthlyAdSense)}
Monthly Sponsorships/Affiliate: ${f(pSponsors)}
TOTAL MONTHLY INCOME: ${f(calc.monthlyTotal)}
TOTAL ANNUAL PROJECTION: ${f(calc.yearlyTotal)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("YouTube earnings projection copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Daily", "Monthly", "Annual"],
      ["Views", Math.round(calc.dailyViews).toString(), Math.round(calc.monthlyViews).toString(), Math.round(calc.yearlyViews).toString()],
      ["Advertiser CPM ($)", calc.effectiveCpm.toFixed(2), "", ""],
      ["Creator RPM ($)", calc.effectiveRpm.toFixed(2), "", ""],
      ["AdSense Earnings ($)", calc.dailyAdSense.toFixed(2), calc.monthlyAdSense.toFixed(2), calc.yearlyAdSense.toFixed(2)],
      ["Sponsorships & Affiliates ($)", (pSponsors / 30).toFixed(2), pSponsors.toFixed(2), (pSponsors * 12).toFixed(2)],
      ["Total Combined Income ($)", calc.dailyTotal.toFixed(2), calc.monthlyTotal.toFixed(2), calc.yearlyTotal.toFixed(2)],
      [],
      ["Daily View Milestone", "Monthly Views", "Monthly Ad Revenue ($)", "Annual Ad Revenue ($)"],
      ...milestones.map((m) => [m.daily.toString(), m.monthly.toString(), m.monthlyRev.toFixed(2), m.yearlyRev.toFixed(2)]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `youtube_money_estimate_${Math.round(calc.dailyViews)}_views.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV forecast downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Top Results Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated Monthly Income</span>
          <div className="mt-1 text-3xl font-extrabold text-primary">{f(calc.monthlyTotal)}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {f(calc.dailyTotal)} / day
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Annual Projection</span>
          <div className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {f(calc.yearlyTotal)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            At current viewership pace
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Net RPM</span>
          <div className="mt-1 text-3xl font-bold text-foreground">
            {f(calc.effectiveRpm)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Earnings per 1,000 total views
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly AdSense Alone</span>
          <div className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {f(calc.monthlyAdSense)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            From {Math.round(calc.monthlyViews).toLocaleString()} views
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Views & Formats */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Video className="h-4 w-4 text-primary" /> Viewership & Video Format
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="views" className="text-xs font-medium">Channel Views</Label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setViewPeriod("daily")}
                    className={`font-semibold ${viewPeriod === "daily" ? "text-primary underline" : "text-muted-foreground"}`}
                  >
                    Daily
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setViewPeriod("monthly")}
                    className={`font-semibold ${viewPeriod === "monthly" ? "text-primary underline" : "text-muted-foreground"}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <Input
                id="views"
                type="number"
                min="100"
                value={viewsInput}
                onChange={(e) => setViewsInput(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="sponsors" className="text-xs font-medium">Monthly Sponsorships ($)</Label>
              <Input
                id="sponsors"
                type="number"
                min="0"
                value={monthlySponsorships}
                onChange={(e) => setMonthlySponsorships(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Video Content Format</Label>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={videoLengthType === "standard" ? "default" : "outline"}
                onClick={() => setVideoLengthType("standard")}
                className="h-8 text-xs font-normal"
              >
                Standard (&lt;8 min)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={videoLengthType === "long" ? "default" : "outline"}
                onClick={() => setVideoLengthType("long")}
                className="h-8 text-xs font-normal"
              >
                Long (&gt;8 min Mid-rolls)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={videoLengthType === "shorts" ? "default" : "outline"}
                onClick={() => setVideoLengthType("shorts")}
                className="h-8 text-xs font-normal"
              >
                YouTube Shorts
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="monetizedRatio" className="text-xs font-medium">
              Monetized Playbacks Rate: {monetizedPlaybacksPercent}%
            </Label>
            <Input
              id="monetizedRatio"
              type="number"
              min="10"
              max="95"
              value={monetizedPlaybacksPercent}
              onChange={(e) => setMonetizedPlaybacksPercent(e.target.value)}
              className="mt-1 font-mono text-sm"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Industry average is ~50% - 70% due to ad-blockers, Premium viewers, and non-monetized regions.
            </p>
          </div>
        </div>

        {/* Right Column: Niche & CPM */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-emerald-500" /> Channel Niche & CPM Benchmarks
          </h3>

          <div>
            <Label htmlFor="niche" className="text-xs font-medium">Channel Topic / Niche Preset</Label>
            <select
              id="niche"
              value={nicheId}
              onChange={(e) => handleNicheChange(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {NICHES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} (${n.avgCpm.toFixed(2)} CPM avg)
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="cpm" className="text-xs font-medium">Advertiser CPM ($ per 1k ad impressions)</Label>
            <Input
              id="cpm"
              type="number"
              min="0.1"
              step="0.5"
              value={cpmRate}
              onChange={(e) => setCpmRate(e.target.value)}
              className="mt-1 font-mono text-sm"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Niche range: ${selectedNiche.lowCpm.toFixed(2)} – ${selectedNiche.highCpm.toFixed(2)}</span>
              <button
                type="button"
                onClick={() => setCpmRate(selectedNiche.avgCpm.toFixed(2))}
                className="text-primary hover:underline"
              >
                Reset to Avg
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1">
            <p className="font-semibold text-foreground">💡 How YouTube Pays Creators</p>
            <p className="text-muted-foreground text-[11px]">
              YouTube passes <strong>55% of net ad revenue</strong> to long-form creators. Your RPM ({f(calc.effectiveRpm)}) accounts for monetized playback ratios and the platform split.
            </p>
          </div>
        </div>
      </div>

      {/* View Milestones Table */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">Viewership Milestones vs Ad Revenue Forecast</h3>
            <p className="text-xs text-muted-foreground">Projected monthly and annual YouTube earnings at scale</p>
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
                <th className="p-2.5">Daily Views</th>
                <th className="p-2.5">Monthly Views</th>
                <th className="p-2.5">Estimated Monthly AdSense</th>
                <th className="p-2.5 text-right">Annual AdSense Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {milestones.map((m) => (
                <tr key={m.daily}>
                  <td className="p-2.5 font-mono font-medium">{m.daily.toLocaleString()} views/day</td>
                  <td className="p-2.5 font-mono text-muted-foreground">{m.monthly.toLocaleString()}</td>
                  <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{f(m.monthlyRev)}</td>
                  <td className="p-2.5 font-mono text-right font-semibold">{f(m.yearlyRev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
