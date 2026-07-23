import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Align = "left" | "center" | "right";

function escPipe(s: string) { return s.replace(/\|/g, "\\|"); }

export default function MarkdownTableGeneratorTool() {
  const [rowsN, setRowsN] = useState(3);
  const [colsN, setColsN] = useState(3);
  const [align, setAlign] = useState<Align[]>(["left", "left", "left"]);
  const [data, setData] = useState<string[][]>([
    ["Name", "Role", "City"],
    ["Alice", "Engineer", "Paris"],
    ["Bob", "Designer", "London"],
  ]);
  const [escape, setEscape] = useState(true);

  const resize = (r: number, c: number) => {
    setRowsN(r); setColsN(c);
    const next: string[][] = [];
    for (let i = 0; i < r; i++) {
      const row: string[] = [];
      for (let j = 0; j < c; j++) row.push(data[i]?.[j] ?? "");
      next.push(row);
    }
    setData(next);
    setAlign((a) => Array.from({ length: c }, (_, i) => a[i] ?? "left"));
  };

  const setCell = (r: number, c: number, v: string) => {
    setData((d) => d.map((row, ri) => row.map((cv, ci) => ri === r && ci === c ? v : cv)));
  };

  const markdown = useMemo(() => {
    const cell = (v: string) => escape ? escPipe(v) : v;
    const alignBar = (a: Align) => a === "left" ? ":---" : a === "center" ? ":---:" : "---:";
    const header = `| ${data[0].map(cell).join(" | ")} |`;
    const sep = `| ${align.map(alignBar).join(" | ")} |`;
    const body = data.slice(1).map((r) => `| ${r.map(cell).join(" | ")} |`).join("\n");
    return [header, sep, body].filter(Boolean).join("\n");
  }, [data, align, escape]);

  const html = useMemo(() => {
    const alignAttr = (a: Align) => ` style="text-align:${a}"`;
    const th = `<tr>${data[0].map((v, i) => `<th${alignAttr(align[i])}>${v}</th>`).join("")}</tr>`;
    const rows = data.slice(1).map((r) => `<tr>${r.map((v, i) => `<td${alignAttr(align[i])}>${v}</td>`).join("")}</tr>`).join("");
    return `<table>\n<thead>${th}</thead>\n<tbody>${rows}</tbody>\n</table>`;
  }, [data, align]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Rows (incl. header)</Label><Input type="number" min={2} max={30} value={rowsN} onChange={(e) => resize(Math.max(2, Math.min(30, +e.target.value)), colsN)} className="mt-1"/></div>
        <div><Label>Columns</Label><Input type="number" min={1} max={12} value={colsN} onChange={(e) => resize(rowsN, Math.max(1, Math.min(12, +e.target.value)))} className="mt-1"/></div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={escape} onChange={(e) => setEscape(e.target.checked)} /> Escape pipes (\|)</label></div>
      </div>
      <div className="overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>{align.map((a, i) => (
              <th key={i} className="p-1 border-b">
                <Select value={a} onValueChange={(v) => setAlign((arr) => arr.map((x, j) => j === i ? (v as Align) : x))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="center">Center</SelectItem><SelectItem value="right">Right</SelectItem></SelectContent>
                </Select>
              </th>
            ))}</tr>
          </thead>
          <tbody>
            {data.map((row, r) => (
              <tr key={r}>{row.map((v, c) => (
                <td key={c} className="border-b border-r p-0"><Input value={v} onChange={(e) => setCell(r, c, e.target.value)} className={`h-9 border-0 rounded-none ${r === 0 ? "font-semibold" : ""}`}/></td>
              ))}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>Markdown</Label><Textarea rows={8} readOnly value={markdown} className="mt-1 font-mono text-xs"/><Button size="sm" variant="outline" className="mt-2" onClick={() => { navigator.clipboard.writeText(markdown); toast.success("Copied"); }}>Copy Markdown</Button></div>
        <div><Label>HTML</Label><Textarea rows={8} readOnly value={html} className="mt-1 font-mono text-xs"/><Button size="sm" variant="outline" className="mt-2" onClick={() => { navigator.clipboard.writeText(html); toast.success("Copied"); }}>Copy HTML</Button></div>
      </div>
    </div>
  );
}