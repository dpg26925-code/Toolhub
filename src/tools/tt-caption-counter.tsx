import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Sparkles, Trash2 } from "lucide-react";

const SAMPLE_CAPTION = `Unboxing the viral smart desk gadget! 🚀✨ Wait until the end to see the ambient light sync... Link in bio for 20% off! 🔥

#fyp #unboxing #desksetup #techfinds #tiktokmademebuyit @nexatools`;

export default function TtCaptionCounter() {
  const [text, setText] = useState(SAMPLE_CAPTION);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\n/).length : 0;
    const hashtags = (text.match(/#[\p{L}\p{N}_]+/gu) || []).length;
    const mentions = (text.match(/@[\p{L}\p{N}_.]+/gu) || []).length;
    const emojis = (text.match(/\p{Extended_Pictographic}/gu) || []).length;
    return { chars, words, lines, hashtags, mentions, emojis };
  }, [text]);

  const limit = 2200;
  const cutoff = 150;
  const pct = Math.min(100, (stats.chars / limit) * 100);

  const handleCopy = async () => {
    if (!text) {
      toast.error("No caption to copy");
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Caption copied to clipboard!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your TikTok Caption
          </Label>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                setText(SAMPLE_CAPTION);
                toast.info("Sample caption loaded");
              }}
              className="text-xs"
            >
              <Sparkles className="mr-1 h-3 w-3 text-brand" />
              Sample
            </Button>
            {text && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setText("")}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write your TikTok caption here…"
          className="min-h-[160px] font-mono text-sm leading-relaxed"
        />

        {/* Character Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span>Character Limit ({stats.chars} / {limit})</span>
            <span className={stats.chars > limit ? "text-destructive font-bold" : "text-muted-foreground"}>
              {limit - stats.chars} remaining
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                stats.chars > limit ? "bg-destructive" : stats.chars > cutoff ? "bg-amber-500" : "bg-brand"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            onClick={handleCopy}
            disabled={!text}
            className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold text-xs"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy Caption
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
        <Stat label="Characters" value={stats.chars} note={`${limit} max`} warn={stats.chars > limit} />
        <Stat label="Hook (Before 'more')" value={Math.min(stats.chars, cutoff)} note={`${cutoff} shown`} warn={stats.chars > cutoff} />
        <Stat label="Words" value={stats.words} />
        <Stat label="Lines" value={stats.lines} />
        <Stat label="Hashtags" value={stats.hashtags} note="3–5 optimal" warn={stats.hashtags > 7} />
        <Stat label="Mentions" value={stats.mentions} />
      </div>
    </div>
  );
}

function Stat({ label, value, note, warn }: { label: string; value: number; note?: string; warn?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${warn ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card"}`}>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
      {note && <div className="text-[11px] text-muted-foreground mt-0.5">{note}</div>}
    </div>
  );
}