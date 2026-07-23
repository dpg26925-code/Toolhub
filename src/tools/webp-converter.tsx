import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type Fmt = "png" | "jpg";

export default function WebpConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fmt, setFmt] = useState<Fmt>("png");
  const [quality, setQuality] = useState(92);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState<number>(0);
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
      if (fmt === "jpg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(bitmap, 0, 0);
      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, fmt === "png" ? "image/png" : "image/jpeg", quality / 100)
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
      <Input type="file" accept="image/webp,.webp" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setOutUrl(null); setError(null); }} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Output format</Label>
          <div className="mt-1 flex gap-2">
            <Button size="sm" variant={fmt === "png" ? "default" : "outline"} onClick={() => setFmt("png")}>PNG</Button>
            <Button size="sm" variant={fmt === "jpg" ? "default" : "outline"} onClick={() => setFmt("jpg")}>JPG</Button>
          </div>
        </div>
        {fmt === "jpg" && (
          <div>
            <Label>JPG quality: {quality}</Label>
            <Slider className="mt-2" value={[quality]} min={10} max={100} step={1} onValueChange={(v) => setQuality(v[0])} />
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={run} disabled={!file || busy}>{busy ? "Converting…" : `Convert to ${fmt.toUpperCase()}`}</Button>
        {outUrl && <Button asChild variant="outline"><a href={outUrl} download={`converted.${fmt}`}>Download</a></Button>}
      </div>
      {file && outUrl && (
        <p className="text-sm text-muted-foreground">
          Original: <span className="font-mono text-foreground">{(file.size / 1024).toFixed(1)} KB</span>
          {" · "}Converted: <span className="font-mono text-foreground">{(outSize / 1024).toFixed(1)} KB</span>
          {" · "}Δ {(((outSize - file.size) / file.size) * 100).toFixed(1)}%
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {outUrl && <img src={outUrl} alt="Converted" className="max-h-96 rounded-xl border" />}
    </div>
  );
}