import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [title, setTitle] = useState("Sony Wireless Earbuds Bluetooth 5.3 IPX5");
  const [desc, setDesc] = useState("High quality wireless earbuds with long battery life.");
  const [tags, setTags] = useState("earbuds, bluetooth, wireless");

  const r = useMemo(() => {
    const issues: string[] = [];
    let score = 100;
    if (title.length < 40) { issues.push("Title too short (< 40 chars)"); score -= 15; }
    if (title.length > 60) { issues.push("Title over 60 chars — Shopee may truncate"); score -= 10; }
    if (desc.length < 100) { issues.push("Description under 100 chars — add more detail"); score -= 15; }
    if (desc.length > 3000) { issues.push("Description over 3000 chars"); score -= 5; }
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tagList.length < 3) { issues.push(`Only ${tagList.length} tags — aim for 5–10`); score -= 15; }
    const titleWords = new Set(title.toLowerCase().match(/\w+/g) ?? []);
    const missing = tagList.filter((t) => !titleWords.has(t.toLowerCase()));
    if (missing.length) { issues.push(`Tags not in title: ${missing.join(", ")}`); score -= 10; }
    if (!/[A-Z]/.test(title)) { issues.push("Title has no capital letters"); score -= 5; }
    const density = title.toLowerCase().match(/\w+/g)?.length ?? 0;
    if (density < 5) { issues.push("Title has fewer than 5 keywords"); score -= 10; }
    return { score: Math.max(0, score), issues };
  }, [title, desc, tags]);

  const grade = r.score >= 80 ? "Excellent" : r.score >= 60 ? "Good" : r.score >= 40 ? "Fair" : "Poor";
  const color = r.score >= 80 ? "text-emerald-500" : r.score >= 60 ? "text-blue-500" : r.score >= 40 ? "text-amber-500" : "text-destructive";

  return (
    <div className="space-y-4">
      <div><Label>Product title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1"/><p className="mt-1 text-xs text-muted-foreground">{title.length}/60</p></div>
      <div><Label>Description</Label><Textarea rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1"/><p className="mt-1 text-xs text-muted-foreground">{desc.length}/3000</p></div>
      <div><Label>Tags (comma)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1"/></div>
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className={`text-3xl font-bold ${color}`}>{r.score}/100 · {grade}</div>
        <ul className="mt-3 space-y-1 text-sm">
          {r.issues.length === 0 ? <li className="text-emerald-500">✓ All checks passed</li> : r.issues.map((i, k) => <li key={k} className="text-destructive">• {i}</li>)}
        </ul>
      </div>
    </div>
  );
}