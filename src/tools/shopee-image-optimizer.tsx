import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Result = { name: string; size: number; w: number; h: number; type: string; optimizedUrl?: string; optimizedSize?: number };

export default function Tool() {
  const [r, setR] = useState<Result | null>(null);

  const onFile = async (f: File | null) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = async () => {
      // Resize to 700x700 JPG @ 0.85
      const c = document.createElement("canvas"); c.width = 700; c.height = 700;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 700, 700);
      const scale = Math.min(700 / img.width, 700 / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (700 - w) / 2, (700 - h) / 2, w, h);
      const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), "image/jpeg", 0.85)!);
      const optUrl = URL.createObjectURL(blob);
      setR({ name: f.name, size: f.size, w: img.width, h: img.height, type: f.type, optimizedUrl: optUrl, optimizedSize: blob.size });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const check = (cond: boolean, ok: string, bad: string) => (
    <div className={`text-sm ${cond ? "text-emerald-500" : "text-destructive"}`}>{cond ? "✓ " + ok : "✗ " + bad}</div>
  );

  return (
    <div className="space-y-4">
      <div><Label>Upload product image</Label><Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="mt-1"/></div>
      {r && (
        <>
          <div className="rounded-lg border p-3 text-sm space-y-1">
            <div className="font-semibold">Checks</div>
            {check(r.size < 500 * 1024, "Size < 500 KB", `Size ${(r.size / 1024).toFixed(0)} KB — target < 500 KB`)}
            {check(r.w >= 700 && r.h >= 700, `Dimensions ${r.w}×${r.h}`, `Dimensions ${r.w}×${r.h} — target ≥ 700×700`)}
            {check(r.type === "image/jpeg", "JPG format", `${r.type} — Shopee prefers JPG`)}
          </div>
          {r.optimizedUrl && (
            <div className="rounded-lg border p-3">
              <div className="mb-2 text-sm font-semibold">Optimized (700×700 JPG)</div>
              <img src={r.optimizedUrl} alt="Optimized" className="mx-auto max-w-xs rounded"/>
              <div className="mt-2 text-center text-xs text-muted-foreground">{(r.optimizedSize! / 1024).toFixed(0)} KB</div>
              <div className="mt-2 text-center"><a href={r.optimizedUrl} download={`shopee-${r.name.replace(/\.[^.]+$/, ".jpg")}`} className="text-primary underline text-sm">Download optimized image</a></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}