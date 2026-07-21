import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Platform = "blog" | "youtube" | "instagram" | "tiktok" | "email";
type Style = "short" | "full" | "button";

const NETWORKS = ["Amazon Associates", "ClickBank", "ShareASale", "Impact", "CJ Affiliate", "Rakuten", "Awin", "Partnerize"];

export default function AffiliateDisclosureGenerator() {
  const [siteName, setSiteName] = useState("My Blog");
  const [url, setUrl] = useState("https://example.com");
  const [platform, setPlatform] = useState<Platform>("blog");
  const [style, setStyle] = useState<Style>("short");
  const [networks, setNetworks] = useState<string[]>(["Amazon Associates"]);

  const toggleNet = (n: string) => setNetworks((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]);

  const text = useMemo(() => build({ siteName, url, platform, style, networks }), [siteName, url, platform, style, networks]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Site / channel name</Label><Input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="mt-1" /></div>
        <div><Label>URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Platform</Label>
          <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="blog">Blog / website</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="email">Email / newsletter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Disclosure style</Label>
          <Select value={style} onValueChange={(v) => setStyle(v as Style)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short form (inline)</SelectItem>
              <SelectItem value="full">Full page (dedicated /disclosure)</SelectItem>
              <SelectItem value="button">Button / label</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Affiliate networks</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-4">
          {NETWORKS.map((n) => (
            <label key={n} className="flex items-center gap-2 text-sm">
              <Checkbox checked={networks.includes(n)} onCheckedChange={() => toggleNet(n)} />
              {n}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Disclosure text</Label>
        <Textarea readOnly value={text} className="mt-1 min-h-[240px] font-mono text-xs" />
        <div className="mt-2 flex gap-2">
          <Button onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied"); }}>Copy</Button>
          <Button variant="outline" onClick={() => {
            const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
            const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "affiliate-disclosure.txt"; a.click();
            toast.success("Downloaded");
          }}>Download .txt</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm">
        <p className="font-semibold">Where to place it</p>
        <p className="mt-1 text-muted-foreground">
          {platform === "blog" && "Place above the first affiliate link — ideally before the fold — not buried in the footer. Link to your full /disclosure page too."}
          {platform === "youtube" && "Include in the video description AND state it verbally within the first 30 seconds. Enable YouTube's paid-promotion checkbox for sponsored content."}
          {platform === "instagram" && "Use #ad or #affiliate in the caption, add the Paid Partnership tag and disclose in Stories with the built-in label."}
          {platform === "tiktok" && "Put #ad in the caption, enable the Branded Content toggle, and say it verbally on-camera when possible."}
          {platform === "email" && "Include the disclosure near the top of the email, above the first affiliate link. A single sentence is enough."}
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Disclaimer:</strong> This template helps you comply with the US FTC Endorsement Guides. Rules vary by country (ASA in the UK, ACCC in Australia). Consult a qualified attorney for jurisdiction-specific requirements.
      </div>
    </div>
  );
}

function build(p: { siteName: string; url: string; platform: Platform; style: Style; networks: string[]; }): string {
  const netList = p.networks.length ? p.networks.join(", ") : "various affiliate networks";
  const primaryNet = p.networks[0] ?? "affiliate";
  const isAmazon = p.networks.includes("Amazon Associates");

  if (p.style === "button") {
    if (p.platform === "youtube") return `[Ad] Includes paid promotion / affiliate links`;
    if (p.platform === "instagram" || p.platform === "tiktok") return `#ad`;
    return `Ads by ${primaryNet}`;
  }

  if (p.style === "full") {
    return `AFFILIATE DISCLOSURE — ${p.siteName}

Last updated: ${new Date().toISOString().slice(0, 10)}

In compliance with the US Federal Trade Commission (FTC) 16 CFR Part 255 Endorsement Guides, this page explains how ${p.siteName} (${p.url}) earns revenue and what our relationship with the brands we cover looks like.

1. What are affiliate links?

An affiliate link is a tracked URL that pays ${p.siteName} a small commission when you click through and make a qualifying purchase — at no additional cost to you. Commissions typically range from 1% to 30% depending on the product and network.

2. Which networks do we use?

${p.siteName} participates in the following affiliate programs: ${netList}.
${isAmazon ? "\nAs an Amazon Associate we earn from qualifying purchases.\n" : ""}
3. How do we choose products?

We only recommend products we have personally used, tested or thoroughly researched. Editorial decisions are independent of commission rates — a higher-paying product will never displace a better one in our recommendations.

4. Sponsored content

Where a post is sponsored or a product was gifted, we disclose that fact clearly at the top of the post in addition to any affiliate relationship.

5. Your trust matters

If you ever have questions about a recommendation or want to check whether a link is an affiliate link, contact us at ${p.url}. Thank you for supporting ${p.siteName} — commissions from these links help keep our content free.
`;
  }

  // short form per platform
  switch (p.platform) {
    case "blog":
      return `Disclosure: This ${isAmazon ? "post contains affiliate links, including Amazon Associates links" : `post contains ${primaryNet} affiliate links`}. If you buy through them, ${p.siteName} may earn a small commission at no extra cost to you. ${isAmazon ? "As an Amazon Associate we earn from qualifying purchases." : ""}`;
    case "youtube":
      return `[Disclosure: This description contains affiliate links (${netList}). I may earn a commission if you buy through them — at no extra cost to you. Thanks for supporting the channel.]${isAmazon ? "\n\nAs an Amazon Associate I earn from qualifying purchases." : ""}`;
    case "instagram":
      return `#ad — link in bio is an affiliate link (${primaryNet}). I may earn a small commission from qualifying purchases, at no cost to you. Thanks for the support 💛`;
    case "tiktok":
      return `#ad — link in bio earns me a small commission (${primaryNet}) at no cost to you.`;
    case "email":
      return `Disclosure: This email contains affiliate links (${netList}). If you buy through them, ${p.siteName} may earn a small commission — at no extra cost to you.${isAmazon ? " As an Amazon Associate we earn from qualifying purchases." : ""}`;
  }
}
