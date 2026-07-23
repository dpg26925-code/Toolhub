import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CAT_KWS: Record<string, string[]> = {
  beauty: ["Viral", "TikTok Made", "Glow", "Skin Barrier", "Dupe", "Must-Have"],
  fashion: ["Y2K", "Aesthetic", "Trending", "Cottagecore", "Streetwear", "Everyday"],
  home: ["Cozy", "Space-Saving", "Smart", "Multi-Use", "Aesthetic", "Under $20"],
  electronics: ["Wireless", "Fast Charge", "Portable", "Pro", "2025", "RGB"],
  fitness: ["Home Gym", "Beginner", "Recovery", "Compact", "Adjustable"],
  food: ["Organic", "Small Batch", "Snack Box", "Bundle", "Gift-Ready"],
};
const EMOJIS = ["🔥","✨","💎","🌟","💯","🎁","⚡","🏆","💫","🚀"];

function titleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

export default function Tool() {
  const [kw, setKw] = useState("wireless earbuds");
  const [cat, setCat] = useState("electronics");
  const [tone, setTone] = useState<"benefit" | "emotional" | "urgency" | "curiosity">("benefit");
  const [tick, setTick] = useState(0);

  const titles = useMemo(() => {
    void tick;
    const base = titleCase(kw.trim() || "Product");
    const kws = CAT_KWS[cat] ?? CAT_KWS.electronics;
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const patterns: Record<typeof tone, string[]> = {
      benefit: [`${pick(EMOJIS)} ${base} — ${pick(kws)} & Long-Lasting`, `Best ${base} 2025 ${pick(EMOJIS)} ${pick(kws)} Design`, `${base} | ${pick(kws)} + Free Shipping`, `${base} ${pick(EMOJIS)} Loved by 10k+ Buyers`],
      emotional: [`${pick(EMOJIS)} I Wish I'd Found This ${base} Sooner`, `The ${base} That Changed My Routine ${pick(EMOJIS)}`, `Your New Favorite ${base} 🥹`, `${base} That Actually Works ${pick(EMOJIS)}`],
      urgency: [`⏰ Last Chance — ${base} 50% OFF`, `🔥 Selling Fast: ${base}`, `Limited Stock: ${pick(kws)} ${base}`, `Grab Now — ${base} ${pick(EMOJIS)}`],
      curiosity: [`Why Everyone's Talking About This ${base} ${pick(EMOJIS)}`, `The ${base} TikTok Won't Stop Buying`, `${base}: The Trick Nobody Tells You`, `You've Never Seen a ${base} Like This ${pick(EMOJIS)}`],
    };
    const list = [...patterns[tone]];
    while (list.length < 8) list.push(`${pick(EMOJIS)} ${pick(kws)} ${base} — ${pick(kws)}`);
    return list.slice(0, 8);
  }, [kw, cat, tone, tick]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Product keyword</Label><Input value={kw} onChange={(e) => setKw(e.target.value)} className="mt-1"/></div>
        <div><Label>Category</Label>
          <Select value={cat} onValueChange={setCat}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent>{Object.keys(CAT_KWS).map((c) => <SelectItem key={c} value={c}>{titleCase(c)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Tone</Label>
          <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="benefit">Benefit-driven</SelectItem><SelectItem value="emotional">Emotional</SelectItem><SelectItem value="urgency">Urgency</SelectItem><SelectItem value="curiosity">Curiosity</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={() => setTick((t) => t + 1)}>Regenerate</Button>
      <div className="space-y-2">
        {titles.map((t, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex-1">
              <div className="text-sm">{t}</div>
              <div className={`mt-1 text-xs ${t.length > 60 ? "text-destructive" : "text-muted-foreground"}`}>{t.length}/60 chars</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(t); toast.success("Copied"); }}>Copy</Button>
          </div>
        ))}
      </div>
    </div>
  );
}