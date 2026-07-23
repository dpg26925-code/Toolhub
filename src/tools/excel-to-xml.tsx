import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function esc(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function safeTag(s: string) { return (s || "col").replace(/[^a-zA-Z0-9_]/g, "_").replace(/^([^a-zA-Z_])/, "_$1") || "col"; }

export default function ExcelToXmlTool() {
  const [xml, setXml] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = async (f: File | null) => {
    if (!f) return;
    setBusy(true); setXml("");
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await f.arrayBuffer());
      const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', "<workbook>"];
      for (const name of wb.SheetNames) {
        const rows: string[][] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, blankrows: false });
        if (!rows.length) continue;
        const headers = rows[0].map((h) => safeTag(String(h)));
        lines.push(`  <sheet name="${esc(name)}">`);
        for (let i = 1; i < rows.length; i++) {
          lines.push("    <row>");
          rows[i].forEach((v, j) => {
            const tag = headers[j] || `col${j + 1}`;
            lines.push(`      <${tag}>${esc(String(v ?? ""))}</${tag}>`);
          });
          lines.push("    </row>");
        }
        lines.push("  </sheet>");
      }
      lines.push("</workbook>");
      setXml(lines.join("\n"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  const download = () => {
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "workbook.xml"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept=".xlsx,.xls,.ods" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={busy} />
      {xml && (
        <>
          <Textarea readOnly value={xml} rows={16} className="font-mono text-xs" />
          <div className="flex gap-2">
            <Button onClick={download}>Download XML</Button>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(xml); toast.success("Copied"); }}>Copy</Button>
          </div>
        </>
      )}
    </div>
  );
}