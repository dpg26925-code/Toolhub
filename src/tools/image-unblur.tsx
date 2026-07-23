import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ImageUnblurTool() {
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true); setAfter(null);
    try {
      const bmp = await createImageBitmap(file);
      setBefore(URL.createObjectURL(file));
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width; canvas.height = bmp.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);
      const img = ctx.getImageData(0, 0, bmp.width, bmp.height);
      const d = img.data;
      const copy = new Uint8ClampedArray(d);
      const w = bmp.width, h = bmp.height;
      const k = amount; // sharpening strength
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          for (let c = 0; c < 3; c++) {
            const i = (y * w + x) * 4 + c;
            const center = copy[i];
            const neighbors = copy[i - 4] + copy[i + 4] + copy[i - w * 4] + copy[i + w * 4];
            const laplace = 4 * center - neighbors;
            d[i] = Math.max(0, Math.min(255, center + k * laplace));
          }
        }
      }
      ctx.putImageData(img, 0, 0);
      const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
      setAfter(URL.createObjectURL(blob));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unblur failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setAfter(null); setBefore(null); }} />
      <div>
        <Label>Sharpen amount: {amount.toFixed(2)}</Label>
        <input type="range" min={0.1} max={3} step={0.1} value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full mt-2" />
      </div>
      <Button onClick={run} disabled={!file || busy}>{busy ? "Processing…" : "Unblur image"}</Button>
      {(before || after) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {before && <div className="rounded-lg border p-2"><div className="text-xs text-muted-foreground mb-1">Original</div><img src={before} alt="" className="w-full rounded" /></div>}
          {after && <div className="rounded-lg border p-2 space-y-2"><div className="text-xs text-muted-foreground">Sharpened</div><img src={after} alt="" className="w-full rounded" /><Button asChild size="sm" variant="outline"><a href={after} download="sharpened.png">Download PNG</a></Button></div>}
        </div>
      )}
    </div>
  );
}