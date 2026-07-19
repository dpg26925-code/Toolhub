import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const STOP = new Set(("a an and are as at be but by for from has have he her his i in is it its me my of on or she that the their them these they this to us was we were will with you your".split(" ")));

function extractTags(text: string): string[] {
  const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const counts = new Map<string, number>();
  for (const w of words) {
    if (w.length < 3 || STOP.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  const single = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w);

  // bigrams
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i], b = words[i + 1];
    if (a.length < 3 || b.length < 3 || STOP.has(a) || STOP.has(b)) continue;
    bigrams.push(a + b);
  }
  const seen = new Set<string>();
  const combined = [...single, ...bigrams].filter((t) => { if (seen.has(t)) return false; seen.add(t); return true; });
  return combined.map((t) => "#" + t);
}

export default function HashtagGenerator() {
  const [text, setText] = useState("");

  const all = useMemo(() => extractTags(text), [text]);
  const ig = all.slice(0, 30);
  const tw = all.slice(0, 10);
  const li = all.slice(0, 5);

  const copy = (list: string[]) => {
    navigator.clipboard.writeText(list.join(" "));
    toast.success(`Copied ${list.length} hashtags`);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Topic, description or content</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your caption, blog post excerpt or a description of your content…" className="mt-1 min-h-[140px]" />
      </div>

      {all.length > 0 && (
        <div className="space-y-4">
          {[
            { name: "Instagram (30)", list: ig },
            { name: "Twitter / X (10)", list: tw },
            { name: "LinkedIn (5)", list: li },
          ].map((g) => (
            <div key={g.name}>
              <div className="flex items-center justify-between">
                <Label>{g.name}</Label>
                <Button size="sm" variant="outline" onClick={() => copy(g.list)}>Copy all</Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 rounded-lg border p-3">
                {g.list.map((t) => (
                  <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}