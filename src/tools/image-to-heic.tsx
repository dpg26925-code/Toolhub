import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Browsers cannot natively encode HEIC (patented codec, no Web API support).
// This tool produces a high-efficiency WebP as the practical browser-side
// equivalent (comparable compression, wide support) and labels it clearly.
export default function ImageToHeicTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true); setError(null); setOutUrl(null);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(bitmap, 0, 0);
      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/webp", quality / 100)
      );
      if (!blob) throw new Error("Encoding failed");
      setOutSize(blob.size);
      setOutUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
        <p className="font-medium text-amber-700 dark:text-amber-400">Note on HEIC encoding</p>
        <p className="mt-1 text-muted-foreground">
          HEIC uses a patented codec and no browser exposes a HEIC encoder. This tool produces a
          high-efficiency <strong>WebP</strong> file — the closest browser-supported equivalent —
          with comparable size and quality. For true HEIC output you need iOS/macOS or a native tool.
        </p>
      </div>
      <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setOutUrl(null); setError(null); }} />
      <div>
        <Label>Quality: {quality}</Label>
        <Slider className="mt-2" value={[quality]} min={10} max={100} step={1} onValueChange={(v) => setQuality(v[0])} />
      </div>
      <div className="flex gap-3">
        <Button onClick={run} disabled={!file || busy}>{busy ? "Encoding…" : "Convert"}</Button>
        {outUrl && <Button asChild variant="outline"><a href={outUrl} download="converted.webp">Download .webp</a></Button>}
      </div>
      {file && outUrl && (
        <p className="text-sm text-muted-foreground">
          Original: <span className="font-mono text-foreground">{(file.size / 1024).toFixed(1)} KB</span>
          {" · "}Output: <span className="font-mono text-foreground">{(outSize / 1024).toFixed(1)} KB</span>
          {" · "}Saved {Math.max(0, Math.round((1 - outSize / file.size) * 100))}%
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {outUrl && <img src={outUrl} alt="Converted" className="max-h-96 rounded-xl border" />}
    </div>
  );
}