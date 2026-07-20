import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Thumb = { t: number; url: string };

export default function VideoThumbnailGeneratorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(6);
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const [busy, setBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true); setThumbs([]);
    const v = document.createElement("video");
    v.src = URL.createObjectURL(file); v.muted = true; v.playsInline = true;
    await new Promise<void>((r) => { v.onloadedmetadata = () => r(); });
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d")!;
    const out: Thumb[] = [];
    for (let i = 1; i <= count; i++) {
      const t = (v.duration * i) / (count + 1);
      await new Promise<void>((r) => { v.onseeked = () => r(); v.currentTime = t; });
      ctx.drawImage(v, 0, 0);
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.9));
      if (blob) out.push({ t, url: URL.createObjectURL(blob) });
    }
    setThumbs(out); setBusy(false);
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="video/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setThumbs([]); }} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Number of thumbnails</Label><Input type="number" min={1} max={30} value={count} onChange={(e) => setCount(+e.target.value || 6)} className="mt-1"/></div>
      </div>
      <Button onClick={run} disabled={!file || busy}>{busy ? "Extracting…" : "Generate thumbnails"}</Button>
      <video ref={videoRef} className="hidden"/>
      {thumbs.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
          {thumbs.map((t, i) => (
            <div key={i} className="space-y-1">
              <img src={t.url} alt={`t=${t.t}`} className="rounded-lg border"/>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.t.toFixed(1)}s</span>
                <a href={t.url} download={`thumb-${i + 1}.jpg`} className="text-primary hover:underline">Save</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}