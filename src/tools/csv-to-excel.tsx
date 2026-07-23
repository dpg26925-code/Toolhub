import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function parseCsv(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let field = "", row: string[] = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === delim) { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (ch !== "\r") field += ch;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export default function CsvToExcelTool() {
  const [text, setText] = useState("name,age,city\nAlice,30,Paris\nBob,25,London");
  const [delim, setDelim] = useState(",");
  const [busy, setBusy] = useState(false);

  const rows = parseCsv(text, delim);

  const onFile = async (f: File | null) => { if (!f) return; setText(await f.text()); };

  const download = async () => {
    setBusy(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, "converted.xlsx");
      toast.success("XLSX downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Upload CSV</Label><Input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="mt-1"/></div>
        <div><Label>Delimiter</Label><Input value={delim} onChange={(e) => setDelim(e.target.value || ",")} className="mt-1"/></div>
      </div>
      <div><Label>CSV text</Label><Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="mt-1 font-mono text-xs" /></div>
      <div className="rounded-lg border overflow-auto max-h-64">
        <table className="text-xs border-collapse w-full">
          <tbody>
            {rows.slice(0, 20).map((r, i) => (
              <tr key={i} className={i === 0 ? "bg-muted font-semibold" : ""}>{r.map((c, j) => <td key={j} className="border px-2 py-1">{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={download} disabled={!rows.length || busy}>{busy ? "Building…" : "Download XLSX"}</Button>
    </div>
  );
}