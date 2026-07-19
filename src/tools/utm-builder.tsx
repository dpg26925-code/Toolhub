import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Preset = { name: string; params: Partial<Record<"source" | "medium" | "campaign" | "term" | "content", string>> };
const PRESETS: Preset[] = [
  { name: "Google Ads", params: { source: "google", medium: "cpc" } },
  { name: "Facebook Ads", params: { source: "facebook", medium: "paid-social" } },
  { name: "Email Campaign", params: { source: "newsletter", medium: "email" } },
  { name: "TikTok", params: { source: "tiktok", medium: "paid-social" } },
];

export default function UtmBuilder() {
  const [url, setUrl] = useState("https://example.com");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [qr, setQr] = useState<string>("");

  const finalUrl = useMemo(() => {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (source) u.searchParams.set("utm_source", source);
      if (medium) u.searchParams.set("utm_medium", medium);
      if (campaign) u.searchParams.set("utm_campaign", campaign);
      if (term) u.searchParams.set("utm_term", term);
      if (content) u.searchParams.set("utm_content", content);
      return u.toString();
    } catch {
      return "";
    }
  }, [url, source, medium, campaign, term, content]);

  useEffect(() => {
    if (!finalUrl) { setQr(""); return; }
    QRCode.toDataURL(finalUrl, { width: 240, margin: 1 }).then(setQr).catch(() => setQr(""));
  }, [finalUrl]);

  const applyPreset = (p: Preset) => {
    if (p.params.source) setSource(p.params.source);
    if (p.params.medium) setMedium(p.params.medium);
    toast.success(`Applied ${p.name}`);
  };

  const missing = [
    !source && "utm_source",
    !medium && "utm_medium",
    !campaign && "utm_campaign",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <div>
        <Label>Website URL</Label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/landing" className="mt-1" />
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.name} size="sm" variant="outline" onClick={() => applyPreset(p)}>{p.name}</Button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>utm_source *</Label><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="google" className="mt-1" /></div>
        <div><Label>utm_medium *</Label><Input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="cpc" className="mt-1" /></div>
        <div className="sm:col-span-2"><Label>utm_campaign *</Label><Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="spring_sale" className="mt-1" /></div>
        <div><Label>utm_term</Label><Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="running+shoes" className="mt-1" /></div>
        <div><Label>utm_content</Label><Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="banner_a" className="mt-1" /></div>
      </div>

      {missing.length > 0 && (
        <p className="text-xs text-muted-foreground">Missing recommended: {missing.join(", ")}</p>
      )}

      {finalUrl && (
        <div className="space-y-3">
          <div>
            <Label>Generated URL</Label>
            <Textarea readOnly value={finalUrl} className="mt-1 min-h-[80px] font-mono text-xs" />
            <div className="mt-2 flex gap-2">
              <Button onClick={() => { navigator.clipboard.writeText(finalUrl); toast.success("Copied"); }}>Copy URL</Button>
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(`<a href="${finalUrl}">Link</a>`); toast.success("HTML copied"); }}>Copy HTML</Button>
            </div>
          </div>
          {qr && (
            <div>
              <Label>QR Code</Label>
              <div className="mt-2 flex items-start gap-4">
                <img src={qr} alt="QR code" className="rounded border bg-white p-2" width={160} height={160} />
                <Button variant="outline" size="sm" asChild>
                  <a href={qr} download="utm-qr.png">Download QR</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {url && !finalUrl && <p className="text-sm text-destructive">Invalid URL — include https://</p>}
    </div>
  );
}