import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Platform = "instagram" | "tiktok" | "twitter" | "linkedin";

const STOP = new Set("a an and are as at be but by for from has have i in is it its me my of on or that the their them these they this to us was we were will with you your".split(" "));

// keyword → related hashtag suggestions (simple mapping matrix)
const MAP: Record<string, string[]> = {
  fitness: ["fitfam", "workout", "gymlife", "fitspo", "healthylifestyle"],
  food: ["foodie", "foodporn", "instafood", "yummy", "foodphotography"],
  travel: ["wanderlust", "travelgram", "instatravel", "explore", "adventure"],
  fashion: ["ootd", "style", "streetwear", "fashionista", "outfit"],
  beauty: ["makeup", "skincare", "mua", "beautyblogger", "glam"],
  photography: ["photooftheday", "photographer", "picoftheday", "instaphoto", "shotoniphone"],
  business: ["entrepreneur", "startup", "smallbusiness", "hustle", "success"],
  marketing: ["digitalmarketing", "socialmedia", "contentmarketing", "seo", "growth"],
  tech: ["technology", "coding", "developer", "innovation", "startup"],
  art: ["artist", "artwork", "drawing", "illustration", "creative"],
  music: ["musician", "song", "musicproducer", "spotify", "livemusic"],
  gaming: ["gamer", "twitch", "esports", "gamingcommunity", "streaming"],
};

const PLATFORM_LIMITS: Record<Platform, number> = { instagram: 30, tiktok: 20, twitter: 3, linkedin: 5 };

function tokenize(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w));
}

export default function InstagramHashtagGenerator() {
  const [text, setText] = useState("Fresh sourdough recipe with photos from my Tuscany trip.");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [count, setCount] = useState("30");

  const groups = useMemo(() => {
    const words = tokenize(text);
    const seen = new Set<string>();
    const trending: string[] = [];
    const general: string[] = [];
    const niche: string[] = [];

    // trending – mapped popular tags
    for (const w of words) {
      const m = MAP[w];
      if (m) for (const t of m) { if (!seen.has(t)) { seen.add(t); trending.push("#" + t); } }
    }
    // general – single keywords
    for (const w of words) {
      if (!seen.has(w)) { seen.add(w); general.push("#" + w); }
    }
    // niche – bigrams
    const raw = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
    for (let i = 0; i < raw.length - 1; i++) {
      const a = raw[i], b = raw[i + 1];
      if (a.length < 3 || b.length < 3 || STOP.has(a) || STOP.has(b)) continue;
      const tag = a + b;
      if (!seen.has(tag)) { seen.add(tag); niche.push("#" + tag); }
    }

    const target = Math.min(parseInt(count, 10) || 30, PLATFORM_LIMITS[platform]);
    // distribute roughly 40/40/20
    const nT = Math.max(1, Math.round(target * 0.4));
    const nG = Math.max(1, Math.round(target * 0.4));
    const nN = Math.max(1, target - nT - nG);
    return {
      trending: trending.slice(0, nT),
      general: general.slice(0, nG),
      niche: niche.slice(0, nN),
      limit: PLATFORM_LIMITS[platform],
    };
  }, [text, platform, count]);

  const all = [...groups.trending, ...groups.general, ...groups.niche];

  const copy = async (list: string[], label: string) => {
    if (!list.length) return;
    await navigator.clipboard.writeText(list.join(" "));
    toast.success(`Copied ${label}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 space-y-3">
          <div>
            <Label>Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram (max 30)</SelectItem>
                <SelectItem value="tiktok">TikTok (max 20)</SelectItem>
                <SelectItem value="twitter">Twitter/X (max 3)</SelectItem>
                <SelectItem value="linkedin">LinkedIn (max 5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Hashtag count</Label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Capped at platform limit ({groups.limit}).</p>
          </div>
        </div>
        <div className="md:col-span-2">
          <Label>Post description / keywords</Label>
          <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Trending", list: groups.trending },
          { label: "General", list: groups.general },
          { label: "Niche", list: groups.niche },
        ].map((g) => (
          <div key={g.label} className="rounded-md border p-3 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">{g.label}</h3>
              <Button size="sm" variant="ghost" onClick={() => copy(g.list, g.label)} disabled={!g.list.length}>Copy</Button>
            </div>
            <p className="text-sm break-words">{g.list.join(" ") || <span className="text-muted-foreground">—</span>}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={() => copy(all, "all hashtags")} disabled={!all.length}>Copy all ({all.length})</Button>
      </div>
    </div>
  );
}