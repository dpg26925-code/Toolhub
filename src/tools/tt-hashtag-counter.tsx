import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function TtHashtagCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const all = text.match(/#[\p{L}\p{N}_]+/gu) || [];
    const lower = all.map((h) => h.toLowerCase());
    const unique = Array.from(new Set(lower));
    const dupes = lower.length - unique.length;
    const chars = all.reduce((s, h) => s + h.length, 0);
    return { total: all.length, unique: unique.length, dupes, chars, list: unique };
  }, [text]);
  return (
    <div className="space-y-4">
      <div>
        <Label>Paste caption or hashtag list</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 min-h-[160px]" placeholder="#fyp #foryou #viral…" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Box l="Total" v={stats.total} />
        <Box l="Unique" v={stats.unique} />
        <Box l="Duplicates" v={stats.dupes} warn={stats.dupes > 0} />
        <Box l="Chars used" v={stats.chars} />
      </div>
      {stats.list.length > 0 && (
        <div>
          <Label>Unique hashtags</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stats.list.map((h) => <span key={h} className="rounded-full bg-secondary px-2.5 py-1 text-xs">{h}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
function Box({ l, v, warn }: { l: string; v: number; warn?: boolean }) {
  return <div className={`rounded-lg border p-3 ${warn ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"}`}><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-semibold">{v}</div></div>;
}