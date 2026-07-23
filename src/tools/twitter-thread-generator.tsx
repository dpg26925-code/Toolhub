import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function splitThread(text: string, max: number, number: boolean): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const tweets: string[] = [];
  const budget = number ? max - 6 : max; // reserve for " (nn/NN)"
  for (const para of paragraphs) {
    const sentences = para.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [para];
    let buf = "";
    for (const s of sentences.map((s) => s.trim())) {
      if (!buf) { buf = s; continue; }
      if ((buf + " " + s).length <= budget) buf = buf + " " + s;
      else { tweets.push(buf); buf = s; }
      if (buf.length > budget) {
        // hard-split long single sentence
        while (buf.length > budget) { tweets.push(buf.slice(0, budget)); buf = buf.slice(budget); }
      }
    }
    if (buf) tweets.push(buf);
  }
  if (!number) return tweets;
  const total = tweets.length;
  return tweets.map((t, i) => `${t} (${i + 1}/${total})`);
}

export default function TwitterThreadGeneratorTool() {
  const [text, setText] = useState("Threads work best when each tweet stands alone.\n\nStart with a strong hook that promises value.\n\nEnd with a call to action — reply, follow, or share.");
  const [max, setMax] = useState(280);
  const [number, setNumber] = useState(true);

  const tweets = useMemo(() => splitThread(text, max, number), [text, max, number]);

  const copyAll = () => { navigator.clipboard.writeText(tweets.join("\n\n---\n\n")); toast.success("Thread copied"); };

  return (
    <div className="space-y-4">
      <div><Label>Long text</Label><Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} className="mt-1"/></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label>Max chars per tweet</Label><Input type="number" min={80} max={280} value={max} onChange={(e) => setMax(+e.target.value)} className="mt-1"/></div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={number} onChange={(e) => setNumber(e.target.checked)} /> Auto-number tweets</label></div>
        <div className="flex items-end"><Button variant="outline" onClick={copyAll}>Copy full thread</Button></div>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{tweets.length} tweets</p>
        {tweets.map((t, i) => (
          <div key={i} className="rounded-xl border p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="whitespace-pre-wrap text-sm">{t}</p>
              <span className={`shrink-0 text-xs ${t.length > max ? "text-destructive" : "text-muted-foreground"}`}>{t.length}/{max}</span>
            </div>
            <Button size="sm" variant="ghost" className="mt-2" onClick={() => { navigator.clipboard.writeText(t); toast.success(`Tweet ${i + 1} copied`); }}>Copy tweet</Button>
          </div>
        ))}
      </div>
    </div>
  );
}