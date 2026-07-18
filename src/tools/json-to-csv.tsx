import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function escapeCSV(v: unknown, delimiter: string): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  if (s.includes(delimiter) || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export default function JsonToCsvTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState(",");

  const convert = () => {
    try {
      const data = JSON.parse(input);
      if (!Array.isArray(data)) throw new Error("JSON must be an array");
      if (data.length === 0) { setOutput(""); return; }
      const isObjects = typeof data[0] === "object" && data[0] !== null && !Array.isArray(data[0]);
      let csv = "";
      if (isObjects) {
        const headers = Array.from(new Set(data.flatMap((r: Record<string, unknown>) => Object.keys(r))));
        csv += headers.map((h) => escapeCSV(h, delimiter)).join(delimiter) + "\n";
        for (const row of data as Record<string, unknown>[]) {
          csv += headers.map((h) => escapeCSV(row[h], delimiter)).join(delimiter) + "\n";
        }
      } else {
        for (const row of data) {
          const arr = Array.isArray(row) ? row : [row];
          csv += arr.map((v: unknown) => escapeCSV(v, delimiter)).join(delimiter) + "\n";
        }
      }
      setOutput(csv);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };
  const download = () => {
    const blob = new Blob([output], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "data.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <Label>Delimiter</Label>
        <Input value={delimiter} onChange={(e) => setDelimiter(e.target.value || ",")} maxLength={2} className="mt-1" />
      </div>
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='[{"name":"Alice","age":30},{"name":"Bob","age":25}]' className="min-h-[180px] font-mono text-sm" />
      <div className="flex gap-2">
        <Button onClick={convert}>Convert</Button>
        {output && <>
          <Button variant="outline" onClick={copy}>Copy CSV</Button>
          <Button variant="outline" onClick={download}>Download</Button>
        </>}
      </div>
      {output && <Textarea readOnly value={output} className="min-h-[220px] font-mono text-sm" />}
    </div>
  );
}