import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Platform = "youtube" | "blog" | "twitter" | "instagram";

const LIMITS: Record<Platform, number> = { youtube: 70, blog: 60, twitter: 280, instagram: 125 };

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function lower(s: string) { return s.charAt(0).toLowerCase() + s.slice(1); }

const FRAMES = [
  (t: string) => `${cap(t)}: The Complete Guide`,
  (t: string) => `How to ${lower(t)} in 5 minutes`,
  (t: string) => `7 things nobody tells you about ${lower(t)}`,
  (t: string) => `The truth about ${lower(t)}`,
  (t: string) => `Why ${lower(t)} is smarter than you think`,
  (t: string) => `Stop wasting time on ${lower(t)} — do this instead`,
  (t: string) => `${cap(t)} for beginners (2025 edition)`,
  (t: string) => `I tried ${lower(t)} for 30 days — here's what happened`,
  (t: string) => `The ${lower(t)} playbook that actually works`,
  (t: string) => `${cap(t)}, explained in under 60 seconds`,
];

const SEO_FRAMES = [
  (t: string) => `${cap(t)} — Best Practices, Tools & Examples`,
  (t: string) => `Ultimate ${cap(t)} Guide for 2025`,
  (t: string) => `${cap(t)}: Step-by-Step Tutorial`,
  (t: string) => `${cap(t)} vs Alternatives — What to Pick`,
  (t: string) => `${cap(t)} Checklist: Everything You Need`,
];

export default function SocialMediaTitleGenerator() {
  const [topic, setTopic] = useState("email marketing for solopreneurs");
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [seo, setSeo] = useState(false);

  const titles = useMemo(() => {
    const limit = LIMITS[platform];
    const frames = seo ? [...SEO_FRAMES, ...FRAMES] : FRAMES;
    return frames.map((f) => f(topic || "your topic")).filter((t) => t.length <= limit).slice(0, 10);
  }, [topic, platform, seo]);

  const copy = async (t: string) => { await navigator.clipboard.writeText(t); toast.success("Copied"); };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label>Topic</Label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div>
          <Label>Platform</Label>
          <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube ({LIMITS.youtube})</SelectItem>
              <SelectItem value="blog">Blog / Meta title ({LIMITS.blog})</SelectItem>
              <SelectItem value="twitter">Twitter / X ({LIMITS.twitter})</SelectItem>
              <SelectItem value="instagram">Instagram ({LIMITS.instagram})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="seo" checked={seo} onCheckedChange={setSeo} />
        <Label htmlFor="seo">SEO mode (favor keyword-first titles)</Label>
      </div>

      <div className="space-y-2">
        {titles.length === 0 && <p className="text-sm text-muted-foreground">No titles fit within {LIMITS[platform]} characters — try a shorter topic.</p>}
        {titles.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={() => copy(t)}
            className="w-full text-left rounded-md border px-3 py-2 hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{t}</span>
              <span className="text-xs text-muted-foreground shrink-0">{t.length}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}