import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function parseRanges(input: string, total: number): Set<number> {
  const set = new Set<number>();
  if (!input.trim() || input.trim().toLowerCase() === "all") {
    for (let i = 0; i < total; i++) set.add(i);
    return set;
  }
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

export default function PdfRotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);
  const [range, setRange] = useState("all");
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (f: File | null) => {
    setFile(f);
    setUrl(null);
    setError(null);
    if (!f) return setTotal(0);
    try {
      const doc = await PDFDocument.load(await f.arrayBuffer());
      setTotal(doc.getPageCount());
    } catch {
      setError("Could not read PDF");
    }
  };

  const rotate = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const targets = parseRanges(range, doc.getPageCount());
      if (targets.size === 0) throw new Error("No valid pages selected");
      doc.getPages().forEach((p, i) => {
        if (!targets.has(i)) return;
        const current = p.getRotation().angle;
        p.setRotation(degrees((current + angle) % 360));
      });
      const bytes = await doc.save();
      setUrl(URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rotate failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {total > 0 && <p className="text-sm text-muted-foreground">{total} pages.</p>}
      <div>
        <Label>Pages (e.g. 1-3, 5 — or "all")</Label>
        <Input value={range} onChange={(e) => setRange(e.target.value)} className="mt-2 font-mono" />
      </div>
      <div>
        <Label>Rotation</Label>
        <div className="mt-2 flex gap-2">
          {[90, 180, 270].map((a) => (
            <Button
              key={a}
              type="button"
              variant={angle === a ? "default" : "outline"}
              onClick={() => setAngle(a as 90 | 180 | 270)}
            >
              {a}°
            </Button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={rotate} disabled={!file || busy}>
          {busy ? "Rotating…" : "Rotate pages"}
        </Button>
        {url && (
          <Button asChild variant="outline">
            <a href={url} download="rotated.pdf">Download rotated.pdf</a>
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}