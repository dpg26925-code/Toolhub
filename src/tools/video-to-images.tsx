import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Frame = { time: number; url: string; blob: Blob; size: number };

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

function seek(video: HTMLVideoElement, t: number) {
  return new Promise<void>((resolve) => {
    const done = () => { video.removeEventListener("seeked", done); resolve(); };
    video.addEventListener("seeked", done);
    video.currentTime = Math.min(t, Math.max(0, video.duration - 0.01));
  });
}

async function makeZip(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (u: Uint8Array) => {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < u.length; i++) c = (crcTable[(c ^ u[i]) & 0xFF] ^ (c >>> 8)) >>> 0;
    return (c ^ 0xFFFFFFFF) >>> 0;
  };
  const u32 = (n: number) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
  const u16 = (n: number) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);
  const concat = (arrs: Uint8Array[]) => {
    const total = arrs.reduce((s, a) => s + a.length, 0);
    const out = new Uint8Array(total);
    let p = 0; for (const a of arrs) { out.set(a, p); p += a.length; }
    return out;
  };

  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const data = new Uint8Array(await f.blob.arrayBuffer());
    const crc = crc32(data);
    const local = concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(data.length), u32(data.length),
      u16(nameBytes.length), u16(0), nameBytes, data,
    ]);
    chunks.push(local);
    central.push(concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(data.length), u32(data.length),
      u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset),
      nameBytes,
    ]));
    offset += local.length;
  }
  const centralBlob = concat(central);
  const end = concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(centralBlob.length), u32(offset), u16(0),
  ]);
  return new Blob([concat(chunks), centralBlob, end], { type: "application/zip" });
}

export default function VideoToImagesTool() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [interval, setInt] = useState(1);
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const extract = async () => {
    if (!file) return;
    setBusy(true); setFrames([]);
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto"; video.src = url; video.muted = true;
    await new Promise<void>((r) => (video.onloadedmetadata = () => r()));
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    const out: Frame[] = [];
    try {
      for (let t = 0; t < video.duration; t += interval) {
        await seek(video, t);
        ctx.drawImage(video, 0, 0);
        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), format, quality));
        out.push({ time: t, url: URL.createObjectURL(blob), blob, size: blob.size });
        if (out.length >= 500) break;
      }
      setFrames(out);
    } catch (e) {
      toast.error("Extraction failed");
    } finally {
      URL.revokeObjectURL(url); setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!frames.length) return;
    const ext = format === "image/png" ? "png" : "jpg";
    const zip = await makeZip(frames.map((f, i) => ({ name: `frame-${String(i + 1).padStart(4, "0")}-${f.time.toFixed(2)}s.${ext}`, blob: f.blob })));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(zip); a.download = "frames.zip"; a.click();
  };

  const totalSize = frames.reduce((s, f) => s + f.size, 0);

  return (
    <div className="space-y-4">
      <div>
        <Label>Video file</Label>
        <input type="file" accept="video/*" className="mt-1 block w-full text-sm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Every N seconds</Label><Input type="number" step="0.1" min="0.1" className="mt-1" value={interval} onChange={(e) => setInt(Math.max(0.1, +e.target.value))} /></div>
        <div>
          <Label>Format</Label>
          <select className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={format} onChange={(e) => setFormat(e.target.value as any)}>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
          </select>
        </div>
        <div><Label>Quality (JPEG)</Label><Input type="number" step="0.05" min="0.1" max="1" className="mt-1" value={quality} onChange={(e) => setQuality(+e.target.value)} disabled={format !== "image/jpeg"} /></div>
      </div>
      <div className="flex gap-2">
        <Button onClick={extract} disabled={!file || busy}>{busy ? "Extracting…" : "Extract frames"}</Button>
        <Button variant="outline" onClick={downloadZip} disabled={!frames.length}>Download ZIP</Button>
      </div>
      {frames.length > 0 && (
        <>
          <div className="text-sm text-muted-foreground">{frames.length} frames · {fmtSize(totalSize)}</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {frames.map((f, i) => (
              <div key={i} className="rounded border overflow-hidden">
                <img src={f.url} alt={`Frame ${i + 1}`} className="w-full aspect-video object-cover bg-black" loading="lazy" />
                <div className="px-1 py-0.5 text-[10px] font-mono text-muted-foreground">{f.time.toFixed(2)}s</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}