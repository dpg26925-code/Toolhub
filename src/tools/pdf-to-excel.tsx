import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Row = string[];
type Sheet = { page: number; rows: Row[] };

function clusterToRows(items: { str: string; x: number; y: number }[]): Row[] {
  if (!items.length) return [];
  // group into rows by y (tolerance 4)
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: { y: number; cells: { x: number; str: string }[] }[] = [];
  for (const it of sorted) {
    let row = rows.find((r) => Math.abs(r.y - it.y) < 4);
    if (!row) { row = { y: it.y, cells: [] }; rows.push(row); }
    row.cells.push({ x: it.x, str: it.str });
  }
  return rows.map((r) => {
    r.cells.sort((a, b) => a.x - b.x);
    // merge cells whose x-gap < 4
    const merged: string[] = [];
    let prev: { x: number; str: string } | null = null;
    for (const c of r.cells) {
      if (prev && c.x - prev.x < 4) merged[merged.length - 1] += c.str;
      else merged.push(c.str);
      prev = c;
    }
    return merged.map((s) => s.trim()).filter((s) => s.length);
  }).filter((r) => r.length);
}

export default function PdfToExcelTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [sheets, setSheets] = useState<Sheet[]>([]);

  const extract = async () => {
    if (!file) return;
    setBusy(true); setSheets([]);
    try {
      const pdfjs: typeof import("pdfjs-dist") = await import("pdfjs-dist");
      const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const result: Sheet[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const tc = await page.getTextContent();
        const items = tc.items.map((it: { str: string; transform: number[] }) => ({ str: it.str, x: it.transform[4], y: it.transform[5] }));
        result.push({ page: i, rows: clusterToRows(items) });
      }
      setSheets(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Extract failed");
    } finally {
      setBusy(false);
    }
  };

  const downloadCsv = () => {
    const csv = sheets.flatMap((s) => [`# Page ${s.page}`, ...s.rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))]).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "extracted.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadXlsx = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    sheets.forEach((s) => {
      const ws = XLSX.utils.aoa_to_sheet(s.rows);
      XLSX.utils.book_append_sheet(wb, ws, `Page ${s.page}`);
    });
    XLSX.writeFile(wb, "extracted.xlsx");
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <Button onClick={extract} disabled={!file || busy}>{busy ? "Extracting…" : "Extract tables"}</Button>
      {sheets.length > 0 && (
        <>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCsv}>Download CSV</Button>
            <Button variant="outline" onClick={downloadXlsx}>Download XLSX</Button>
          </div>
          {sheets.map((s) => (
            <div key={s.page} className="rounded-lg border p-3 overflow-auto max-h-96">
              <div className="text-sm font-semibold mb-2">Page {s.page} · {s.rows.length} rows</div>
              <table className="text-xs border-collapse">
                <tbody>
                  {s.rows.slice(0, 30).map((r, i) => (
                    <tr key={i}>{r.map((c, j) => <td key={j} className="border px-2 py-1">{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              {s.rows.length > 30 && <p className="text-xs text-muted-foreground mt-2">…and {s.rows.length - 30} more rows in download.</p>}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Note: PDFs vary. Rows are inferred from text positions and may need manual cleanup.</p>
        </>
      )}
    </div>
  );
}