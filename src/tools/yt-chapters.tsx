import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
function parseTime(t: string): number | null {
  const parts = t.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

export default function YtChaptersTool() {
  const [input, setInput] = useState(
    "0:00 Intro\n1:30 What is Nexatools\n5:00 Demo\n12:45 Wrap up"
  );

  const { output, error, count } = useMemo(() => {
    const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsed: { time: number; title: string }[] = [];
    for (const line of lines) {
      const m = line.match(/^(\d{1,2}(?::\d{2}){1,2})\s+(.+)$/);
      if (!m) return { output: "", error: `Invalid line: "${line}"`, count: 0 };
      const t = parseTime(m[1]);
      if (t === null) return { output: "", error: `Bad time in "${line}"`, count: 0 };
      parsed.push({ time: t, title: m[2] });
    }
    parsed.sort((a, b) => a.time - b.time);
    if (parsed.length === 0) return { output: "", error: null, count: 0 };
    if (parsed[0].time !== 0) return { output: "", error: "First chapter must start at 0:00", count: 0 };
    if (parsed.length < 3) return { output: "", error: "YouTube requires at least 3 chapters", count: parsed.length };
    for (let i = 1; i < parsed.length; i++) {
      if (parsed[i].time - parsed[i - 1].time < 10) return { output: "", error: `Chapters must be at least 10s apart (near ${fmt(parsed[i].time)})`, count: parsed.length };
    }
    return { output: parsed.map((c) => `${fmt(c.time)} ${c.title}`).join("\n"), error: null, count: parsed.length };
  }, [input]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Chapters (one per line: <code>0:00 Title</code>)</Label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="mt-1 min-h-[220px] font-mono text-xs" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {output && (
        <div>
          <Label>YouTube description block ({count} chapters)</Label>
          <Textarea readOnly value={output} className="mt-1 min-h-[200px] font-mono text-xs" />
          <Button className="mt-2" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>Copy</Button>
        </div>
      )}
    </div>
  );
}