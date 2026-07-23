import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function extractId(url: string): string | null {
  if (!url) return null;
  const m = url.trim().match(/(?:youtu\.be\/|v=|shorts\/|embed\/|\/v\/)([\w-]{11})/);
  if (m) return m[1];
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

const SIZES = [
  { key: "maxresdefault", label: "Max (1280×720)", w: 1280 },
  { key: "sddefault", label: "SD (640×480)", w: 640 },
  { key: "hqdefault", label: "HQ (480×360)", w: 480 },
  { key: "mqdefault", label: "MQ (320×180)", w: 320 },
  { key: "default", label: "Default (120×90)", w: 120 },
];

export default function YoutubeThumbnailDownloaderTool() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const id = useMemo(() => extractId(url), [url]);

  const download = async (key: string) => {
    if (!id) return;
    const src = `https://i.ytimg.com/vi/${id}/${key}.jpg`;
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${id}-${key}.jpg`;
      a.click();
    } catch {
      window.open(src, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>YouTube URL or Video ID</Label>
        <Input className="mt-1" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
        {url && !id && <p className="mt-2 text-sm text-destructive">Could not detect a video ID.</p>}
      </div>
      {id && (
        <div className="grid gap-4 sm:grid-cols-2">
          {SIZES.map((s) => {
            const src = `https://i.ytimg.com/vi/${id}/${s.key}.jpg`;
            return (
              <div key={s.key} className="rounded-md border p-3 space-y-2">
                <div className="text-sm font-medium">{s.label}</div>
                <img src={src} alt={s.label} className="w-full rounded bg-muted" loading="lazy" />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => download(s.key)}>Download</Button>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(src); toast.success("URL copied"); }}>Copy URL</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}