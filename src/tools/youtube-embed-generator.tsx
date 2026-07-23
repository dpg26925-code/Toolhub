import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

function extractId(url: string): string | null {
  if (!url) return null;
  const m = url.trim().match(/(?:youtu\.be\/|v=|shorts\/|embed\/|\/v\/)([\w-]{11})/);
  if (m) return m[1];
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

function toSeconds(s: string) {
  if (!s) return 0;
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const parts = s.split(":").map(Number);
  if (parts.some(isNaN)) return 0;
  return parts.reduce((a, b) => a * 60 + b, 0);
}

export default function YoutubeEmbedGeneratorTool() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [width, setWidth] = useState(560);
  const [height, setHeight] = useState(315);
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [controls, setControls] = useState(true);
  const [mute, setMute] = useState(false);
  const [privacy, setPrivacy] = useState(true);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const id = extractId(url);

  const src = useMemo(() => {
    if (!id) return "";
    const host = privacy ? "www.youtube-nocookie.com" : "www.youtube.com";
    const p = new URLSearchParams();
    if (autoplay) p.set("autoplay", "1");
    if (mute) p.set("mute", "1");
    if (!controls) p.set("controls", "0");
    if (loop) { p.set("loop", "1"); p.set("playlist", id); }
    const s = toSeconds(start); if (s) p.set("start", String(s));
    const e = toSeconds(end); if (e) p.set("end", String(e));
    const qs = p.toString();
    return `https://${host}/embed/${id}${qs ? `?${qs}` : ""}`;
  }, [id, privacy, autoplay, mute, controls, loop, start, end]);

  const iframe = src ? `<iframe width="${width}" height="${height}" src="${src}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : "";
  const shortcode = id ? `[youtube id="${id}" width="${width}" height="${height}"${autoplay ? ' autoplay="1"' : ""}]` : "";
  const markdown = id ? `[![YouTube video](https://i.ytimg.com/vi/${id}/hqdefault.jpg)](https://youtu.be/${id})` : "";

  return (
    <div className="space-y-4">
      <div>
        <Label>YouTube URL or Video ID</Label>
        <Input className="mt-1" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Width</Label><Input type="number" className="mt-1" value={width} onChange={(e) => setWidth(+e.target.value)} /></div>
        <div><Label>Height</Label><Input type="number" className="mt-1" value={height} onChange={(e) => setHeight(+e.target.value)} /></div>
        <div><Label>Start (s or MM:SS)</Label><Input className="mt-1" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><Label>End (s or MM:SS)</Label><Input className="mt-1" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Autoplay", autoplay, setAutoplay],["Loop", loop, setLoop],["Controls", controls, setControls],["Mute", mute, setMute],["Privacy (nocookie)", privacy, setPrivacy]].map(([label, val, set]: any) => (
          <div key={label} className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label>{label}</Label><Switch checked={val} onCheckedChange={set} />
          </div>
        ))}
      </div>
      {id && (
        <div className="rounded-md border overflow-hidden bg-black">
          <iframe src={src} width="100%" height={Math.round((height / width) * 640)} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title="Preview" />
        </div>
      )}
      <Tabs defaultValue="html">
        <TabsList>
          <TabsTrigger value="html">HTML iframe</TabsTrigger>
          <TabsTrigger value="wp">WordPress</TabsTrigger>
          <TabsTrigger value="md">Markdown</TabsTrigger>
        </TabsList>
        {[["html", iframe],["wp", shortcode],["md", markdown]].map(([v, code]) => (
          <TabsContent key={v} value={v as string} className="space-y-2 pt-3">
            <Textarea rows={4} className="font-mono text-xs" value={code as string} readOnly />
            <Button size="sm" onClick={() => { navigator.clipboard.writeText(code as string); toast.success("Copied"); }} disabled={!code}>Copy</Button>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}