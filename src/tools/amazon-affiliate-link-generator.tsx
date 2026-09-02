import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, ExternalLink, QrCode, Sparkles, ShieldCheck, AlertCircle, Download } from "lucide-react";
import QRCode from "qrcode";

const DOMAINS = [
  { id: "amazon.com", name: "United States (amazon.com)", suffix: "-20" },
  { id: "amazon.co.uk", name: "United Kingdom (amazon.co.uk)", suffix: "-21" },
  { id: "amazon.ca", name: "Canada (amazon.ca)", suffix: "-20" },
  { id: "amazon.de", name: "Germany (amazon.de)", suffix: "-21" },
  { id: "amazon.fr", name: "France (amazon.fr)", suffix: "-21" },
  { id: "amazon.co.jp", name: "Japan (amazon.co.jp)", suffix: "-22" },
  { id: "amazon.it", name: "Italy (amazon.it)", suffix: "-21" },
  { id: "amazon.es", name: "Spain (amazon.es)", suffix: "-21" },
  { id: "amazon.in", name: "India (amazon.in)", suffix: "-21" },
  { id: "amazon.com.au", name: "Australia (amazon.com.au)", suffix: "-22" },
];

const PRESETS = [
  { name: "AirPods Pro", asin: "B0D1XD1ZV3", tag: "mydeals-20" },
  { name: "Kindle Paperwhite", asin: "B09SWW583J", tag: "readclub-20" },
  { name: "Sony WH-1000XM5", asin: "B09XS7JWHH", tag: "audiotech-20" },
];

