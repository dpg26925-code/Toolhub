import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, Award, Sparkles, TrendingUp, DollarSign, ShieldCheck } from "lucide-react";

const PLATFORMS = [
  { id: "youtube", name: "YouTube", baseCpm: 28.0, platformWeight: 1.5 },
  { id: "instagram", name: "Instagram", baseCpm: 18.0, platformWeight: 1.1 },
  { id: "tiktok", name: "TikTok", baseCpm: 14.0, platformWeight: 1.0 },
  { id: "twitter", name: "Twitter / X", baseCpm: 12.0, platformWeight: 0.9 },
  { id: "podcast", name: "Podcast / Audio", baseCpm: 25.0, platformWeight: 1.4 },
  { id: "newsletter", name: "Email Newsletter", baseCpm: 32.0, platformWeight: 1.6 },
];

const NICHES = [
  { id: "tech", name: "Tech, B2B SaaS & AI", multiplier: 1.55 },
  { id: "finance", name: "Personal Finance, Real Estate & Crypto", multiplier: 1.65 },
  { id: "fitness", name: "Health, Fitness & Supplements", multiplier: 1.25 },
  { id: "beauty", name: "Beauty, Fashion & Skincare", multiplier: 1.3 },
  { id: "gaming", name: "Gaming, Hardware & Tech", multiplier: 1.15 },
  { id: "lifestyle", name: "Travel, Food & Lifestyle", multiplier: 1.05 },
];

const DELIVERABLES = [
  { id: "dedicated", name: "Dedicated Video / Feature (Full Review)", weight: 2.2 },
  { id: "integrated", name: "Integrated 60-90s Mid-roll / Shoutout", weight: 1.0 },
  { id: "short", name: "Short-form Video (Reel / TikTok / Short)", weight: 0.85 },
  { id: "static", name: "Static Image / Feed Post", weight: 0.65 },
  { id: "story", name: "Story Sequence (3 frames + Swipe Link)", weight: 0.4 },
];

