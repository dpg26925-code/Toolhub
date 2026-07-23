import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ImageUpscalerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [factor, setFactor] = useState("2");
  const [enhance, setEnhance] = useState(true);
  const [busy, setBusy] = useState(false);
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number; nw: number; nh: number } | null>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true); setAfter(null);
    try {
      const bmp = await createImageBitmap(file);
      setBefore(URL.createObjectURL(file));
      const f = parseInt(factor, 10);
      const nw = bmp.width * f;
      const nh = bmp.height * f;
      const canvas = document.createElement("canvas");
      canvas.width = nw; canvas.height = nh;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, 0, 0, nw, nh);
      if (enhance) {
        // simple unsharp mask
        const img = ctx.getImageData(0, 0, nw, nh);
        const d = img.data;
        const copy = new Uint8ClampedArray(d);
        const w = nw;
        for (let y = 1; y < nh - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            for (let c = 0; c < 3; c++) {
              const i = (y * w + x) * 4 + c;
              const v = 5 * copy[i] - copy[i - 4] - copy[i + 4] - copy[i - w * 4] - copy[i + w * 4];
              d[i] = Math.max(0, Math.min(255, v * 0.35 + copy[i] * 0.65));
            }
          }
        }
        ctx.putImageData(img, 0, 0);
      }
      const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
      setAfter(URL.createObjectURL(blob));
      setDims({ w: bmp.width, h: bmp.height, nw, nh });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upscale failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setAfter(null); setBefore(null); }} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Upscale factor</Label>
          <Select value={factor} onValueChange={setFactor}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2x</SelectItem>
              <SelectItem value="3">3x</SelectItem>
              <SelectItem value="4">4x</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} /> Sharpen output</label>
        </div>
      </div>
      <Button onClick={run} disabled={!file || busy}>{busy ? "Upscaling…" : "Upscale image"}</Button>
      {(before || after) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {before && <div className="rounded-lg border p-2"><div className="text-xs text-muted-foreground mb-1">Original {dims && `· ${dims.w}×${dims.h}`}</div><img src={before} alt="" className="w-full rounded" /></div>}
          {after && (
            <div className="rounded-lg border p-2 space-y-2">
              <div className="text-xs text-muted-foreground">Upscaled {dims && `· ${dims.nw}×${dims.nh}`}</div>
              <img src={after} alt="" className="w-full rounded" />
              <Button asChild size="sm" variant="outline"><a href={after} download="upscaled.png">Download PNG</a></Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}