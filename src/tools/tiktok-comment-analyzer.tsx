import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const POS = ["love","amazing","best","great","perfect","awesome","cute","obsessed","recommend","worth","😍","🔥","💯","🥰","❤️"];
const NEG = ["hate","bad","worst","terrible","broken","scam","refund","waste","cheap","fake","disappointed","💩","👎","😡"];
const Q_MARK = /\?$/;

function tokenize(t: string) { return t.toLowerCase().match(/[a-z']{3,}/g) ?? []; }

export default function Tool() {
  const [text, setText] = useState("Love this! Best purchase ever 😍\nIs it waterproof?\nWaste of money, arrived broken\nWhere do I get the color options?\nObsessed with the quality!");

  const r = useMemo(() => {
    const comments = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    let pos = 0, neg = 0;
    const freq: Record<string, number> = {};
    const questions: string[] = [];
    for (const c of comments) {
      const low = c.toLowerCase();
      const p = POS.some((w) => low.includes(w));
      const n = NEG.some((w) => low.includes(w));
      if (p && !n) pos++; else if (n && !p) neg++;
      if (Q_MARK.test(c.trim()) || /\bwhere|how|when|what|does|is it|can i\b/.test(low)) questions.push(c);
      for (const w of tokenize(c)) if (w.length > 4) freq[w] = (freq[w] ?? 0) + 1;
    }
    const neu = comments.length - pos - neg;
    const top = Object.entries(freq).sort(([, a], [, b]) => b - a).slice(0, 10);
    return { total: comments.length, pos, neg, neu, questions, top };
  }, [text]);

  const pct = (n: number) => r.total ? Math.round((n / r.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Basic analysis, not real-time API — for exploratory review only.</div>
      <div><Label>Paste comments (one per line)</Label><Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} className="mt-1"/></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="👍 Positive" value={`${r.pos} (${pct(r.pos)}%)`} color="text-emerald-500"/>
        <Stat label="😐 Neutral" value={`${r.neu} (${pct(r.neu)}%)`}/>
        <Stat label="👎 Negative" value={`${r.neg} (${pct(r.neg)}%)`} color="text-destructive"/>
      </div>
      <div className="rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Top keywords</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {r.top.map(([w, c]) => <span key={w} className="rounded-full bg-muted px-3 py-1 text-xs">{w} ×{c}</span>)}
          {!r.top.length && <span className="text-xs text-muted-foreground">No data</span>}
        </div>
      </div>
      <div className="rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Questions detected ({r.questions.length})</h3>
        <ul className="mt-2 space-y-1 text-sm">{r.questions.slice(0, 10).map((q, i) => <li key={i}>• {q}</li>)}</ul>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${color ?? ""}`}>{value}</div></div>;
}