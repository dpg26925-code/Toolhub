import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Platform = "facebook" | "google" | "tiktok" | "email" | "banner" | "twitter" | "linkedin";

const PLATFORM_PARAMS: Record<Platform, Record<string, string>> = {
  facebook: { utm_source: "facebook", utm_medium: "paid-social" },
  google: { utm_source: "google", utm_medium: "cpc" },
  tiktok: { utm_source: "tiktok", utm_medium: "paid-social" },
  email: { utm_source: "newsletter", utm_medium: "email" },
  banner: { utm_source: "banner", utm_medium: "display" },
  twitter: { utm_source: "twitter", utm_medium: "social" },
  linkedin: { utm_source: "linkedin", utm_medium: "social" },
};

export default function CampaignUrlBuilder() {
  const [url, setUrl] = useState("https://example.com");
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [campaign, setCampaign] = useState("launch");
  const [content, setContent] = useState("");
  const [qr, setQr] = useState("");

  const finalUrl = useMemo(() => {
    try {
      const u = new URL(url);
      const base = PLATFORM_PARAMS[platform];
      Object.entries(base).forEach(([k, v]) => u.searchParams.set(k, v));
      if (campaign) u.searchParams.set("utm_campaign", campaign);
      if (content) u.searchParams.set("utm_content", content);
      return u.toString();
    } catch { return ""; }
  }, [url, platform, campaign, content]);

  useEffect(() => {
    if (!finalUrl) { setQr(""); return; }
    QRCode.toDataURL(finalUrl, { width: 240, margin: 1 }).then(setQr).catch(() => setQr(""));
  }, [finalUrl]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Base URL</Label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Platform</Label>
          <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="facebook">Facebook / Instagram Ads</SelectItem>
              <SelectItem value="google">Google Ads</SelectItem>
              <SelectItem value="tiktok">TikTok Ads</SelectItem>
              <SelectItem value="email">Email / Newsletter</SelectItem>
              <SelectItem value="banner">Display Banner</SelectItem>
              <SelectItem value="twitter">Twitter / X</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Campaign name</Label><Input value={campaign} onChange={(e) => setCampaign(e.target.value)} className="mt-1" /></div>
        <div><Label>Content / variant</Label><Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="hero_a" className="mt-1" /></div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-xs">
        <div className="font-semibold">Auto-added params for {platform}:</div>
        <ul className="mt-1 font-mono">
          {Object.entries(PLATFORM_PARAMS[platform]).map(([k, v]) => (<li key={k}>{k}={v}</li>))}
        </ul>
      </div>

      {finalUrl && (
        <>
          <div>
            <Label>Campaign URL</Label>
            <Textarea readOnly value={finalUrl} className="mt-1 min-h-[80px] font-mono text-xs" />
            <Button className="mt-2" onClick={() => { navigator.clipboard.writeText(finalUrl); toast.success("Copied"); }}>Copy URL</Button>
          </div>
          {qr && (
            <div>
              <Label>QR code</Label>
              <div className="mt-2 flex items-start gap-4">
                <img src={qr} alt="QR" className="rounded border bg-white p-2" width={160} height={160} />
                <Button variant="outline" size="sm" asChild><a href={qr} download="campaign-qr.png">Download</a></Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}