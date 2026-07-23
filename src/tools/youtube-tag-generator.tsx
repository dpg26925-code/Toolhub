import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const STOP = new Set(["the","a","an","and","or","but","of","in","on","for","to","with","is","are","was","were","be","by","this","that","from","as","at","it","its","how","what","why","you","your"]);

function tokens(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w));
}
function bigrams(words: string[]) {
  const out: string[] = [];
  for (let i = 0; i < words.length - 1; i++) out.push(`${words[i]} ${words[i + 1]}`);
  return out;
}

export default function YouTubeTagGeneratorTool() {
  const [title, setTitle] = useState("How to grow your YouTube channel in 2026");
  const [description, setDescription] = useState("Practical tips for creators: titles, thumbnails, retention, hooks, and posting cadence.");
  const [topic, setTopic] = useState("youtube growth");
  const [count, setCount] = useState(20);

  const tags = useMemo(() => {
    const words = [...tokens(title), ...tokens(description), ...tokens(topic)];
    const freq = new Map<string, number>();
    for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 2);
    for (const b of bigrams(words)) freq.set(b, (freq.get(b) ?? 0) + 3);
    const base = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
    const seen = new Set<string>();
    const uniq = base.filter((t) => { if (seen.has(t)) return false; seen.add(t); return true; });
    return uniq.slice(0, count);
  }, [title, description, topic, count]);

  const csv = tags.join(", ");
  const chars = csv.length;
  const over = chars > 500;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>Video title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1"/></div>
        <div><Label>Topic / niche</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1"/></div>
      </div>
      <div><Label>Description</Label><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1"/></div>
      <div className="flex items-center gap-3">
        <Label>Tag count</Label>
        <input type="range" min={5} max={40} value={count} onChange={(e) => setCount(+e.target.value)} />
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Tags (comma-separated)</Label>
          <span className={`text-xs ${over ? "text-destructive" : "text-muted-foreground"}`}>{chars} / 500</span>
        </div>
        <Textarea readOnly rows={4} value={csv} />
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => <span key={t} className="rounded-full border px-3 py-1 text-xs">{t}</span>)}
      </div>
      <Button onClick={() => { navigator.clipboard.writeText(csv); toast.success("Tags copied"); }}>Copy all tags</Button>
    </div>
  );
}