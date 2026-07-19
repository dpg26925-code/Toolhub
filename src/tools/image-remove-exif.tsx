import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MAX = 10 * 1024 * 1024;

// Strips EXIF/metadata by re-encoding through canvas — canvas drops all metadata.
export default function ImageRemoveExifTool() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState<{ url: string; size: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    setOutput(null);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const onFile = (f?: File) => {
    if (!f) return;
    if (f.size > MAX) return toast.error("Max file size is 10MB");
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image");
    setFile(f);
  };

  const strip = async () => {
    if (!file || !url) return;
    setBusy(true);
    try {
      const img = new Image();
      img.src = url;
      await new Promise((r) => (img.onload = r));
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const type = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, type, 0.95));
      if (!blob) throw new Error("Encoding failed");
      if (output) URL.revokeObjectURL(output.url);
      setOutput({ url: URL.createObjectURL(blob), size: blob.size });
      toast.success("Metadata removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const fmt = (b: number) => (b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`);
  const ext = file?.type === "image/png" ? "png" : "jpg";

  return (
    <div className="space-y-6">
      <div>
        <Label>Upload image (max 10MB)</Label>
        <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="mt-1" />
        <p className="mt-2 text-xs text-muted-foreground">
          Removes EXIF, GPS, camera info and other metadata by re-encoding the pixels. Runs entirely in your browser.
        </p>
      </div>
      {file && (
        <>
          <div className="flex gap-2">
            <Button onClick={strip} disabled={busy}>{busy ? "Cleaning…" : "Remove metadata"}</Button>
            {output && (
              <Button variant="outline" asChild>
                <a href={output.url} download={`clean.${ext}`}>Download</a>
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Original (with metadata)</span><span>{fmt(file.size)}</span>
              </div>
              <img src={url} alt="Original" className="mx-auto max-h-64" />
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Clean (no metadata)</span><span>{output ? fmt(output.size) : "—"}</span>
              </div>
              {output ? (
                <img src={output.url} alt="Clean" className="mx-auto max-h-64" />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Click Remove metadata</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}