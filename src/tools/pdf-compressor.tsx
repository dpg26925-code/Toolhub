import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PdfCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url: string; original: number; compressed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const out = await src.save({ useObjectStreams: true, addDefaultPage: false });
      const url = URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" }));
      setResult({ url, original: file.size, compressed: out.byteLength });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed");
    } finally {
      setBusy(false);
    }
  };

  const savings = result ? Math.max(0, Math.round((1 - result.compressed / result.original) * 100)) : 0;

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }} />
      <p className="text-xs text-muted-foreground">
        In-browser compression re-saves the PDF with object streams. Text-heavy files shrink the most; image-heavy files may see little change.
      </p>
      <div className="flex gap-3">
        <Button onClick={compress} disabled={!file || busy}>
          {busy ? "Compressing…" : "Compress PDF"}
        </Button>
        {result && (
          <Button asChild variant="outline">
            <a href={result.url} download="compressed.pdf">Download compressed.pdf</a>
          </Button>
        )}
      </div>
      {result && (
        <div className="rounded-xl border border-border bg-background p-4 text-sm">
          <div>Original: {(result.original / 1024).toFixed(1)} KB</div>
          <div>Compressed: {(result.compressed / 1024).toFixed(1)} KB</div>
          <div className="mt-1 font-medium text-primary">Saved {savings}%</div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}