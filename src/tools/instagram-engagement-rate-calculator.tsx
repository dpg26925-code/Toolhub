import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, Instagram, Sparkles, TrendingUp, Award, DollarSign } from "lucide-react";

const NICHES = [
  { id: "beauty", name: "Fashion & Beauty", cpe: 0.14, baseMultiplier: 1.2 },
  { id: "fitness", name: "Fitness, Health & Wellness", cpe: 0.16, baseMultiplier: 1.25 },
  { id: "tech", name: "Tech, Gadgets & Gaming", cpe: 0.20, baseMultiplier: 1.4 },
  { id: "finance", name: "Business, Career & Finance", cpe: 0.25, baseMultiplier: 1.5 },
  { id: "travel", name: "Travel, Food & Lifestyle", cpe: 0.12, baseMultiplier: 1.1 },
  { id: "entertainment", name: "Comedy & Entertainment", cpe: 0.08, baseMultiplier: 0.9 },
];

export default function InstagramEngagementRateCalculator() {
  const [followers, setFollowers] = useState("45000");
  const [avgLikes, setAvgLikes] = useState("1800");
  const [avgComments, setAvgComments] = useState("120");
  const [avgSaves, setAvgSaves] = useState("85");
  const [samplePostsCount, setSamplePostsCount] = useState("12");
  const [nicheId, setNicheId] = useState("beauty");
  const [copied, setCopied] = useState(false);

  const pFollowers = Math.max(1, parseInt(followers) || 1);
  const pLikes = Math.max(0, parseFloat(avgLikes) || 0);
  const pComments = Math.max(0, parseFloat(avgComments) || 0);
  const pSaves = Math.max(0, parseFloat(avgSaves) || 0);
  const pSample = Math.max(1, parseInt(samplePostsCount) || 1);

  const selectedNiche = NICHES.find((n) => n.id === nicheId) || NICHES[0];

  const calc = useMemo(() => {
    const totalInteractionsPerPost = pLikes + pComments + pSaves;

    // Standard ER formula: (Total Engagements / Followers) * 100
    const engagementRate = pFollowers > 0 ? (totalInteractionsPerPost / pFollowers) * 100 : 0;
    const likesRatio = pFollowers > 0 ? (pLikes / pFollowers) * 100 : 0;
    const commentsRatio = pFollowers > 0 ? (pComments / pFollowers) * 100 : 0;

    // Determine Creator Tier
    let tierName = "Micro Influencer";
    let benchmarkER = 3.8; // average benchmark for micro
    if (pFollowers < 10000) {
      tierName = "Nano Influencer (1k–10k)";
      benchmarkER = 5.0;
    } else if (pFollowers <= 50000) {
      tierName = "Micro Influencer (10k–50k)";
      benchmarkER = 3.6;
    } else if (pFollowers <= 500000) {
      tierName = "Mid-Tier Creator (50k–500k)";
      benchmarkER = 2.4;
    } else if (pFollowers <= 1000000) {
      tierName = "Macro Influencer (500k–1M)";
      benchmarkER = 1.8;
    } else {
      tierName = "Mega / Celebrity (1M+)";
      benchmarkER = 1.2;
    }

    // Determine ER Rating
    let rating = "Good";
    let badgeColor = "text-blue-600 dark:text-blue-400 border-blue-200 bg-blue-50 dark:bg-blue-950/30";
    if (engagementRate >= 6.0) {
      rating = "🔥 Viral / Exceptional";
      badgeColor = "text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30";
    } else if (engagementRate >= 3.5) {
      rating = "✨ High Engagement";
      badgeColor = "text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30";
    } else if (engagementRate >= 1.5) {
      rating = "👍 Average / Standard";
      badgeColor = "text-blue-600 dark:text-blue-400 border-blue-200 bg-blue-50 dark:bg-blue-950/30";
    } else {
      rating = "⚠️ Low Engagement";
      badgeColor = "text-amber-600 dark:text-amber-400 border-amber-200 bg-amber-50 dark:bg-amber-950/30";
    }

    // Suggested Sponsorship Pricing based on follower tier, ER strength, and niche CPE
    // Base formula: (Followers * $10 per 10k) * (ER / benchmarkER) * nicheMultiplier
    const erMultiplier = Math.max(0.5, Math.min(2.5, engagementRate / benchmarkER));
    const basePostRate = (pFollowers * 0.01) * erMultiplier * selectedNiche.baseMultiplier;

    const ratePostLow = Math.max(50, basePostRate * 0.8);
    const ratePostHigh = Math.max(80, basePostRate * 1.3);

    const rateReelLow = ratePostLow * 1.4;
    const rateReelHigh = ratePostHigh * 1.5;

    const rateStoryLow = ratePostLow * 0.35;
    const rateStoryHigh = ratePostHigh * 0.45;

    const rateCarouselLow = ratePostLow * 1.15;
    const rateCarouselHigh = ratePostHigh * 1.2;

    return {
      totalInteractionsPerPost,
      engagementRate,
      likesRatio,
      commentsRatio,
      tierName,
      benchmarkER,
      rating,
      badgeColor,
      ratePostLow,
      ratePostHigh,
      rateReelLow,
      rateReelHigh,
      rateStoryLow,
      rateStoryHigh,
      rateCarouselLow,
      rateCarouselHigh,
    };
  }, [pFollowers, pLikes, pComments, pSaves, selectedNiche]);

  const f = (n: number) => `$${Math.round(n).toLocaleString()}`;

  const handleCopy = async () => {
    const text = `=== Instagram Creator Media Kit Metrics ===
Followers: ${pFollowers.toLocaleString()}
Audience Tier: ${calc.tierName}
Niche: ${selectedNiche.name}

--- Engagement Metrics (Last ${pSample} Posts Avg) ---
Average Likes: ${pLikes.toLocaleString()}
Average Comments: ${pComments.toLocaleString()}
Average Saves/Shares: ${pSaves.toLocaleString()}
Total Engagement per Post: ${calc.totalInteractionsPerPost.toLocaleString()}
ENGAGEMENT RATE (ER): ${calc.engagementRate.toFixed(2)}%
Status: ${calc.rating} (Industry Benchmark for Tier: ${calc.benchmarkER.toFixed(1)}%)

--- Suggested Brand Sponsorship Rates ---
• Instagram Reel (60s): ${f(calc.rateReelLow)} – ${f(calc.rateReelHigh)}
• Static Feed Post: ${f(calc.ratePostLow)} – ${f(calc.ratePostHigh)}
• Multi-Slide Carousel: ${f(calc.rateCarouselLow)} – ${f(calc.rateCarouselHigh)}
• Instagram Story Set: ${f(calc.rateStoryLow)} – ${f(calc.rateStoryHigh)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Instagram metrics & rate pitch copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Followers", pFollowers.toString()],
      ["Audience Tier", calc.tierName],
      ["Niche Category", selectedNiche.name],
      ["Avg Likes / Post", pLikes.toString()],
      ["Avg Comments / Post", pComments.toString()],
      ["Avg Saves / Shares", pSaves.toString()],
      ["Engagement Rate (%)", `${calc.engagementRate.toFixed(2)}%`],
      ["Industry Benchmark ER (%)", `${calc.benchmarkER.toFixed(2)}%`],
      ["Quality Rating", calc.rating],
      [],
      ["Content Format", "Suggested Low Rate ($)", "Suggested High Rate ($)"],
      ["Instagram Reel", Math.round(calc.rateReelLow).toString(), Math.round(calc.rateReelHigh).toString()],
      ["Static Feed Post", Math.round(calc.ratePostLow).toString(), Math.round(calc.ratePostHigh).toString()],
      ["Carousel Post", Math.round(calc.rateCarouselLow).toString(), Math.round(calc.rateCarouselHigh).toString()],
      ["Instagram Story", Math.round(calc.rateStoryLow).toString(), Math.round(calc.rateStoryHigh).toString()],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `instagram_er_report_${pFollowers}_followers.csv`);
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
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Engagement Rate</span>
          <div className="mt-1 text-3xl font-extrabold text-primary">
            {calc.engagementRate.toFixed(2)}%
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {calc.totalInteractionsPerPost.toLocaleString()} engagements / post
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quality Rating</span>
          <div className="mt-1 text-xl font-bold truncate">
            {calc.rating}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Tier benchmark: <strong>{calc.benchmarkER.toFixed(1)}%</strong>
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested Reel Rate</span>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {f(calc.rateReelLow)} – {f(calc.rateReelHigh)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Per sponsored video
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Creator Tier</span>
          <div className="mt-1 text-base font-bold text-foreground truncate">
            {calc.tierName}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {pFollowers.toLocaleString()} followers
          </p>
        </div>
      </div>

      {/* Main Form Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Post Metrics */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Instagram className="h-4 w-4 text-pink-500" /> Account & Post Engagement
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="followers" className="text-xs font-medium">Total Followers</Label>
              <Input
                id="followers"
                type="number"
                min="100"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="sampleCount" className="text-xs font-medium">Sample Posts Count</Label>
              <Input
                id="sampleCount"
                type="number"
                min="1"
                max="50"
                value={samplePostsCount}
                onChange={(e) => setSamplePostsCount(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="avgLikes" className="text-xs font-medium">Avg Likes</Label>
              <Input
                id="avgLikes"
                type="number"
                min="0"
                value={avgLikes}
                onChange={(e) => setAvgLikes(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="avgComments" className="text-xs font-medium">Avg Comments</Label>
              <Input
                id="avgComments"
                type="number"
                min="0"
                value={avgComments}
                onChange={(e) => setAvgComments(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="avgSaves" className="text-xs font-medium">Avg Saves/Shares</Label>
              <Input
                id="avgSaves"
                type="number"
                min="0"
                value={avgSaves}
                onChange={(e) => setAvgSaves(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Tip: For the most accurate result, take the average of your last 12 normal feed posts (excluding extreme viral outliers).
          </p>
        </div>

        {/* Right Column: Niche & Sponsorship Valuation */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> Niche & Brand Deal Benchmark
          </h3>

          <div>
            <Label htmlFor="niche" className="text-xs font-medium">Content Niche / Category</Label>
            <select
              id="niche"
              value={nicheId}
              onChange={(e) => setNicheId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {NICHES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Likes to Follower Ratio:</span>
              <span className="font-mono font-bold text-foreground">{calc.likesRatio.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Comments to Follower Ratio:</span>
              <span className="font-mono font-bold text-foreground">{calc.commentsRatio.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between border-t pt-1.5">
              <span className="font-semibold text-muted-foreground">Tier Industry Average ER:</span>
              <span className="font-mono font-bold text-primary">{calc.benchmarkER.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Sponsorship Rate Card Table */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">Suggested Sponsorship Rate Card</h3>
            <p className="text-xs text-muted-foreground">Based on your {calc.engagementRate.toFixed(2)}% ER and {selectedNiche.name} niche valuation</p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadCsv} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" onClick={handleCopy} className="h-8 text-xs gap-1 font-semibold">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Pitch Kit"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Instagram Reel</div>
            <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {f(calc.rateReelLow)} – {f(calc.rateReelHigh)}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Highest reach & demand</p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Static Feed Post</div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {f(calc.ratePostLow)} – {f(calc.ratePostHigh)}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Permanent grid placement</p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Carousel (3–5 slides)</div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {f(calc.rateCarouselLow)} – {f(calc.rateCarouselHigh)}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">High save & share rates</p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Story Set (3 frames + link)</div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {f(calc.rateStoryLow)} – {f(calc.rateStoryHigh)}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Direct click-through conversion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
