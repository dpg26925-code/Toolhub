import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [title, setTitle] = useState("Weekly team sync");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dur, setDur] = useState(60);
  const [items, setItems] = useState("Status updates\nBlockers\nMetrics review\nNext week priorities\nOpen discussion");
  const [out, setOut] = useState("");
  const gen = () => {
    const lines = items.split("\n").filter(Boolean);
    const perItem = Math.floor(dur / lines.length);
    const md = `# ${title}\n**Date:** ${date}\n**Duration:** ${dur} min\n\n## Agenda\n${lines.map((l, i) => `${i + 1}. ${l} — ${perItem} min`).join("\n")}\n\n## Action items\n- [ ] \n\n## Notes\n`;
    setOut(md);
  };
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Label>Meeting title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1"/></div>
        <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1"/></div>
        <div><Label>Duration (min)</Label><Input type="number" value={dur} onChange={(e) => setDur(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div><Label>Agenda items (one per line)</Label><Textarea value={items} onChange={(e) => setItems(e.target.value)} className="mt-1 min-h-[140px]"/></div>
      <Button onClick={gen}>Generate agenda</Button>
      {out && <><Textarea readOnly value={out} className="min-h-[200px] font-mono text-xs"/><Button variant="outline" onClick={() => navigator.clipboard.writeText(out)}>Copy</Button></>}
    </div>
  );
}