import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const STOP = new Set(("a an the and or but if then else when while for to of in on at by with from as is are was were be been being have has had do does did will would could should may might can this that these those i you he she it we they them us our your his her its their my me not no yes so very just about into over under out up down more most less least new best top how what why where who which").split(" "));

function toHashtag(w: string) {
  return "#" + w.replace(/[^\p{L}\p{N}]/gu, "");
}

export default function YtHashtagsTool() {
  const [title, setTitle] = useState("How to edit videos faster with AI tools in 2026");
  const [desc, setDesc] = useState("A quick tutorial on speeding up your video editing workflow using free AI tools online.");
  const [max, setMax] = useState("15");

  const hashtags = useMemo(() => {
    const text = `${title} ${desc}`.toLowerCase();
    const words = text.match(/[\p{L}\p{N}]+/gu) || [];
    const freq = new Map<string, number>();
    for (const w of words) {
      if (w.length < 3 || STOP.has(w) || /^\d+$/.test(w)) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
    const limit = Math.max(1, Math.min(30, parseInt(max, 10) || 15));
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([w]) => toHashtag(w));
  }, [title, desc, max]);

  const joined = hashtags.join(" ");

  return (
    <div className="space-y-4">
      <div><Label>Video title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
      <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1 min-h-[140px]" /></div>
      <div className="max-w-[160px]"><Label>Max hashtags</Label><Input type="number" value={max} min={1} max={30} onChange={(e) => setMax(e.target.value)} className="mt-1" /></div>
      {hashtags.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {hashtags.map((h) => (
              <span key={h} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{h}</span>
            ))}
          </div>
          <Textarea readOnly value={joined} className="min-h-[80px] font-mono text-xs" />
          <Button onClick={() => { navigator.clipboard.writeText(joined); toast.success("Copied"); }}>Copy all</Button>
        </div>
      )}
    </div>
  );
}