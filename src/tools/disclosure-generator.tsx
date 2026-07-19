import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Platform = "blog" | "youtube" | "instagram" | "tiktok" | "twitter" | "email";
type Relationship = "affiliate" | "sponsored" | "gifted";
type Tone = "short" | "detailed" | "casual" | "professional";

const TEMPLATES: Record<string, string> = {
  "blog|affiliate|short": "Disclosure: This post contains affiliate links. If you buy through them we may earn a small commission at no extra cost to you.",
  "blog|affiliate|detailed": "Affiliate Disclosure: Some links in this article are affiliate links, meaning that at no additional cost to you, we may earn a commission if you click through and make a purchase. We only recommend products we've personally used or thoroughly researched. This helps support our work and keeps our content free — thank you.",
  "blog|affiliate|casual": "Heads up! A few links in this post are affiliate links — if you buy, I get a little kickback (at no cost to you). Thanks for supporting the blog!",
  "blog|affiliate|professional": "In accordance with FTC guidelines, please assume that any product links in this article are affiliate links. We may receive compensation for purchases made through these links.",
  "blog|sponsored|short": "Disclosure: This post is sponsored. All opinions are our own.",
  "blog|sponsored|detailed": "Sponsored Post Disclosure: This article was created in partnership with [Brand]. While we received compensation to feature the product, all opinions, testing and recommendations are our own and reflect our honest experience.",
  "youtube|affiliate|short": "Some links in the description are affiliate links — I may earn a commission if you buy through them, at no extra cost to you.",
  "youtube|affiliate|detailed": "Affiliate Disclosure: Links below marked as affiliate links pay me a small commission when you make a purchase, at absolutely no cost to you. This supports the channel and lets me keep making free videos. I only recommend products I've personally tested and believe in.",
  "youtube|sponsored|short": "This video is sponsored by [Brand]. Thanks for supporting the sponsors that keep this channel running.",
  "instagram|affiliate|short": "#ad — link in bio is an affiliate link, meaning I may earn a small commission from purchases.",
  "instagram|affiliate|detailed": "#affiliate — I earn a small commission from qualifying purchases made through the link in my bio. This costs you nothing extra and helps me keep sharing content I love. Thanks for the support! 💛",
  "instagram|sponsored|short": "#ad Paid partnership with @brand",
  "instagram|gifted|short": "#gifted by @brand — all thoughts are my own.",
  "tiktok|affiliate|short": "#ad — link in bio earns me a small commission at no cost to you.",
  "tiktok|sponsored|short": "#ad in partnership with @brand",
  "twitter|affiliate|short": "Disclosure: Affiliate link — I may earn a small commission. #ad",
  "twitter|sponsored|short": "#ad — sponsored by @brand",
  "email|affiliate|short": "Disclosure: This email contains affiliate links. If you buy through them we may earn a small commission, at no extra cost to you.",
  "email|affiliate|detailed": "Affiliate Disclosure: To keep this newsletter free, we sometimes include affiliate links. That means we may earn a commission when you click and buy — never at extra cost to you. We only recommend products we've personally used and would tell a friend about.",
};

function pick(platform: Platform, rel: Relationship, tone: Tone): string {
  const exact = TEMPLATES[`${platform}|${rel}|${tone}`];
  if (exact) return exact;
  const fallbackTone = TEMPLATES[`${platform}|${rel}|short`];
  if (fallbackTone) return fallbackTone;
  return TEMPLATES[`blog|${rel}|${tone}`] ?? TEMPLATES["blog|affiliate|short"];
}

export default function DisclosureGenerator() {
  const [platform, setPlatform] = useState<Platform>("blog");
  const [relationship, setRelationship] = useState<Relationship>("affiliate");
  const [tone, setTone] = useState<Tone>("short");

  const text = useMemo(() => pick(platform, relationship, tone), [platform, relationship, tone]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Platform</Label>
          <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="blog">Blog / Website</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="twitter">Twitter / X</SelectItem>
              <SelectItem value="email">Email / Newsletter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Relationship</Label>
          <Select value={relationship} onValueChange={(v) => setRelationship(v as Relationship)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="affiliate">Affiliate links</SelectItem>
              <SelectItem value="sponsored">Sponsored / paid</SelectItem>
              <SelectItem value="gifted">Gifted product</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tone</Label>
          <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Disclosure text</Label>
        <Textarea readOnly value={text} className="mt-1 min-h-[140px]" />
        <Button className="mt-2" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied"); }}>
          Copy disclosure
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm">
        <p className="font-semibold">Where to place it</p>
        <p className="mt-1 text-muted-foreground">
          {platform === "blog" && "Place above the first affiliate link — ideally before the fold — not buried in a footer."}
          {platform === "youtube" && "Say it verbally in the first 30 seconds AND include it in the description."}
          {platform === "instagram" && "Include #ad or #affiliate in the caption AND use the Paid Partnership tag."}
          {platform === "tiktok" && "Include #ad in the caption and enable Branded Content toggle for paid posts."}
          {platform === "twitter" && "Add #ad to the tweet itself — not in a reply or thread."}
          {platform === "email" && "Put the disclosure near the top of the email, above the first link."}
        </p>
      </div>
    </div>
  );
}