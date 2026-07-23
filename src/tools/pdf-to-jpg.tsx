import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Rendered = { page: number; url: string; blob: Blob };

export default function PdfToJpgTool({ mime = "image/jpeg" as "image/jpeg" | "image/png" }: { mime?: "image/jpeg" | "image/png" }) {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [pages, setPages] = useState<Rendered[]>([]);
  const ext = mime === "image/jpeg" ? "jpg" : "png";

  const render = async () => {
    if (!file) return;
    setBusy(true); setPages([]);
    try {
      const pdfjs: typeof import("pdfjs-dist") = await import("pdfjs-dist");
      const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const out: Rendered[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
        const ctx = canvas.getContext("2d")!;
        if (mime === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
        const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), mime, 0.92));
        out.push({ page: i, url: URL.createObjectURL(blob), blob });
      }
      setPages(out);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Render failed");
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    pages.forEach((p) => zip.file(`page-${p.page}.${ext}`, p.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `pdf-to-${ext}.zip`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div>
        <Label>Resolution</Label>
        <Select value={String(scale)} onValueChange={(v) => setScale(+v)}>
          <SelectTrigger className="mt-1 max-w-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="1">1x</SelectItem><SelectItem value="2">2x</SelectItem><SelectItem value="3">3x</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button onClick={render} disabled={!file || busy}>{busy ? "Rendering…" : `Convert to ${ext.toUpperCase()}`}</Button>
        {pages.length > 0 && <Button variant="outline" onClick={downloadZip}>Download all as ZIP</Button>}
      </div>
      {pages.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <div key={p.page} className="rounded-lg border p-2 space-y-2">
              <img src={p.url} alt={`Page ${p.page}`} className="w-full rounded border" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Page {p.page}</span>
                <Button asChild size="sm" variant="outline"><a href={p.url} download={`page-${p.page}.${ext}`}>Download</a></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}