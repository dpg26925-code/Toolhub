import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

function parseCSV(text: string, delimiter: string): string[][] {
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

export default function CsvToJsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeader, setHasHeader] = useState(true);

  const convert = () => {
    try {
      const rows = parseCSV(input, delimiter);
      if (rows.length === 0) { setOutput("[]"); return; }
      let json: unknown;
      if (hasHeader) {
        const headers = rows[0];
        json = rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
      } else {
        json = rows;
      }
      setOutput(JSON.stringify(json, null, 2));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to parse CSV");
    }
  };

  const onFile = async (file: File) => {
    setInput(await file.text());
  };

  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };
  const download = () => {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "data.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Delimiter</Label>
          <Input value={delimiter} onChange={(e) => setDelimiter(e.target.value || ",")} maxLength={2} className="mt-1" />
        </div>
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={hasHeader} onCheckedChange={setHasHeader} id="hdr" />
            <Label htmlFor="hdr">First row is header</Label>
          </div>
        </div>
        <div className="flex items-end">
          <Input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </div>
      </div>
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="name,age&#10;Alice,30&#10;Bob,25" className="min-h-[160px] font-mono text-sm" />
      <div className="flex gap-2">
        <Button onClick={convert}>Convert</Button>
        {output && <>
          <Button variant="outline" onClick={copy}>Copy JSON</Button>
          <Button variant="outline" onClick={download}>Download</Button>
        </>}
      </div>
      {output && <Textarea readOnly value={output} className="min-h-[220px] font-mono text-sm" />}
    </div>
  );
}