import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function extractId(url: string): string | null {
  const m = url.trim().match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})|^([\w-]{11})$/);
  return m ? (m[1] || m[2]) : null;
}
function toSeconds(t: string): number {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  const parts = t.split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

export default function YtTimestampTool() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [time, setTime] = useState("1:30");
  const [label, setLabel] = useState("Watch this part");

  const id = extractId(url);
  const seconds = toSeconds(time);
  const links = useMemo(() => {
    if (!id) return null;
    const long = `https://www.youtube.com/watch?v=${id}&t=${seconds}s`;
    const short = `https://youtu.be/${id}?t=${seconds}`;
    const md = `[${label || time}](${long})`;
    const html = `<a href="${long}">${label || time}</a>`;
    return { long, short, md, html };
  }, [id, seconds, label, time]);

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success("Copied"); };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Label>YouTube URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1" /></div>
        <div><Label>Time (mm:ss)</Label><Input value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" /></div>
      </div>
      <div><Label>Link text (optional)</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} className="mt-1" /></div>
      {links && (
        <div className="space-y-3">
          {[
            { label: "Full URL", v: links.long },
            { label: "Short URL", v: links.short },
            { label: "Markdown", v: links.md },
            { label: "HTML", v: links.html },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-2 rounded-md border p-2">
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">{r.label}</span>
              <code className="flex-1 truncate text-xs">{r.v}</code>
              <Button size="sm" variant="ghost" onClick={() => copy(r.v)}>Copy</Button>
            </div>
          ))}
        </div>
      )}
      {url && !id && <p className="text-sm text-destructive">Could not extract a video ID.</p>}
    </div>
  );
}