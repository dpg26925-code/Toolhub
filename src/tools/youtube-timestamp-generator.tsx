import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

function extractId(url: string): string | null {
  const m = url.trim().match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  if (m) return m[1];
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
}
function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}
function parseTs(t: string) {
  const parts = t.split(":").map(Number);
  if (parts.some(isNaN)) return 0;
  return parts.reduce((a, b) => a * 60 + b, 0);
}

export default function YoutubeTimestampGeneratorTool() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [raw, setRaw] = useState("0:00 Intro\n0:45 What is it\n2:30 Setup\n5:10 Demo\n8:20 Conclusion");
  const id = extractId(url);

  const entries = useMemo(() => {
    return raw.split("\n").map((line) => {
      const m = line.match(/^\s*((?:\d+:)?\d{1,2}:\d{2})\s+(.+)$/);
      if (!m) return null;
      return { ts: m[1], sec: parseTs(m[1]), title: m[2].trim() };
    }).filter(Boolean) as { ts: string; sec: number; title: string }[];
  }, [raw]);

  const description = entries.map((e) => `${e.ts} ${e.title}`).join("\n");
  const html = `<ul>\n${entries.map((e) => id
    ? `  <li><a href="https://youtu.be/${id}?t=${e.sec}">${e.ts}</a> ${e.title}</li>`
    : `  <li>${e.ts} ${e.title}</li>`).join("\n")}\n</ul>`;
  const links = entries.map((e) => id ? `https://youtu.be/${id}?t=${e.sec} — ${e.ts} ${e.title}` : `${e.ts} ${e.title}`).join("\n");

  const addNow = () => setRaw((r) => `${r}${r.endsWith("\n") || !r ? "" : "\n"}${fmt(0)} New chapter\n`);

  return (
    <div className="space-y-4">
      <div>
        <Label>YouTube URL (optional, for linkified output)</Label>
        <Input className="mt-1" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <div>
        <Label>Timestamps (one per line: <code className="text-xs">MM:SS Title</code>)</Label>
        <Textarea rows={8} className="mt-1 font-mono text-sm" value={raw} onChange={(e) => setRaw(e.target.value)} />
        <Button variant="outline" size="sm" className="mt-2" onClick={addNow}>+ Add chapter</Button>
      </div>
      <Tabs defaultValue="desc">
        <TabsList>
          <TabsTrigger value="desc">YouTube description</TabsTrigger>
          <TabsTrigger value="links">Link list</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
        </TabsList>
        {[["desc", description], ["links", links], ["html", html]].map(([v, code]) => (
          <TabsContent key={v} value={v as string} className="space-y-2 pt-3">
            <Textarea rows={8} className="font-mono text-xs" value={code as string} readOnly />
            <Button size="sm" onClick={() => { navigator.clipboard.writeText(code as string); toast.success("Copied"); }} disabled={!code}>Copy</Button>
          </TabsContent>
        ))}
      </Tabs>
      <p className="text-xs text-muted-foreground">Tip: YouTube auto-generates chapters when the first timestamp is 00:00 and each entry is on its own line.</p>
    </div>
  );
}