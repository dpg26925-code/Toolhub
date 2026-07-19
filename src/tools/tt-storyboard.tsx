import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Scene = { id: number; shot: string; visual: string; audio: string; sec: number };
let nextId = 1;

export default function TtStoryboard() {
  const [scenes, setScenes] = useState<Scene[]>([
    { id: nextId++, shot: "Hook", visual: "Close-up on product", audio: "You won't believe this…", sec: 3 },
    { id: nextId++, shot: "Problem", visual: "Frustrated face", audio: "Most people struggle with X", sec: 5 },
    { id: nextId++, shot: "Solution", visual: "Demo in action", audio: "Here's how to fix it", sec: 15 },
    { id: nextId++, shot: "CTA", visual: "Text on screen", audio: "Follow for more!", sec: 3 },
  ]);
  const total = scenes.reduce((s, x) => s + x.sec, 0);
  const update = (id: number, k: keyof Scene, v: string | number) => setScenes((s) => s.map((x) => x.id === id ? { ...x, [k]: v } : x));
  const add = () => setScenes((s) => [...s, { id: nextId++, shot: `Scene ${s.length + 1}`, visual: "", audio: "", sec: 5 }]);
  const remove = (id: number) => setScenes((s) => s.filter((x) => x.id !== id));
  const exportMd = () => {
    const md = [`# Storyboard — ${total}s total`, "", ...scenes.map((s, i) => `## ${i + 1}. ${s.shot} (${s.sec}s)\n**Visual:** ${s.visual}\n**Audio/VO:** ${s.audio}`)].join("\n\n");
    navigator.clipboard.writeText(md); toast.success("Markdown copied");
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Total: <b className="text-foreground">{total}s</b> {total > 60 && <span className="text-destructive">· over 60s</span>}</p>
        <div className="flex gap-2"><Button size="sm" onClick={add}>+ Scene</Button><Button size="sm" variant="outline" onClick={exportMd}>Export Markdown</Button></div>
      </div>
      <div className="space-y-3">
        {scenes.map((s, i) => (
          <div key={s.id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{i + 1}</span>
              <Input value={s.shot} onChange={(e) => update(s.id, "shot", e.target.value)} className="flex-1" />
              <Input type="number" min={1} value={s.sec} onChange={(e) => update(s.id, "sec", +e.target.value || 1)} className="w-20" />
              <span className="text-xs text-muted-foreground">sec</span>
              <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>✕</Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div><Label className="text-xs">Visual</Label><Textarea value={s.visual} onChange={(e) => update(s.id, "visual", e.target.value)} className="mt-1 min-h-[70px]" /></div>
              <div><Label className="text-xs">Audio / VO</Label><Textarea value={s.audio} onChange={(e) => update(s.id, "audio", e.target.value)} className="mt-1 min-h-[70px]" /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}