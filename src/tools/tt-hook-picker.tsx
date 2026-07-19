import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const HOOKS = [
  "POV: you just discovered {topic}",
  "3 things nobody tells you about {topic}",
  "Stop scrolling if you care about {topic}",
  "I tried {topic} for 30 days — here's what happened",
  "The truth about {topic} that no one shares",
  "If you're doing {topic}, watch this first",
  "Do this before you touch {topic} again",
  "Why {topic} is broken and how to fix it",
  "Wait until you see what {topic} can do",
  "This {topic} hack changed everything",
  "You're using {topic} wrong (and I was too)",
  "5 seconds to change how you think about {topic}",
  "Nobody talks about {topic} — but they should",
  "The {topic} secret creators don't share",
  "Save this if you love {topic}",
];

export default function TtHookPicker() {
  const [topic, setTopic] = useState("skincare");
  const [picks, setPicks] = useState<string[]>([]);
  const pick = (n: number) => {
    const pool = [...HOOKS];
    const out: string[] = [];
    for (let i = 0; i < n && pool.length; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0].replace(/\{topic\}/g, topic || "your niche"));
    }
    setPicks(out);
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1"><Label>Your topic / niche</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1" /></div>
        <div className="flex items-end gap-2">
          <Button onClick={() => pick(5)}>Pick 5</Button>
          <Button variant="outline" onClick={() => pick(1)}>Just one</Button>
        </div>
      </div>
      {picks.length > 0 && (
        <div className="space-y-2">
          {picks.map((h, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
              <span className="text-sm">{h}</span>
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(h); toast.success("Copied"); }}>Copy</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}