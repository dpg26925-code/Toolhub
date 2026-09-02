import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, RefreshCw, Sparkles, Filter, ShieldCheck, Ticket } from "lucide-react";

type DiscountType = "percentage" | "fixed" | "free_shipping";

const PRESETS = [
  { name: "Black Friday 20% OFF", prefix: "BF20", type: "percentage" as DiscountType, val: 20, len: 8, qty: 10 },
  { name: "Welcome $10 Voucher", prefix: "WELCOME", type: "fixed" as DiscountType, val: 10, len: 10, qty: 25 },
  { name: "VIP Free Shipping", prefix: "SHIPFREE", type: "free_shipping" as DiscountType, val: 0, len: 10, qty: 15 },
  { name: "Summer Promo Code", prefix: "SUMMER", type: "percentage" as DiscountType, val: 15, len: 8, qty: 20 },
];

export default function CouponCodeGenerator() {
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("20");
  const [prefix, setPrefix] = useState("SAVE");
  const [suffix, setSuffix] = useState("");
  const [codeLength, setCodeLength] = useState(8);
  const [quantity, setQuantity] = useState(20);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(false);
  const [useNumbers, setUseNumbers] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [chunkSize, setChunkSize] = useState(4); // e.g. SAVE-XXXX-XXXX
  const [useHyphens, setUseHyphens] = useState(true);

  const [generatedCodes, setGeneratedCodes] = useState<string[]>([
    "SAVE-8X4K-9MN2",
    "SAVE-3P7Q-2RT8",
    "SAVE-9WK5-6DF3",
    "SAVE-4NM8-7PQ2",
    "SAVE-2RT6-8KX9",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Generate cryptographically secure random string
  const generateBatch = () => {
    let charset = "";
    if (useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) charset += "0123456789";

    if (excludeAmbiguous) {
      // Remove O, 0, I, 1, l
      charset = charset.replace(/[O0I1l]/g, "");
    }

    if (!charset) {
      toast.error("Please select at least one character set.");
      return;
    }

    const cleanPrefix = prefix.trim();
    const cleanSuffix = suffix.trim();
    const targetQty = Math.min(Math.max(1, quantity), 500);
    const targetLen = Math.min(Math.max(4, codeLength), 24);

    const uniqueSet = new Set<string>();
    let attempts = 0;
    const maxAttempts = targetQty * 10;

    const randomValues = new Uint32Array(targetLen * 2);

    while (uniqueSet.size < targetQty && attempts < maxAttempts) {
      attempts++;
      crypto.getRandomValues(randomValues);

      let randomPart = "";
      for (let i = 0; i < targetLen; i++) {
        randomPart += charset[randomValues[i] % charset.length];
      }

      // Add hyphens chunking if enabled
      let formattedBody = randomPart;
      if (useHyphens && chunkSize > 0 && formattedBody.length > chunkSize) {
        const chunks: string[] = [];
        for (let i = 0; i < formattedBody.length; i += chunkSize) {
          chunks.push(formattedBody.slice(i, i + chunkSize));
        }
        formattedBody = chunks.join("-");
      }

      const fullCode = [cleanPrefix, formattedBody, cleanSuffix].filter(Boolean).join(useHyphens ? "-" : "");
      uniqueSet.add(fullCode);
    }

    const codesArray = Array.from(uniqueSet);
    setGeneratedCodes(codesArray);
    toast.success(`Generated ${codesArray.length} unique coupon codes!`);
  };

  const handleCopySingle = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    toast.success(`Copied: ${code}`);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = async () => {
    if (generatedCodes.length === 0) return;
    await navigator.clipboard.writeText(generatedCodes.join("\n"));
    setCopiedAll(true);
    toast.success(`Copied all ${generatedCodes.length} codes!`);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (generatedCodes.length === 0) return;
    const blob = new Blob([generatedCodes.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coupons_${prefix || "promo"}_${generatedCodes.length}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded TXT file");
  };

  const handleDownloadCsv = () => {
    if (generatedCodes.length === 0) return;
    const rows = [
      ["Code", "Discount Type", "Discount Value", "Created At"],
      ...generatedCodes.map((code) => [
        code,
        discountType === "percentage" ? `${discountValue}%` : discountType === "fixed" ? `$${discountValue}` : "Free Shipping",
        discountValue,
        new Date().toISOString().split("T")[0],
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `coupons_${prefix || "promo"}_${generatedCodes.length}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded CSV file");
  };

  const filteredCodes = generatedCodes.filter((c) =>
    c.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Quick Presets:</span>
        {PRESETS.map((p) => (
          <Button
            key={p.name}
            size="sm"
            variant="outline"
            onClick={() => {
              setPrefix(p.prefix);
              setDiscountType(p.type);
              setDiscountValue(String(p.val));
              setCodeLength(p.len);
              setQuantity(p.qty);
              toast.info(`Preset applied: ${p.name}`);
            }}
            className="h-7 text-xs"
          >
            <Sparkles className="mr-1 h-3 w-3 text-primary" />
            {p.name}
          </Button>
        ))}
      </div>

      {/* Inputs Configuration */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Column 1: Offer Details */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Ticket className="h-4 w-4 text-primary" /> Promotion & Discount
          </h3>

          <div>
            <Label className="text-xs font-medium">Discount Type</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={discountType === "percentage" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiscountType("percentage")}
                className="h-8 text-xs"
              >
                Percentage (%)
              </Button>
              <Button
                type="button"
                variant={discountType === "fixed" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiscountType("fixed")}
                className="h-8 text-xs"
              >
                Fixed Amount ($)
              </Button>
              <Button
                type="button"
                variant={discountType === "free_shipping" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiscountType("free_shipping")}
                className="h-8 text-xs"
              >
                Free Shipping
              </Button>
            </div>
          </div>

          {discountType !== "free_shipping" && (
            <div>
              <Label htmlFor="discountVal" className="text-xs font-medium">
                {discountType === "percentage" ? "Discount Percentage (%)" : "Discount Amount ($)"}
              </Label>
              <Input
                id="discountVal"
                type="number"
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="prefix" className="text-xs font-medium">Prefix (optional)</Label>
              <Input
                id="prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                placeholder="e.g. VIP, SAVE"
                className="mt-1 font-mono text-sm uppercase"
              />
            </div>
            <div>
              <Label htmlFor="suffix" className="text-xs font-medium">Suffix (optional)</Label>
              <Input
                id="suffix"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value.toUpperCase())}
                placeholder="e.g. 2026"
                className="mt-1 font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="codeLength" className="text-xs font-medium">Random Chars Length: {codeLength}</Label>
              <Input
                id="codeLength"
                type="number"
                min="4"
                max="24"
                value={codeLength}
                onChange={(e) => setCodeLength(parseInt(e.target.value) || 8)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="quantity" className="text-xs font-medium">Quantity to Generate (1-500)</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 20)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Column 2: Code Format & Character Sets */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Character Set & Formatting
          </h3>

          <div className="space-y-2.5 rounded-lg border bg-muted/20 p-3 text-xs">
            <Label className="font-semibold text-muted-foreground uppercase text-[11px]">Included Characters</Label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useUppercase}
                  onChange={(e) => setUseUppercase(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useLowercase}
                  onChange={(e) => setUseLowercase(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Lowercase (a-z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useNumbers}
                  onChange={(e) => setUseNumbers(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-primary">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Exclude Ambiguous (0, O, 1, I)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2.5 rounded-lg border bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between">
              <Label htmlFor="useHyphens" className="font-semibold cursor-pointer">Hyphen Delimiter Chunking</Label>
              <input
                id="useHyphens"
                type="checkbox"
                checked={useHyphens}
                onChange={(e) => setUseHyphens(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
            </div>
            {useHyphens && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Split every</span>
                <Input
                  type="number"
                  min="2"
                  max="8"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value) || 4)}
                  className="h-7 w-16 font-mono text-xs"
                />
                <span className="text-muted-foreground">characters (e.g. ABCD-EFGH)</span>
              </div>
            )}
          </div>

          <Button onClick={generateBatch} className="w-full font-semibold gap-2">
            <RefreshCw className="h-4 w-4" /> Generate {quantity} Unique Codes
          </Button>
        </div>
      </div>

      {/* Generated Codes Output Card */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Generated Coupon Codes</h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {generatedCodes.length} Codes
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Cryptographically unique, ready to upload to Shopify, WooCommerce, or Magento
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadTxt} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> TXT
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadCsv} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button size="sm" onClick={handleCopyAll} className="h-8 text-xs gap-1 font-semibold">
              {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedAll ? "All Copied!" : "Copy All Codes"}
            </Button>
          </div>
        </div>

        {/* Filter / Search Bar */}
        {generatedCodes.length > 5 && (
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter codes..."
              className="h-8 pl-8 text-xs"
            />
          </div>
        )}

        {/* Codes Grid / List */}
        <div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 p-1">
          {filteredCodes.map((code, idx) => (
            <div
              key={code + idx}
              className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs transition-colors hover:bg-muted/60"
            >
              <div className="flex items-center gap-2 overflow-hidden font-mono">
                <span className="text-[10px] text-muted-foreground w-5 text-right">{idx + 1}.</span>
                <span className="font-bold text-foreground select-all truncate">{code}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopySingle(code, idx)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Copy code"
              >
                {copiedIndex === idx ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
