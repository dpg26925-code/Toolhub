import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// TikTok caption limit ~2200 chars (max), display cutoff ~150
export default function TtCaptionCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\n/).length : 0;
    const hashtags = (text.match(/#[\p{L}\p{N}_]+/gu) || []).length;
    const mentions = (text.match(/@[\p{L}\p{N}_.]+/gu) || []).length;
    const emojis = (text.match(/\p{Extended_Pictographic}/gu) || []).length;
    return { chars, words, lines, hashtags, mentions, emojis };
  }, [text]);
  const limit = 2200, cutoff = 150;
  const pct = Math.min(100, (stats.chars / limit) * 100);
  return (
    <div className="space-y-4">
      <div>
        <Label>Your TikTok caption</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your caption here…" className="mt-1 min-h-[180px]" />
      </div>
      <div className="h-2 rounded bg-secondary overflow-hidden">
        <div className={`h-full ${stats.chars > limit ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <Stat label="Characters" value={stats.chars} note={`${limit} max`} warn={stats.chars > limit} />
        <Stat label="Before 'more'" value={Math.min(stats.chars, cutoff)} note={`${cutoff} shown`} warn={stats.chars > cutoff} />
        <Stat label="Words" value={stats.words} />
        <Stat label="Lines" value={stats.lines} />
        <Stat label="Hashtags" value={stats.hashtags} note="≤5 recommended" warn={stats.hashtags > 5} />
        <Stat label="Mentions" value={stats.mentions} />
        <Stat label="Emojis" value={stats.emojis} />
      </div>
    </div>
  );
}
function Stat({ label, value, note, warn }: { label: string; value: number; note?: string; warn?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${warn ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {note && <div className="text-xs text-muted-foreground mt-0.5">{note}</div>}
    </div>
  );
}