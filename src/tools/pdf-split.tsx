import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function parseRanges(input: string, total: number): number[] {
  const set = new Set<number>();
  input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((part) => {
      const m = part.match(/^(\d+)(?:-(\d+))?$/);
      if (!m) return;
      const a = parseInt(m[1], 10);
      const b = m[2] ? parseInt(m[2], 10) : a;
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
        if (i >= 1 && i <= total) set.add(i - 1);
      }
    });
  return Array.from(set).sort((a, b) => a - b);
}

export default function PdfSplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [ranges, setRanges] = useState("1-1");
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (f: File | null) => {
    setFile(f);
    setUrl(null);
    setError(null);
    if (!f) return setTotalPages(0);
    try {
      const src = await PDFDocument.load(await f.arrayBuffer());
      setTotalPages(src.getPageCount());
    } catch {
      setError("Could not read PDF");
    }
  };

  const split = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const indices = parseRanges(ranges, src.getPageCount());
      if (indices.length === 0) throw new Error("No valid pages selected");
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      setUrl(URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {totalPages > 0 && <p className="text-sm text-muted-foreground">{totalPages} pages in this PDF.</p>}
      <div>
        <Label>Pages to extract (e.g. 1-3, 5, 8-10)</Label>
        <Input value={ranges} onChange={(e) => setRanges(e.target.value)} className="mt-2 font-mono" />
      </div>
      <div className="flex gap-3">
        <Button onClick={split} disabled={!file || busy}>
          {busy ? "Splitting…" : "Extract pages"}
        </Button>
        {url && (
          <Button asChild variant="outline">
            <a href={url} download="split.pdf">Download split.pdf</a>
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}