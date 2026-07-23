import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const total = words.length;
    const stop = new Set(["the", "and", "for", "you", "your", "with", "this", "that", "are", "was", "have", "from", "not", "but", "all"]);
    const map: Record<string, number> = {};
    words.forEach((w) => { if (!stop.has(w)) map[w] = (map[w] || 0) + 1; });
    return { total, top: Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 15) };
  }, [text]);
  return (
    <div className="space-y-4">
      <div><Label>Paste your content</Label><Textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 min-h-[200px]"/></div>
      <div className="rounded-lg border bg-muted/30 p-3 text-sm">Total words: <strong>{stats.total}</strong></div>
      {stats.top.length > 0 && (
        <div className="rounded-lg border">
          <table className="w-full text-sm"><thead className="bg-muted"><tr><th className="p-2 text-left">Keyword</th><th className="p-2 text-right">Count</th><th className="p-2 text-right">Density</th></tr></thead>
          <tbody>{stats.top.map(([w, c]) => {
            const d = (c / stats.total) * 100;
            const warn = d > 3;
            return <tr key={w} className={`border-t ${warn ? "bg-amber-500/5" : ""}`}><td className="p-2">{w}</td><td className="p-2 text-right">{c}</td><td className={`p-2 text-right font-semibold ${warn ? "text-amber-500" : ""}`}>{d.toFixed(2)}%{warn && " ⚠"}</td></tr>;
          })}</tbody></table>
        </div>
      )}
      <div className="text-xs text-muted-foreground">Ideal density: 1–3% for target keywords. Above 3% may look spammy.</div>
    </div>
  );
}