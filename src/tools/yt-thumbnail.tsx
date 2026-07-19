import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function extractId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.trim().match(p);
    if (m) return m[1];
  }
  return null;
}

const RES = [
  { key: "maxresdefault", label: "Max HD", size: "1280×720" },
  { key: "sddefault", label: "SD", size: "640×480" },
  { key: "hqdefault", label: "HQ", size: "480×360" },
  { key: "mqdefault", label: "MQ", size: "320×180" },
  { key: "default", label: "Default", size: "120×90" },
];

export default function YtThumbnailTool() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const id = extractId(url);

  const download = async (res: string) => {
    if (!id) return;
    const u = `https://img.youtube.com/vi/${id}/${res}.jpg`;
    try {
      const r = await fetch(u);
      if (!r.ok) throw new Error("Not available");
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${id}-${res}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Downloaded");
    } catch {
      toast.error("This resolution isn't available for this video");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">YouTube URL or Video ID</label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
        {url && !id && <p className="mt-2 text-sm text-destructive">Could not extract a video ID.</p>}
      </div>
      {id && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RES.map((r) => (
            <div key={r.key} className="rounded-lg border p-3">
              <div className="aspect-video overflow-hidden rounded bg-muted">
                <img
                  src={`https://img.youtube.com/vi/${id}/${r.key}.jpg`}
                  alt={`${r.label} thumbnail`}
                  className="h-full w-full object-cover"
                  onError={(e) => ((e.currentTarget.style.opacity = "0.3"))}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.size}</p>
                </div>
                <Button size="sm" onClick={() => download(r.key)}>Download</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}