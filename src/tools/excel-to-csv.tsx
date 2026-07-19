import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ExcelToCsvTool() {
  const [sheets, setSheets] = useState<string[]>([]);
  const [wb, setWb] = useState<XLSX.WorkBook | null>(null);
  const [current, setCurrent] = useState<string>("");
  const [csv, setCsv] = useState("");

  const onFile = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const book = XLSX.read(buf);
      setWb(book);
      setSheets(book.SheetNames);
      setCurrent(book.SheetNames[0]);
      setCsv(XLSX.utils.sheet_to_csv(book.Sheets[book.SheetNames[0]]));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Cannot read spreadsheet"); }
  };

  const pickSheet = (name: string) => {
    setCurrent(name);
    if (wb) setCsv(XLSX.utils.sheet_to_csv(wb.Sheets[name]));
  };

  const download = () => {
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${current || "sheet"}.csv`; a.click();
  };
  const copy = async () => { await navigator.clipboard.writeText(csv); toast.success("Copied"); };

  return (
    <div className="space-y-4">
      <Input type="file" accept=".xlsx,.xls,.ods" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      {sheets.length > 0 && (
        <div>
          <Label>Sheet</Label>
          <Select value={current} onValueChange={pickSheet}>
            <SelectTrigger className="mt-1 max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{sheets.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      {csv && (
        <>
          <div className="flex gap-2"><Button onClick={download}>Download CSV</Button><Button variant="outline" onClick={copy}>Copy</Button></div>
          <textarea readOnly value={csv} className="min-h-[240px] w-full rounded-lg border border-border bg-background p-3 font-mono text-xs" />
        </>
      )}
    </div>
  );
}