import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function parseCSV(text: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === delimiter) { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.length > 0 && !(r.length === 1 && r[0] === ""));
}

function escapeCSV(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export default function CsvViewerTool() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [search, setSearch] = useState("");
  const [sortIdx, setSortIdx] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const onFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) { setHeaders([]); setRows([]); return; }
      setHeaders(parsed[0]);
      setRows(parsed.slice(1));
      setSortIdx(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to read CSV");
    }
  };

  const view = useMemo(() => {
    let r = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((row) => row.some((c) => c.toLowerCase().includes(q)));
    }
    if (sortIdx !== null) {
      r = [...r].sort((a, b) => {
        const av = a[sortIdx] ?? "";
        const bv = b[sortIdx] ?? "";
        const na = Number(av); const nb = Number(bv);
        const cmp = !isNaN(na) && !isNaN(nb) && av !== "" && bv !== "" ? na - nb : av.localeCompare(bv);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [rows, search, sortIdx, sortDir]);

  const toggleSort = (i: number) => {
    if (sortIdx === i) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortIdx(i); setSortDir("asc"); }
  };

  const download = () => {
    const csv = [headers, ...view].map((r) => r.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        {rows.length > 0 && (
          <Input placeholder="Search rows…" value={search} onChange={(e) => setSearch(e.target.value)} />
        )}
      </div>
      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{view.length} of {rows.length} rows · {headers.length} columns</span>
            <Button size="sm" variant="outline" onClick={download}>Export CSV</Button>
          </div>
          <div className="max-h-[520px] overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="cursor-pointer p-2 text-left font-semibold hover:bg-muted-foreground/10" onClick={() => toggleSort(i)}>
                      {h || `Col ${i + 1}`}
                      {sortIdx === i && <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {view.map((r, i) => (
                  <tr key={i} className="border-t">
                    {headers.map((_, j) => <td key={j} className="whitespace-nowrap p-2">{r[j] ?? ""}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}