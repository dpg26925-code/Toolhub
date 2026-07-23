import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Meta = {
  filename: string; size: number; type: string;
  duration: number; width: number; height: number;
  aspectRatio: string; videoTracks: number; audioTracks: number;
};

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function fmtDur(s: number) {
  if (!isFinite(s)) return "—";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = Math.floor(s % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }

export default function VideoMetadataViewerTool() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      const w = video.videoWidth, h = video.videoHeight;
      const g = w && h ? gcd(w, h) : 1;
      const v: any = video;
      setMeta({
        filename: file.name,
        size: file.size,
        type: file.type || "unknown",
        duration: video.duration,
        width: w, height: h,
        aspectRatio: w && h ? `${w / g}:${h / g}` : "—",
        videoTracks: v.videoTracks?.length ?? (w ? 1 : 0),
        audioTracks: v.audioTracks?.length ?? (v.mozHasAudio || Boolean(v.webkitAudioDecodedByteCount) ? 1 : 0),
      });
    };
    video.onerror = () => toast.error("Could not read this video");
  };

  const bitrate = meta && meta.duration ? (meta.size * 8) / meta.duration / 1000 : 0;

  const rows: [string, string][] = meta ? [
    ["Filename", meta.filename],
    ["MIME type", meta.type],
    ["File size", fmtSize(meta.size)],
    ["Duration", fmtDur(meta.duration)],
    ["Resolution", meta.width ? `${meta.width} × ${meta.height}` : "—"],
    ["Aspect ratio", meta.aspectRatio],
    ["Avg. bitrate", bitrate ? `${bitrate.toFixed(0)} kbps` : "—"],
    ["Video tracks", String(meta.videoTracks)],
    ["Audio tracks", String(meta.audioTracks)],
  ] : [];

  return (
    <div className="space-y-4">
      <div>
        <Label>Video file (MP4, WebM, MOV, MKV, AVI)</Label>
        <input type="file" accept="video/*" className="mt-1 block w-full text-sm" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {previewUrl && <video src={previewUrl} controls className="w-full max-h-96 rounded-md bg-black" />}
      {meta && (
        <>
          <div className="rounded-md border divide-y">
            {rows.map(([k, v]) => (
              <div key={k} className="flex px-4 py-2 text-sm">
                <div className="w-40 text-muted-foreground">{k}</div>
                <div className="flex-1 font-mono break-all">{v}</div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(rows.map(r => r.join(": ")).join("\n")); toast.success("Copied"); }}>Copy metadata</Button>
          <p className="text-xs text-muted-foreground">Codec and detailed track info aren't exposed to the browser. For codec/bitrate strings, use ffprobe or a native player.</p>
        </>
      )}
    </div>
  );
}