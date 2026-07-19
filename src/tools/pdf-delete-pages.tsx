import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function parseRanges(input: string, total: number): Set<number> {
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
  return set;
}

export default function PdfDeletePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kept, setKept] = useState<number | null>(null);

  const onFile = async (f: File | null) => {
    setFile(f);
    setUrl(null);
    setError(null);
    setKept(null);
    if (!f) return setTotal(0);
    try {
      const doc = await PDFDocument.load(await f.arrayBuffer());
      setTotal(doc.getPageCount());
    } catch {
      setError("Could not read PDF");
    }
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const drop = parseRanges(range, src.getPageCount());
      if (drop.size === 0) throw new Error("Enter which pages to delete");
      if (drop.size >= src.getPageCount()) throw new Error("Cannot delete every page");
      const keepIdx = src.getPageIndices().filter((i) => !drop.has(i));
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, keepIdx);
      pages.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      setUrl(URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })));
      setKept(keepIdx.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {total > 0 && <p className="text-sm text-muted-foreground">{total} pages in this PDF.</p>}
      <div>
        <Label>Pages to delete (e.g. 2, 5-7)</Label>
        <Input value={range} onChange={(e) => setRange(e.target.value)} className="mt-2 font-mono" placeholder="2, 5-7" />
      </div>
      <div className="flex gap-3">
        <Button onClick={run} disabled={!file || busy || !range.trim()}>
          {busy ? "Removing…" : "Delete pages"}
        </Button>
        {url && (
          <Button asChild variant="outline">
            <a href={url} download="trimmed.pdf">Download trimmed.pdf</a>
          </Button>
        )}
      </div>
      {kept !== null && <p className="text-sm text-muted-foreground">Kept {kept} page{kept === 1 ? "" : "s"}.</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}