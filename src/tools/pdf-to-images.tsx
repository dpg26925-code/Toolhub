import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OutFormat = "image/png" | "image/jpeg";
type Rendered = { page: number; url: string; blob: Blob };

export default function PdfToImagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutFormat>("image/png");
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<Rendered[]>([]);

  const reset = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
  };

  const render = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    reset();
    try {
      const pdfjs: any = await import("pdfjs-dist");
      const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const out: Rendered[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const blob: Blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b!), format, 0.92),
        );
        out.push({ page: i, url: URL.createObjectURL(blob), blob });
      }
      setPages(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Render failed");
    } finally {
      setBusy(false);
    }
  };

  const ext = format === "image/png" ? "png" : "jpg";

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Format</Label>
          <div className="mt-2 flex gap-2">
            {(["image/png", "image/jpeg"] as OutFormat[]).map((f) => (
              <Button
                key={f}
                type="button"
                variant={format === f ? "default" : "outline"}
                onClick={() => setFormat(f)}
              >
                {f === "image/png" ? "PNG" : "JPG"}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label>Resolution</Label>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3].map((s) => (
              <Button
                key={s}
                type="button"
                variant={scale === s ? "default" : "outline"}
                onClick={() => setScale(s)}
              >
                {s}x
              </Button>
            ))}
          </div>
        </div>
      </div>
      <Button onClick={render} disabled={!file || busy}>
        {busy ? "Rendering…" : "Convert to images"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {pages.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <div key={p.page} className="rounded-lg border p-3 space-y-2">
              <img src={p.url} alt={`Page ${p.page}`} className="w-full rounded border" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Page {p.page}</span>
                <Button asChild size="sm" variant="outline">
                  <a href={p.url} download={`page-${p.page}.${ext}`}>Download</a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}