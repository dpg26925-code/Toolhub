import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Input } from "@/components/ui/input";

type Row = { name: string; pages: number; size: string };

export default function PdfPageCounterTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const run = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    const out: Row[] = [];
    for (const f of Array.from(files)) {
      try {
        const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
        out.push({ name: f.name, pages: doc.getPageCount(), size: `${(f.size / 1024).toFixed(0)} KB` });
      } catch {
        out.push({ name: f.name, pages: 0, size: `${(f.size / 1024).toFixed(0)} KB` });
      }
    }
    setRows(out); setBusy(false);
  };

  const total = rows.reduce((s, r) => s + r.pages, 0);

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" multiple onChange={(e) => run(e.target.files)} />
      {busy && <p className="text-sm text-muted-foreground">Counting…</p>}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr><th className="p-2 text-left">File</th><th className="p-2 text-right">Pages</th><th className="p-2 text-right">Size</th></tr></thead>
            <tbody>
              {rows.map((r, i) => <tr key={i} className="border-t"><td className="p-2">{r.name}</td><td className="p-2 text-right font-mono">{r.pages}</td><td className="p-2 text-right text-muted-foreground">{r.size}</td></tr>)}
              <tr className="border-t bg-muted/40 font-semibold"><td className="p-2">Total ({rows.length} files)</td><td className="p-2 text-right font-mono">{total}</td><td className="p-2"/></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}