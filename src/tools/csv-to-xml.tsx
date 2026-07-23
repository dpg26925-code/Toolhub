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
function esc(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function safeTag(s: string, i: number) { const t = (s || "").replace(/[^a-zA-Z0-9_]/g, "_").replace(/^([^a-zA-Z_])/, "_$1"); return t || `col${i + 1}`; }

export default function CsvToXmlTool() {
  const [csv, setCsv] = useState("name,age,city\nAlice,30,Paris\nBob,25,London");
  const [delim, setDelim] = useState(",");
  const [rootTag, setRootTag] = useState("rows");
  const [rowTag, setRowTag] = useState("row");

  const rows = parseCsv(csv, delim);
  const headers = rows[0] || [];
  const xml = [`<?xml version="1.0" encoding="UTF-8"?>`, `<${rootTag}>`,
    ...rows.slice(1).map((r) => `  <${rowTag}>${headers.map((h, i) => `\n    <${safeTag(h, i)}>${esc(r[i] ?? "")}</${safeTag(h, i)}>`).join("")}\n  </${rowTag}>`),
    `</${rootTag}>`].join("\n");

  const onFile = async (f: File | null) => { if (f) setCsv(await f.text()); };
  const download = () => {
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.xml"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Upload CSV</Label><Input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="mt-1" /></div>
        <div><Label>Delimiter</Label><Input value={delim} onChange={(e) => setDelim(e.target.value || ",")} className="mt-1" /></div>
        <div><Label>Root tag</Label><Input value={rootTag} onChange={(e) => setRootTag(e.target.value)} className="mt-1 font-mono"/></div>
        <div><Label>Row tag</Label><Input value={rowTag} onChange={(e) => setRowTag(e.target.value)} className="mt-1 font-mono"/></div>
      </div>
      <div><Label>CSV text</Label><Textarea rows={6} value={csv} onChange={(e) => setCsv(e.target.value)} className="mt-1 font-mono text-xs"/></div>
      <div><Label>XML output</Label><Textarea rows={12} readOnly value={xml} className="mt-1 font-mono text-xs"/></div>
      <div className="flex gap-2"><Button onClick={download}>Download XML</Button><Button variant="outline" onClick={() => { navigator.clipboard.writeText(xml); toast.success("Copied"); }}>Copy</Button></div>
    </div>
  );
}