export default function AmazonAffiliateLinkGenerator() {
  const [rawInput, setRawInput] = useState("https://www.amazon.com/dp/B0D1XD1ZV3");
  const [tag, setTag] = useState("partner-20");
  const [domain, setDomain] = useState("amazon.com");
  const [channelId, setChannelId] = useState("");
  const [linkType, setLinkType] = useState<"product" | "cart" | "search">("product");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showQr, setShowQr] = useState(false);

  // Extract ASIN from URL or raw string
  const asin = useMemo(() => {
    const trimmed = rawInput.trim();
    if (!trimmed) return "";

    // If it's already a 10-char alphanumeric string
    if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }

    // Try extracting from Amazon URL patterns: /dp/ASIN, /gp/product/ASIN, /d/ASIN, /ASIN/
    const dpMatch = trimmed.match(/(?:\/dp\/|\/gp\/product\/|\/d\/|\/ASIN\/)([A-Z0-9]{10})/i);
    if (dpMatch && dpMatch[1]) return dpMatch[1].toUpperCase();

    // Check query params if any: ?asin=ASIN or ?ASIN=ASIN
    try {
      const parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const paramAsin = parsedUrl.searchParams.get("asin") || parsedUrl.searchParams.get("ASIN");
      if (paramAsin && /^[A-Z0-9]{10}$/i.test(paramAsin)) {
        return paramAsin.toUpperCase();
      }
    } catch {
      // not a valid URL
    }

    return "";
  }, [rawInput]);

  const isAsinValid = asin.length === 10;
  const isTagValid = tag.trim().length >= 3 && /^[a-zA-Z0-9-_]+$/.test(tag.trim());

  // Auto-detect domain if URL is pasted
  useEffect(() => {
    try {
      if (rawInput.includes("amazon.")) {
        const url = new URL(rawInput.startsWith("http") ? rawInput : `https://${rawInput}`);
        const host = url.hostname.replace(/^www\./, "");
        const matched = DOMAINS.find((d) => d.id === host);
        if (matched) setDomain(matched.id);
      }
    } catch {
      // ignore
    }
  }, [rawInput]);

  // Construct generated affiliate URL
  const generatedUrl = useMemo(() => {
    if (!isTagValid) return "";
    const cleanTag = tag.trim();
    const cleanChannel = channelId.trim();

    if (linkType === "search") {
      const q = encodeURIComponent(searchQuery.trim() || asin || "deals");
      let url = `https://www.${domain}/s?k=${q}&tag=${cleanTag}&linkCode=ll2`;
      if (cleanChannel) url += `&ascsubtag=${encodeURIComponent(cleanChannel)}`;
      return url;
    }

    if (!isAsinValid) return "";

    if (linkType === "cart") {
      let url = `https://www.${domain}/gp/aws/cart/add.html?ASIN.1=${asin}&Quantity.1=1&tag=${cleanTag}&linkCode=as2`;
      if (cleanChannel) url += `&ascsubtag=${encodeURIComponent(cleanChannel)}`;
      return url;
    }

    // Standard direct product link
    let url = `https://www.${domain}/dp/${asin}?tag=${cleanTag}&linkCode=ll1`;
    if (cleanChannel) url += `&ascsubtag=${encodeURIComponent(cleanChannel)}`;
    return url;
  }, [domain, tag, channelId, linkType, asin, searchQuery, isAsinValid, isTagValid]);

  // Generate QR Code
  useEffect(() => {
    if (!generatedUrl) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(generatedUrl, { width: 280, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [generatedUrl]);

  const handleCopy = async () => {
    if (!generatedUrl) {
      toast.error("Please provide a valid ASIN and Associate Tag");
      return;
    }
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("Affiliate link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `amazon-affiliate-${asin || "link"}-qr.png`;
    a.click();
  };

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setRawInput(p.asin);
    setTag(p.tag);
    setLinkType("product");
    toast.info(`Loaded preset: ${p.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Quick Presets:</span>
        {PRESETS.map((p) => (
          <Button key={p.asin} size="sm" variant="outline" onClick={() => handleApplyPreset(p)} className="h-7 text-xs">
            <Sparkles className="mr-1 h-3 w-3 text-amber-500" />
            {p.name}
          </Button>
        ))}
      </div>

      {/* Main Configuration Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Product & Region */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
            Product Information
          </h3>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="rawInput" className="text-xs font-medium">
                Amazon Product URL or 10-char ASIN <span className="text-destructive">*</span>
              </Label>
              {asin ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> ASIN: {asin}
                </span>
              ) : rawInput.trim() ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" /> Invalid ASIN
                </span>
              ) : null}
            </div>
            <Input
              id="rawInput"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="e.g. https://www.amazon.com/dp/B0D1XD1ZV3 or B0D1XD1ZV3"
              className="mt-1 font-mono text-sm"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Paste any Amazon link (standard, short, or mobile) or enter the 10-character ASIN directly.
            </p>
          </div>

          <div>
            <Label htmlFor="domain" className="text-xs font-medium">Amazon Marketplace / Country</Label>
            <select
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs font-medium">Link Destination Type</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={linkType === "product" ? "default" : "outline"}
                size="sm"
                onClick={() => setLinkType("product")}
                className="h-8 text-xs"
              >
                Direct Product
              </Button>
              <Button
                type="button"
                variant={linkType === "cart" ? "default" : "outline"}
                size="sm"
                onClick={() => setLinkType("cart")}
                className="h-8 text-xs"
              >
                Direct to Cart
              </Button>
              <Button
                type="button"
                variant={linkType === "search" ? "default" : "outline"}
                size="sm"
                onClick={() => setLinkType("search")}
                className="h-8 text-xs"
              >
                Search Results
              </Button>
            </div>
          </div>

          {linkType === "search" && (
            <div>
              <Label htmlFor="searchQuery" className="text-xs font-medium">Search Keyword / Query</Label>
              <Input
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. wireless noise cancelling headphones"
                className="mt-1 text-sm"
              />
            </div>
          )}
        </div>

        {/* Right Column: Tracking & Affiliate ID */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
            Tracking Parameters
          </h3>

          <div>
            <Label htmlFor="tag" className="text-xs font-medium">
              Amazon Associate Store ID / Tag <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. mywebsitename-20"
              className="mt-1 font-mono text-sm"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Your unique Associate tracking tag assigned in your Amazon Associates portal.
            </p>
          </div>

          <div>
            <Label htmlFor="channelId" className="text-xs font-medium">
              SubID / Channel ID <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="channelId"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="e.g. blog_sidebar, email_newsletter, tiktok_bio"
              className="mt-1 font-mono text-sm"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Passed via <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">ascsubtag</code> for campaign attribution.
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">💡 Compliance Tip</p>
            <p className="mt-0.5">
              Amazon Associates Operating Agreement requires you to clearly disclose affiliate links (e.g. <em>&quot;As an Amazon Associate I earn from qualifying purchases&quot;</em>).
            </p>
          </div>
        </div>
      </div>

      {/* Output Result Card */}
      <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Generated Affiliate Link</span>
            <p className="text-xs text-muted-foreground">100% compliant, standard Amazon Associates tracking URL</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQr(!showQr)}
              disabled={!generatedUrl}
              className="h-8 gap-1 text-xs"
            >
              <QrCode className="h-3.5 w-3.5" />
              {showQr ? "Hide QR" : "QR Code"}
            </Button>

            {generatedUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                className="h-8 gap-1 text-xs"
              >
                <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Test Link
                </a>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleCopy}
              disabled={!generatedUrl}
              className="h-8 gap-1 font-semibold text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Link Display */}
        <div className="mt-4">
          {generatedUrl ? (
            <div className="rounded-lg bg-muted/60 p-3">
              <code className="break-all font-mono text-xs text-foreground select-all leading-relaxed">
                {generatedUrl}
              </code>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed py-6 text-sm text-muted-foreground">
              Please enter a valid Amazon ASIN/URL and Associate Tag above to generate your link.
            </div>
          )}
        </div>

        {/* QR Code Section */}
        {showQr && qrDataUrl && (
          <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border bg-muted/20 p-4">
            <img src={qrDataUrl} alt="Amazon Affiliate QR Code" className="h-44 w-44 rounded-lg shadow-xs bg-white p-2" />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleDownloadQr} className="h-8 text-xs gap-1">
                <Download className="h-3.5 w-3.5" /> Download QR Code PNG
              </Button>
            </div>
          </div>
        )}

        {/* Component Breakdown Table */}
        {generatedUrl && (
          <div className="mt-6 space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              URL Parameter Breakdown
            </Label>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-left font-semibold">
                  <tr>
                    <th className="p-2.5">Parameter</th>
                    <th className="p-2.5">Value</th>
                    <th className="p-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-2.5 font-mono font-medium text-primary">Domain</td>
                    <td className="p-2.5 font-mono">{domain}</td>
                    <td className="p-2.5 text-muted-foreground">Target Amazon store region</td>
                  </tr>
                  {asin && (
                    <tr>
                      <td className="p-2.5 font-mono font-medium text-primary">ASIN</td>
                      <td className="p-2.5 font-mono font-bold">{asin}</td>
                      <td className="p-2.5 text-muted-foreground">Amazon Standard Identification Number</td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-2.5 font-mono font-medium text-primary">tag</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{tag}</td>
                    <td className="p-2.5 text-muted-foreground">Affiliate tracking store identifier</td>
                  </tr>
                  {channelId && (
                    <tr>
                      <td className="p-2.5 font-mono font-medium text-primary">ascsubtag</td>
                      <td className="p-2.5 font-mono">{channelId}</td>
                      <td className="p-2.5 text-muted-foreground">Custom campaign / channel SubID</td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-2.5 font-mono font-medium text-primary">linkCode</td>
                    <td className="p-2.5 font-mono">{linkType === "cart" ? "as2" : linkType === "search" ? "ll2" : "ll1"}</td>
                    <td className="p-2.5 text-muted-foreground">Amazon tracking format protocol</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
