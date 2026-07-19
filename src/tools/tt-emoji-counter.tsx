import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function TtEmojiCounter() {
  const [text, setText] = useState("");
  const data = useMemo(() => {
    const emojis = text.match(/\p{Extended_Pictographic}/gu) || [];
    const counts = new Map<string, number>();
    for (const e of emojis) counts.set(e, (counts.get(e) || 0) + 1);
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return { total: emojis.length, unique: counts.size, sorted };
  }, [text]);
  return (
    <div className="space-y-4">
      <div>
        <Label>Paste text with emojis</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 min-h-[160px]" placeholder="🔥 New drop! 🚀 Get yours today ❤️" />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border bg-card p-3"><div className="text-xs text-muted-foreground">Total</div><div className="text-2xl font-semibold">{data.total}</div></div>
        <div className="rounded-lg border bg-card p-3"><div className="text-xs text-muted-foreground">Unique</div><div className="text-2xl font-semibold">{data.unique}</div></div>
      </div>
      {data.sorted.length > 0 && (
        <div>
          <Label>Frequency</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.sorted.map(([e, n]) => <span key={e} className="rounded-full bg-secondary px-3 py-1 text-sm">{e} × {n}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}