export default function SponsorshipRateCalculator() {
  const [platformId, setPlatformId] = useState("youtube");
  const [audienceCount, setAudienceCount] = useState("65000");
  const [avgViews, setAvgViews] = useState("18000");
  const [engagementRate, setEngagementRate] = useState("3.8");
  const [nicheId, setNicheId] = useState("tech");
  const [deliverableId, setDeliverableId] = useState("integrated");
  const [hasUsageRights, setHasUsageRights] = useState(false); // +30%
  const [hasExclusivity, setHasExclusivity] = useState(false); // +25%
  const [hasRushTurnaround, setHasRushTurnaround] = useState(false); // +20%
  const [copied, setCopied] = useState(false);

  const selectedPlatform = PLATFORMS.find((p) => p.id === platformId) || PLATFORMS[0];
  const selectedNiche = NICHES.find((n) => n.id === nicheId) || NICHES[0];
  const selectedDeliverable = DELIVERABLES.find((d) => d.id === deliverableId) || DELIVERABLES[0];

  const pAudience = Math.max(100, parseInt(audienceCount) || 100);
  const pViews = Math.max(50, parseInt(avgViews) || 50);
  const pER = Math.max(0.1, parseFloat(engagementRate) || 2.0);

  const calc = useMemo(() => {
    // 1. Calculate Expected Reach Base (Viewership based rather than raw followers)
    // Formula: (Average Views / 1000) * Platform Base CPM * Niche Multiplier * Deliverable Weight
    const viewBaseRate = (pViews / 1000) * selectedPlatform.baseCpm * selectedNiche.multiplier * selectedDeliverable.weight;

    // Follower floor buffer: (Followers / 1000) * $10 * Niche * Deliverable
    const followerFloor = (pAudience / 1000) * 8.5 * selectedNiche.multiplier * selectedDeliverable.weight;

    // Combined base valuation (70% weight on actual views, 30% weight on follower authority)
    const rawBasePrice = (viewBaseRate * 0.7) + (followerFloor * 0.3);

    // Engagement Multiplier (ER relative to standard 2.5%)
    const erFactor = Math.max(0.7, Math.min(2.0, pER / 2.5));
    const erAdjustedPrice = rawBasePrice * erFactor;

    // Add-on clauses
    let addOnMultiplier = 1.0;
    if (hasUsageRights) addOnMultiplier += 0.3; // 30% for paid ad rights
    if (hasExclusivity) addOnMultiplier += 0.25; // 25% for 30-day competitor exclusivity
    if (hasRushTurnaround) addOnMultiplier += 0.2; // 20% for rush turnaround

    const recommendedRate = Math.max(100, erAdjustedPrice * addOnMultiplier);
    const lowRate = recommendedRate * 0.75;
    const premiumRate = recommendedRate * 1.35;

    // Package deals
    // 3-Content Bundle (15% discount)
    const bundle3Rate = (recommendedRate * 3) * 0.85;
    // Multi-Deliverable Campaign (e.g. 1 Integration + 2 Shorts + 3 Stories with 20% discount)
    const multiFormatRate = (recommendedRate * 2.2) * 0.80;

    // Implied CPM & Cost Per Engagement (CPE)
    const impliedCpm = pViews > 0 ? (recommendedRate / pViews) * 1000 : 0;
    const impliedInteractions = pViews * (pER / 100);
    const impliedCpe = impliedInteractions > 0 ? recommendedRate / impliedInteractions : 0;

    return {
      recommendedRate,
      lowRate,
      premiumRate,
      bundle3Rate,
      multiFormatRate,
      impliedCpm,
      impliedCpe,
    };
  }, [selectedPlatform, selectedNiche, selectedDeliverable, pAudience, pViews, pER, hasUsageRights, hasExclusivity, hasRushTurnaround]);

  const f = (n: number) => `$${Math.round(n).toLocaleString()}`;

  const handleCopy = async () => {
    const text = `=== Brand Sponsorship Proposal Quote ===
Platform: ${selectedPlatform.name}
Niche: ${selectedNiche.name}
Deliverable: ${selectedDeliverable.name}
Audience: ${pAudience.toLocaleString()} Followers/Subscribers | Avg Views: ${pViews.toLocaleString()}
Engagement Rate: ${pER}%

--- Standard Pricing ---
• Single Deliverable Rate: ${f(calc.recommendedRate)} (Range: ${f(calc.lowRate)} – ${f(calc.premiumRate)})
${hasUsageRights ? "• Includes 30-Day Paid Ad Whitelisting / Usage Rights (+30%)\n" : ""}${hasExclusivity ? "• Includes 30-Day Category Exclusivity (+25%)\n" : ""}${hasRushTurnaround ? "• Includes Rush Delivery (<48 hrs) (+20%)\n" : ""}
--- Value Package Bundles ---
• 3-Piece Content Bundle (15% Savings): ${f(calc.bundle3Rate)}
• Omnichannel Multi-Format Campaign (20% Savings): ${f(calc.multiFormatRate)}

*Effective Campaign CPM: ${f(calc.impliedCpm)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Sponsorship quote copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Platform", selectedPlatform.name],
      ["Niche Category", selectedNiche.name],
      ["Deliverable Format", selectedDeliverable.name],
      ["Audience Size", pAudience.toString()],
      ["Average Views", pViews.toString()],
      ["Engagement Rate (%)", `${pER}%`],
      ["Usage Rights Included", hasUsageRights ? "Yes (+30%)" : "No"],
      ["Exclusivity Included", hasExclusivity ? "Yes (+25%)" : "No"],
      ["Rush Turnaround Included", hasRushTurnaround ? "Yes (+20%)" : "No"],
      [],
      ["Pricing Tier", "Rate ($)"],
      ["Conservative / Floor Rate", Math.round(calc.lowRate).toString()],
      ["Recommended Market Rate", Math.round(calc.recommendedRate).toString()],
      ["Premium / Agency Rate", Math.round(calc.premiumRate).toString()],
      ["3-Piece Content Package", Math.round(calc.bundle3Rate).toString()],
      ["Multi-Format Campaign Package", Math.round(calc.multiFormatRate).toString()],
      ["Effective CPM ($)", calc.impliedCpm.toFixed(2)],
      ["Effective CPE ($)", calc.impliedCpe.toFixed(2)],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sponsorship_rate_card_${selectedPlatform.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV rate card downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Top Results Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended Rate</span>
          <div className="mt-1 text-3xl font-extrabold text-primary">{f(calc.recommendedRate)}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Per {selectedDeliverable.name.split("(")[0]}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Negotiation Range</span>
          <div className="mt-1 text-2xl font-bold text-foreground">
            {f(calc.lowRate)} – {f(calc.premiumRate)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Floor rate to agency rate
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">3-Piece Bundle Deal</span>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {f(calc.bundle3Rate)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            15% discount for bulk commitment
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Effective CPM</span>
          <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {f(calc.impliedCpm)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on {pViews.toLocaleString()} avg views
          </p>
        </div>
      </div>

      {/* Main Form Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Platform & Reach */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Award className="h-4 w-4 text-primary" /> Platform & Audience Reach
          </h3>

          <div>
            <Label htmlFor="platform" className="text-xs font-medium">Content Platform</Label>
            <select
              id="platform"
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="audience" className="text-xs font-medium">Followers / Subscribers</Label>
              <Input
                id="audience"
                type="number"
                min="100"
                value={audienceCount}
                onChange={(e) => setAudienceCount(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="avgViews" className="text-xs font-medium">Avg Views per Post</Label>
              <Input
                id="avgViews"
                type="number"
                min="50"
                value={avgViews}
                onChange={(e) => setAvgViews(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="er" className="text-xs font-medium">Engagement Rate (%)</Label>
              <Input
                id="er"
                type="number"
                min="0.1"
                max="30"
                step="0.1"
                value={engagementRate}
                onChange={(e) => setEngagementRate(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="niche" className="text-xs font-medium">Channel Niche</Label>
              <select
                id="niche"
                value={nicheId}
                onChange={(e) => setNicheId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {NICHES.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Deliverables & Add-ons */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-emerald-500" /> Deliverable Format & Add-on Clauses
          </h3>

          <div>
            <Label htmlFor="deliverable" className="text-xs font-medium">Sponsorship Deliverable</Label>
            <select
              id="deliverable"
              value={deliverableId}
              onChange={(e) => setDeliverableId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {DELIVERABLES.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5 rounded-lg border bg-muted/20 p-3 text-xs">
            <Label className="font-semibold text-muted-foreground uppercase text-[11px]">Usage Rights & Clauses</Label>
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={hasUsageRights}
                onChange={(e) => setHasUsageRights(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Paid Ad Whitelisting & Digital Usage Rights (+30%)</span>
            </label>
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={hasExclusivity}
                onChange={(e) => setHasExclusivity(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>30-Day Competitor Category Exclusivity (+25%)</span>
            </label>
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={hasRushTurnaround}
                onChange={(e) => setHasRushTurnaround(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Rush Turnaround (&lt;48 Hours) (+20%)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Proposal Summary & Action Buttons */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">Pitch Proposal Quote Generator</h3>
            <p className="text-xs text-muted-foreground">Ready-to-send rate card snippet for brand outreach emails</p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadCsv} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" onClick={handleCopy} className="h-8 text-xs gap-1 font-semibold">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied Proposal!" : "Copy Proposal Quote"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="text-xs text-muted-foreground font-medium">Single Deliverable</div>
            <div className="mt-1 text-xl font-bold text-foreground">{f(calc.recommendedRate)}</div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{selectedDeliverable.name.split("(")[0]}</p>
          </div>

          <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/20 p-3 border-emerald-200">
            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">3-Post Campaign Bundle</div>
            <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{f(calc.bundle3Rate)}</div>
            <p className="mt-0.5 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Includes 15% bundle incentive</p>
          </div>

          <div className="rounded-lg border bg-purple-50 dark:bg-purple-950/20 p-3 border-purple-200">
            <div className="text-xs text-purple-800 dark:text-purple-300 font-medium">Multi-Format Campaign</div>
            <div className="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400">{f(calc.multiFormatRate)}</div>
            <p className="mt-0.5 text-[11px] text-purple-700/80 dark:text-purple-400/80">Full ecosystem campaign (20% off)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
