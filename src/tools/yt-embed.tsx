import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

export default function YtEmbedTool() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [width, setWidth] = useState("560");
  const [height, setHeight] = useState("315");
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [controls, setControls] = useState(true);
  const [mute, setMute] = useState(false);
  const [start, setStart] = useState("");

  const id = extractId(url);
  const code = useMemo(() => {
    if (!id) return "";
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    if (mute) params.set("mute", "1");
    if (!controls) params.set("controls", "0");
    if (loop) { params.set("loop", "1"); params.set("playlist", id); }
    const s = toSeconds(start);
    if (s > 0) params.set("start", String(s));
    const q = params.toString();
    const src = `https://www.youtube.com/embed/${id}${q ? "?" + q : ""}`;
    return `<iframe width="${width}" height="${height}" src="${src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }, [id, width, height, autoplay, loop, controls, mute, start]);

  return (
    <div className="space-y-4">
      <div>
        <Label>YouTube URL</Label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Width</Label><Input value={width} onChange={(e) => setWidth(e.target.value)} className="mt-1" /></div>
        <div><Label>Height</Label><Input value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1" /></div>
        <div><Label>Start time (mm:ss)</Label><Input value={start} onChange={(e) => setStart(e.target.value)} placeholder="0:30" className="mt-1" /></div>
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm"><Switch checked={autoplay} onCheckedChange={setAutoplay} /> Autoplay</label>
        <label className="flex items-center gap-2 text-sm"><Switch checked={loop} onCheckedChange={setLoop} /> Loop</label>
        <label className="flex items-center gap-2 text-sm"><Switch checked={controls} onCheckedChange={setControls} /> Controls</label>
        <label className="flex items-center gap-2 text-sm"><Switch checked={mute} onCheckedChange={setMute} /> Muted</label>
      </div>
      {id && (
        <>
          <div>
            <Label>Preview</Label>
            <div className="mt-2 overflow-hidden rounded-lg border" dangerouslySetInnerHTML={{ __html: code }} />
          </div>
          <div>
            <Label>Embed code</Label>
            <Textarea readOnly value={code} className="mt-1 min-h-[120px] font-mono text-xs" />
            <Button className="mt-2" onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied"); }}>Copy code</Button>
          </div>
        </>
      )}
      {url && !id && <p className="text-sm text-destructive">Could not extract a video ID.</p>}
    </div>
  );
}