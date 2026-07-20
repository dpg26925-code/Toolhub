import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PdfUnlockTool() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true); setError(null); setUrl(null);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const pages = await out.copyPages(doc, doc.getPageIndices());
      pages.forEach((p) => out.addPage(p));
      const data = await out.save();
      setUrl(URL.createObjectURL(new Blob([data as BlobPart], { type: "application/pdf" })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not unlock PDF. If the file requires a password to open, it cannot be removed in-browser.");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUrl(null); setError(null); }} />
      <p className="text-xs text-muted-foreground">Removes owner/print/copy restrictions on PDFs that open without a password. PDFs that require a password to open cannot be unlocked in the browser.</p>
      <div className="flex gap-3">
        <Button onClick={run} disabled={!file || busy}>{busy ? "Unlocking…" : "Unlock PDF"}</Button>
        {url && <Button asChild variant="outline"><a href={url} download="unlocked.pdf">Download unlocked.pdf</a></Button>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}