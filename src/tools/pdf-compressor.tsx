import { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function PdfCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url: string; original: number; compressed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (result?.url) URL.revokeObjectURL(result.url);
  }, [result?.url]);

  const compress = async (target = file) => {
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      if (result?.url) URL.revokeObjectURL(result.url);
      const src = await PDFDocument.load(await target.arrayBuffer(), { ignoreEncryption: true });
      const out = await src.save({ useObjectStreams: true, addDefaultPage: false });
      const url = URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" }));
      setResult({ url, original: target.size, compressed: out.byteLength });
      toast.success("PDF ready to download");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed");
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  const savings = result ? Math.max(0, Math.round((1 - result.compressed / result.original) * 100)) : 0;
  const progress = busy ? 65 : result ? 100 : file ? 20 : 0;
  const downloadName = file
    ? `${file.name.replace(/\.pdf$/i, "")}-compressed.pdf`
    : "compressed.pdf";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-border bg-background p-5">
          <label className="mb-3 block text-sm font-medium">Choose a PDF file</label>
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              setFile(next);
              setResult(null);
              setError(null);
              if (next) void compress(next);
            }}
          />
          {file && <p className="mt-3 text-sm text-muted-foreground">{file.name} · {formatBytes(file.size)}</p>}
        </div>

        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">
            In-browser compression re-saves the PDF with object streams. Text-heavy files shrink the most; image-heavy files may see little change.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => compress()} disabled={!file || busy}>
            {busy ? "Compressing…" : result ? "Compress again" : "Compress PDF"}
          </Button>
          <Button asChild variant="outline" aria-disabled={!result} className={!result ? "pointer-events-none opacity-50" : undefined}>
            <a href={result?.url ?? "#"} download={downloadName}>Download {downloadName}</a>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-5 text-sm">
        <h3 className="font-semibold text-foreground">Output</h3>
        {result ? (
          <dl className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Original</dt>
              <dd className="font-medium">{formatBytes(result.original)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Compressed</dt>
              <dd className="font-medium">{formatBytes(result.compressed)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
              <dt className="text-muted-foreground">Saved</dt>
              <dd className="font-semibold text-primary">{savings}%</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-muted-foreground">Upload a PDF to generate a downloadable compressed file.</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}