import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function flatten(el: Element, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  const children = Array.from(el.children);
  if (!children.length) {
    out[prefix || el.tagName] = el.textContent?.trim() ?? "";
    return out;
  }
  for (const c of children) {
    const key = prefix ? `${prefix}.${c.tagName}` : c.tagName;
    Object.assign(out, flatten(c, key));
  }
  return out;
}

function csvCell(v: string) { return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; }

export default function XmlToCsvTool() {
  const [xml, setXml] = useState(`<?xml version="1.0"?>\n<rows>\n  <row><name>Alice</name><age>30</age></row>\n  <row><name>Bob</name><age>25</age></row>\n</rows>`);
  const [csv, setCsv] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onFile = async (f: File | null) => { if (f) setXml(await f.text()); };

  const convert = () => {
    setError(null); setCsv("");
    try {
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      const err = doc.querySelector("parsererror");
      if (err) throw new Error(err.textContent?.slice(0, 200) ?? "Invalid XML");
      const root = doc.documentElement;
      const rows = Array.from(root.children);
      if (!rows.length) throw new Error("No <row>-like children found");
      const flat = rows.map((r) => flatten(r));
      const headers = Array.from(new Set(flat.flatMap((o) => Object.keys(o))));
      const lines = [headers.map(csvCell).join(","), ...flat.map((o) => headers.map((h) => csvCell(o[h] ?? "")).join(","))];
      setCsv(lines.join("\n"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse failed");
    }
  };

  const download = () => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "output.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div><Label>Upload XML</Label><Input type="file" accept=".xml,application/xml,text/xml" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="mt-1"/></div>
      <div><Label>XML text</Label><Textarea rows={10} value={xml} onChange={(e) => setXml(e.target.value)} className="mt-1 font-mono text-xs"/></div>
      <Button onClick={convert}>Convert to CSV</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {csv && (<>
        <Textarea rows={8} readOnly value={csv} className="font-mono text-xs" />
        <div className="flex gap-2"><Button onClick={download}>Download CSV</Button><Button variant="outline" onClick={() => { navigator.clipboard.writeText(csv); toast.success("Copied"); }}>Copy</Button></div>
      </>)}
    </div>
  );
}