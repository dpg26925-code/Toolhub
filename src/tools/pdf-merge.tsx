import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PdfMergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles(Array.from(list));
    setUrl(null);
    setError(null);
  };

  const merge = async () => {
    setBusy(true);
    setError(null);
    try {
      const out = await PDFDocument.create();
      for (const f of files) {
        const bytes = await f.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const blob = new Blob([await out.save()], { type: "application/pdf" });
      setUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to merge PDFs");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" multiple onChange={(e) => onFiles(e.target.files)} />
      {files.length > 0 && (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {files.map((f, i) => (
            <li key={i}>
              {i + 1}. {f.name} ({(f.size / 1024).toFixed(0)} KB)
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-3">
        <Button onClick={merge} disabled={files.length < 2 || busy}>
          {busy ? "Merging…" : "Merge PDFs"}
        </Button>
        {url && (
          <Button asChild variant="outline">
            <a href={url} download="merged.pdf">
              Download merged.pdf
            </a>
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}