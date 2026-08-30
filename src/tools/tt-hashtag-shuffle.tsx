import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  Shuffle,
  Copy,
  Check,
  Sparkles,
  Trash2,
  Share2,
  Hash,
  Layers,
} from "lucide-react";

const SAMPLES: Record<string, string> = {
  tiktok_viral: `#fyp #foryou #viral #trending #tiktokmademebuyit #explore #trend #challenge #relatable #lifehacks #foryoupage #dailyvlog`,
  ecommerce: `#shopee #tiktokshop #sales #deals #unboxing #shopping #musthave #discount #affiliate #productreview #fashionfinds #giftideas`,
  fitness: `#fitness #workout #gymtok #fitfam #healthylifestyle #bodybuilding #motivation #cardio #personaltrainer #nutrition #gains #homeworkout`,
};

function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export default function TtHashtagShuffle() {
  const [inputText, setInputText] = useState("");
  const [shuffledOutput, setShuffledOutput] = useState("");
  const [autoHashPrefix, setAutoHashPrefix] = useState(true);
  const [deduplicate, setDeduplicate] = useState(true);
  const [toLowerCase, setToLowerCase] = useState(false);
  const [separator, setSeparator] = useState<"space" | "comma" | "newline">("space");
  const [tagLimit, setTagLimit] = useState<number>(0); // 0 = all
  const [copied, setCopied] = useState(false);

  // Extract tags & non-tag caption text
  const parsedData = useMemo(() => {
    if (!inputText.trim()) return { tags: [], bodyText: "" };

    // Check if input contains hashtags
    const foundTags = inputText.match(/#[\p{L}\p{N}_]+/gu) || [];

    if (foundTags.length > 0) {
      // Extract caption body (strip out hashtags)
      const body = inputText.replace(/#[\p{L}\p{N}_]+/gu, "").trim();
      let cleanTags = foundTags.map((t) => (autoHashPrefix ? (t.startsWith("#") ? t : `#${t}`) : t.replace(/^#/, "")));
      if (toLowerCase) cleanTags = cleanTags.map((t) => t.toLowerCase());
      if (deduplicate) cleanTags = Array.from(new Set(cleanTags));
      return { tags: cleanTags, bodyText: body };
    }

    // Fallback: Treat words/lines/commas as keywords
    const rawTokens = inputText
      .split(/[\n,;]+|\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let cleanTokens = rawTokens.map((t) => {
      let cleaned = t.replace(/^[#\s]+/, "");
      if (toLowerCase) cleaned = cleaned.toLowerCase();
      return autoHashPrefix ? `#${cleaned}` : cleaned;
    });

    if (deduplicate) cleanTokens = Array.from(new Set(cleanTokens));
    return { tags: cleanTokens, bodyText: "" };
  }, [inputText, autoHashPrefix, deduplicate, toLowerCase]);

  const executeShuffle = () => {
    if (parsedData.tags.length === 0) {
      toast.error("Please enter some hashtags or text first");
      return;
    }

    let shuffled = fisherYatesShuffle(parsedData.tags);

    if (tagLimit > 0 && tagLimit < shuffled.length) {
      shuffled = shuffled.slice(0, tagLimit);
    }

    let joinedTags = "";
    if (separator === "comma") {
      joinedTags = shuffled.join(", ");
    } else if (separator === "newline") {
      joinedTags = shuffled.join("\n");
    } else {
      joinedTags = shuffled.join(" ");
    }

    if (parsedData.bodyText) {
      setShuffledOutput(`${parsedData.bodyText}\n\n${joinedTags}`);
    } else {
      setShuffledOutput(joinedTags);
    }

    toast.success(`Shuffled ${shuffled.length} hashtags!`);
  };

  const handleCopy = async () => {
    if (!shuffledOutput) {
      toast.error("No shuffled output to copy yet");
      return;
    }
    const success = await copyToClipboard(shuffledOutput);
    if (success) {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleLoadSample = (key: string) => {
    const sample = SAMPLES[key];
    if (sample) {
      setInputText(sample);
      toast.info("Sample hashtags loaded");
    }
  };

  const handleClear = () => {
    setInputText("");
    setShuffledOutput("");
    toast.info("Cleared");
  };

  const outputStats = useMemo(() => {
    const text = shuffledOutput || inputText;
    const chars = text.length;
    const tagCount = (text.match(/#[\p{L}\p{N}_]+/gu) || []).length;
    return { chars, tagCount };
  }, [shuffledOutput, inputText]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label htmlFor="hashtag-input" className="text-sm font-semibold flex items-center gap-2">
            <Hash className="h-4 w-4 text-brand" />
            Paste Hashtags, Words or Full Caption
          </Label>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleLoadSample("tiktok_viral")}
              className="text-xs"
            >
              <Sparkles className="mr-1 h-3 w-3 text-brand" />
              TikTok Viral
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleLoadSample("ecommerce")}
              className="text-xs"
            >
              TikTok Shop
            </Button>
            {inputText && (
              <Button
                size="xs"
                variant="ghost"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <Textarea
          id="hashtag-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste caption or hashtags: #fyp #viral #trending or comma-separated keywords: fashion, style, summer..."
          className="min-h-[120px] font-mono text-sm leading-relaxed"
        />

        {/* Configuration Options */}
        <div className="grid gap-4 rounded-xl bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="auto-hash" className="text-xs cursor-pointer font-medium">
              Auto Add # Prefix
            </Label>
            <Switch
              id="auto-hash"
              checked={autoHashPrefix}
              onCheckedChange={setAutoHashPrefix}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="dedupe" className="text-xs cursor-pointer font-medium">
              Remove Duplicates
            </Label>
            <Switch
              id="dedupe"
              checked={deduplicate}
              onCheckedChange={setDeduplicate}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="lowercase" className="text-xs cursor-pointer font-medium">
              Lowercase All
            </Label>
            <Switch
              id="lowercase"
              checked={toLowerCase}
              onCheckedChange={setToLowerCase}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span>Pick Random:</span>
              <span className="text-brand font-semibold">
                {tagLimit === 0 ? "All" : `${tagLimit} tags`}
              </span>
            </div>
            <Slider
              value={[tagLimit]}
              min={0}
              max={Math.max(30, parsedData.tags.length || 30)}
              step={1}
              onValueChange={(val) => setTagLimit(val[0])}
            />
          </div>
        </div>

        {/* Separator selection */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-medium text-muted-foreground">Format:</span>
            <RadioGroup
              value={separator}
              onValueChange={(v) => setSeparator(v as "space" | "comma" | "newline")}
              className="flex items-center space-x-3"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="space" id="sep-space" />
                <Label htmlFor="sep-space" className="cursor-pointer">Space</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="comma" id="sep-comma" />
                <Label htmlFor="sep-comma" className="cursor-pointer">Comma</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="newline" id="sep-line" />
                <Label htmlFor="sep-line" className="cursor-pointer">New Line</Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={executeShuffle}
            disabled={parsedData.tags.length === 0}
            className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
            size="sm"
          >
            <Shuffle className="mr-1.5 h-4 w-4" />
            Shuffle Hashtags ({parsedData.tags.length})
          </Button>
        </div>
      </div>

      {/* Output Section */}
      {shuffledOutput && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-500" />
              Shuffled Result
            </Label>

            <div className="flex items-center gap-2">
              <Button size="xs" variant="outline" onClick={executeShuffle}>
                <Shuffle className="mr-1 h-3 w-3" />
                Re-Shuffle
              </Button>
              <Button
                size="xs"
                variant={copied ? "default" : "secondary"}
                onClick={handleCopy}
                className="font-medium"
              >
                {copied ? (
                  <>
                    <Check className="mr-1 h-3.5 w-3.5 text-emerald-300" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    Copy Result
                  </>
                )}
              </Button>
            </div>
          </div>

          <Textarea
            readOnly
            value={shuffledOutput}
            className="min-h-[140px] font-mono text-sm leading-relaxed bg-muted/30"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-t border-border pt-3">
            <div className="flex items-center gap-4">
              <span>Hashtags: <strong className="text-foreground">{outputStats.tagCount}</strong></span>
              <span>
                Characters: <strong className="text-foreground">{outputStats.chars}</strong> / 2,200 (TikTok limit)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground/80 italic">
              💡 Randomising tag sequence prevents duplicate caption detection flags across multiple posts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}