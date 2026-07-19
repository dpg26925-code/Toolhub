import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Goal = "follow" | "like" | "comment" | "share" | "save" | "link";

const T: Record<Goal, string[]> = {
  follow: ["Follow @{handle} for more {topic} tips", "Hit follow if this helped 👀", "Follow for daily {topic} content"],
  like: ["Double-tap if you agree ❤️", "Like if you learned something", "Smash the like if this hit"],
  comment: ["Comment '{keyword}' and I'll DM you the guide", "Which one surprised you? 👇", "Tell me your take on {topic} below"],
  share: ["Share this with someone who needs {topic}", "Tag a friend who's into {topic}", "Send this to someone who's still guessing"],
  save: ["Save this before you forget 📌", "Bookmark for later — you'll want it", "Save this to try tonight"],
  link: ["Link in bio for the full guide", "Get it via the link in my bio", "Full {topic} kit — link in bio"],
};

export default function TtCtaGenerator() {
  const [handle, setHandle] = useState("yourname");
  const [topic, setTopic] = useState("skincare");
  const [keyword, setKeyword] = useState("GUIDE");
  const [goal, setGoal] = useState<Goal>("follow");
  const list = useMemo(() => T[goal].map((s) => s.replace(/\{handle\}/g, handle).replace(/\{topic\}/g, topic).replace(/\{keyword\}/g, keyword)), [handle, topic, keyword, goal]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>@handle</Label><Input value={handle} onChange={(e) => setHandle(e.target.value)} className="mt-1" /></div>
        <div><Label>Topic</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1" /></div>
        <div><Label>Comment keyword</Label><Input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="mt-1" /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(T) as Goal[]).map((g) => (
          <Button key={g} size="sm" variant={goal === g ? "default" : "outline"} onClick={() => setGoal(g)}>{g}</Button>
        ))}
      </div>
      <div className="space-y-2">
        {list.map((c, i) => (
          <div key={i} className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3">
            <span className="text-sm">{c}</span>
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(c); toast.success("Copied"); }}>Copy</Button>
          </div>
        ))}
      </div>
    </div>
  );
}