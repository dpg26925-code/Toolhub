import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

type Preset = "custom" | "8bit" | "minecraft" | "blur";

export default function ImagePixelateTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [pixelSize, setPixelSize] = useState(12);
  const [preserveEdges, setPreserveEdges] = useState(false);
  const [preset, setPreset] = useState<Preset>("custom");

  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error("Load failed"));
      im.src = URL.createObjectURL(file);
    });

  const applyPreset = (p: Preset) => {
    setPreset(p);
    if (p === "8bit") { setPixelSize(8); setPreserveEdges(false); }
    else if (p === "minecraft") { setPixelSize(24); setPreserveEdges(true); }
    else if (p === "blur") { setPixelSize(18); setPreserveEdges(false); }
  };

  useEffect(() => {
    const c = canvasRef.current; if (!c || !img) return;
    const w = img.naturalWidth, h = img.naturalHeight;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d"); if (!ctx) return;

    const size = Math.max(2, pixelSize);
    const dw = Math.max(1, Math.floor(w / size));
    const dh = Math.max(1, Math.floor(h / size));

    const tmp = document.createElement("canvas");
    tmp.width = dw; tmp.height = dh;
    const tctx = tmp.getContext("2d")!;
    tctx.imageSmoothingEnabled = preset === "blur";
    tctx.drawImage(img, 0, 0, dw, dh);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmp, 0, 0, dw, dh, 0, 0, w, h);

    if (preserveEdges) {
      // Simple edge overlay: draw grayscale edges (Sobel-lite) on top
      const src = document.createElement("canvas");
      src.width = w; src.height = h;
      const sctx = src.getContext("2d")!;
      sctx.drawImage(img, 0, 0);
      const data = sctx.getImageData(0, 0, w, h);
      const out = ctx.getImageData(0, 0, w, h);
      const d = data.data, o = out.data;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = (y * w + x) * 4;
          const gx = -d[i - 4] + d[i + 4];
          const gy = -d[i - w * 4] + d[i + w * 4];
          const g = Math.min(255, Math.abs(gx) + Math.abs(gy));
          if (g > 60) { o[i] = 0; o[i + 1] = 0; o[i + 2] = 0; }
        }
      }
      ctx.putImageData(out, 0, 0);
    }
  }, [img, pixelSize, preserveEdges, preset]);

  const download = () => {
    const c = canvasRef.current; if (!c) return;
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "pixelated.png"; a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImg(await loadImage(f)); }} />
      <div className="flex flex-wrap gap-2">
        {(["custom", "8bit", "minecraft", "blur"] as Preset[]).map((p) => (
          <Button key={p} size="sm" variant={preset === p ? "default" : "outline"} onClick={() => applyPreset(p)}>
            {p === "custom" ? "Custom" : p === "8bit" ? "8-bit" : p === "minecraft" ? "Minecraft" : "Blur pixelate"}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Pixel size: {pixelSize}px</Label>
          <Slider className="mt-2" value={[pixelSize]} min={2} max={50} step={1} onValueChange={(v) => { setPixelSize(v[0]); setPreset("custom"); }} />
        </div>
        <div className="flex items-end gap-2">
          <Switch id="pe" checked={preserveEdges} onCheckedChange={(v) => { setPreserveEdges(v); setPreset("custom"); }} />
          <Label htmlFor="pe">Preserve edges</Label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={download} disabled={!img}>Download PNG</Button>
      </div>
      <div className="overflow-hidden rounded-xl border bg-muted/40 p-2">
        <canvas ref={canvasRef} className="mx-auto block max-h-[520px] w-auto max-w-full" />
        {!img && <p className="p-8 text-center text-sm text-muted-foreground">Upload an image to pixelate.</p>}
      </div>
    </div>
  );
}