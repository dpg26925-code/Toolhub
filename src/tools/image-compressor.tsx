import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const MAX = 10 * 1024 * 1024;
const fmtSize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;

export default function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/jpeg");
  const [output, setOutput] = useState<{ url: string; size: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const onFile = (f?: File) => {
    if (!f) return;
    if (f.size > MAX) return toast.error("Max file size is 10MB");
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image");
    setFile(f);
    setOutput(null);
  };

  const compress = async () => {
    if (!file || !url) return;
    setBusy(true);
    try {
      const img = new Image();
      img.src = url;
      await new Promise((r) => (img.onload = r));
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const blob: Blob | null = await new Promise((res) =>
        canvas.toBlob((b) => res(b), format, quality / 100),
      );
      if (!blob) return toast.error("Compression failed");
      const outUrl = URL.createObjectURL(blob);
      if (output) URL.revokeObjectURL(output.url);
      setOutput({ url: outUrl, size: blob.size });
    } finally {
      setBusy(false);
    }
  };

  const savings =
    file && output ? Math.max(0, Math.round((1 - output.size / file.size) * 100)) : 0;
  const ext = format.split("/")[1];

  return (
    <div className="space-y-6">
      <div>
        <Label>Upload image (max 10MB)</Label>
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onFile(e.target.files?.[0])}
          className="mt-1"
        />
      </div>
      {file && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Quality: {quality}</Label>
              <Slider
                className="mt-3"
                min={1}
                max={100}
                step={1}
                value={[quality]}
                onValueChange={([v]) => setQuality(v)}
              />
            </div>
            <div>
              <Label>Output format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                  <SelectItem value="image/webp">WEBP</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={compress} disabled={busy}>
              {busy ? "Compressing…" : "Compress"}
            </Button>
            {output && (
              <Button variant="outline" asChild>
                <a href={output.url} download={`compressed.${ext}`}>
                  Download
                </a>
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Original</span>
                <span>{fmtSize(file.size)}</span>
              </div>
              <img src={url} alt="Original" className="mx-auto max-h-64 object-contain" />
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Compressed</span>
                <span>
                  {output ? `${fmtSize(output.size)} · -${savings}%` : "—"}
                </span>
              </div>
              {output ? (
                <img src={output.url} alt="Compressed" className="mx-auto max-h-64 object-contain" />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  Click Compress to preview
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}