import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const POS = ["good","great","love","excellent","fast","recommend","quality","best","satisfied","perfect","đẹp","tốt","nhanh","chất lượng"];
const NEG = ["bad","poor","slow","broken","fake","refund","waste","damaged","late","worst","xấu","chậm","hỏng","kém"];

export default function Tool() {
  const [text, setText] = useState("Great quality, fast shipping!\nArrived damaged, refund please.\nLove it, worth the money.\nToo slow, delivery took 3 weeks.\nQuality is perfect, will buy again.");

  const r = useMemo(() => {
    const reviews = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    let p = 0, n = 0;
    const complaints: Record<string, number> = {};
    const praises: Record<string, number> = {};
    for (const rev of reviews) {
      const low = rev.toLowerCase();
      const isP = POS.some((w) => low.includes(w));
      const isN = NEG.some((w) => low.includes(w));
      if (isP) p++;
      if (isN) n++;
      for (const w of NEG) if (low.includes(w)) complaints[w] = (complaints[w] ?? 0) + 1;
      for (const w of POS) if (low.includes(w)) praises[w] = (praises[w] ?? 0) + 1;
    }
    const neu = reviews.length - Math.max(p, n);
    const predRating = reviews.length ? (5 * p + 3 * neu + 1 * n) / reviews.length : 0;
    return { total: reviews.length, p, n, neu, complaints, praises, predRating };
  }, [text]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Simulated analysis — Basic keyword sentiment, not a real Shopee crawl.</div>
      <div><Label>Paste reviews (one per line)</Label><Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} className="mt-1"/></div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total" value={r.total.toString()}/>
        <Stat label="👍" value={r.p.toString()} color="text-emerald-500"/>
        <Stat label="👎" value={r.n.toString()} color="text-destructive"/>
        <Stat label="Predicted rating" value={r.predRating.toFixed(1) + "★"} color="text-amber-500"/>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Chip title="🚨 Complaints" items={Object.entries(r.complaints)}/>
        <Chip title="⭐ Praise" items={Object.entries(r.praises)}/>
      </div>
    </div>
  );
}
function Stat({ label, value, color }: { label: string; value: string; color?: string }) { return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${color ?? ""}`}>{value}</div></div>; }
function Chip({ title, items }: { title: string; items: [string, number][] }) {
  return <div className="rounded-lg border p-3"><div className="mb-2 text-sm font-semibold">{title}</div><div className="flex flex-wrap gap-2">{items.length ? items.map(([w, c]) => <span key={w} className="rounded-full bg-muted px-3 py-1 text-xs">{w} ×{c}</span>) : <span className="text-xs text-muted-foreground">None</span>}</div></div>;
}