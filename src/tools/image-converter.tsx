import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

type Fmt = "png" | "jpeg" | "webp" | "avif";
const MIME: Record<Fmt, string> = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp", avif: "image/avif" };

export default function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Fmt>("webp");
  const [quality, setQuality] = useState(0.9);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!file) return;
    setBusy(true); setUrl(null);
    try {
      const img = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, MIME[format], format === "png" ? undefined : quality),
      );
      if (!blob) throw new Error(`Your browser can't encode ${format.toUpperCase()}`);
      setUrl(URL.createObjectURL(blob));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUrl(null); }} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Target format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as Fmt)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpeg">JPG</SelectItem>
              <SelectItem value="webp">WEBP</SelectItem>
              <SelectItem value="avif">AVIF</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {format !== "png" && (
          <div>
            <Label>Quality: {Math.round(quality * 100)}%</Label>
            <Slider className="mt-3" value={[quality * 100]} min={40} max={100} step={5} onValueChange={([v]) => setQuality(v / 100)} />
          </div>
        )}
      </div>
      <Button onClick={run} disabled={!file || busy}>{busy ? "Converting…" : "Convert image"}</Button>
      {url && (
        <div className="space-y-2 rounded-xl border border-border bg-background p-4">
          <img src={url} alt="Converted" className="max-h-96 rounded" />
          <Button variant="outline" asChild><a href={url} download={`image.${format}`}>Download .{format}</a></Button>
        </div>
      )}
    </div>
  );
}