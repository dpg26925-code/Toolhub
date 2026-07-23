import { useState } from "react";
import { format, type SqlLanguage } from "sql-formatter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Dialect = SqlLanguage;

const DIALECTS: { id: Dialect; label: string }[] = [
  { id: "sql", label: "Standard SQL" },
  { id: "mysql", label: "MySQL" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "sqlite", label: "SQLite" },
  { id: "tsql", label: "SQL Server" },
];

const KEYWORDS = new Set([
  "SELECT","FROM","WHERE","AND","OR","NOT","IN","IS","NULL","LIKE","BETWEEN","INSERT","INTO","VALUES","UPDATE","SET","DELETE","JOIN","LEFT","RIGHT","INNER","OUTER","FULL","ON","GROUP","BY","ORDER","HAVING","LIMIT","OFFSET","AS","DISTINCT","UNION","ALL","CASE","WHEN","THEN","ELSE","END","CREATE","TABLE","INDEX","VIEW","DROP","ALTER","ADD","COLUMN","PRIMARY","KEY","FOREIGN","REFERENCES","DEFAULT","UNIQUE","CHECK","CONSTRAINT","WITH","RETURNING","EXISTS","ANY","SOME","ASC","DESC","IF","BEGIN","COMMIT","ROLLBACK","TRANSACTION","INT","INTEGER","VARCHAR","TEXT","BOOLEAN","DATE","TIMESTAMP","DECIMAL"
]);

function highlight(sql: string): string {
  const escaped = sql
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/('[^']*')/g, '<span class="text-emerald-500">$1</span>')
    .replace(/(--[^\n]*)/g, '<span class="text-muted-foreground italic">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-orange-500">$1</span>')
    .replace(/\b([A-Za-z_]+)\b/g, (m) => KEYWORDS.has(m.toUpperCase())
      ? `<span class="text-primary font-semibold">${m}</span>`
      : m);
}

export default function SqlFormatterTool() {
  const [input, setInput] = useState("select id,name,email from users u join orders o on o.user_id=u.id where u.active=1 and o.total>100 order by o.total desc limit 10;");
  const [output, setOutput] = useState("");
  const [dialect, setDialect] = useState<Dialect>("sql");
  const [uppercase, setUppercase] = useState(true);
  const [useTabs, setUseTabs] = useState(false);
  const [tabWidth, setTabWidth] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    try {
      const out = format(input, {
        language: dialect,
        keywordCase: uppercase ? "upper" : "lower",
        useTabs,
        tabWidth,
      });
      setOutput(out); setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to format SQL");
      setOutput("");
    }
  };

  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };
  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "query.sql"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label>Dialect</Label>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {DIALECTS.map((d) => (
              <Button key={d.id} size="sm" variant={dialect === d.id ? "default" : "outline"} onClick={() => setDialect(d.id)}>{d.label}</Button>
            ))}
          </div>
        </div>
        <div>
          <Label>Keywords</Label>
          <div className="mt-1 flex gap-1.5">
            <Button size="sm" variant={uppercase ? "default" : "outline"} onClick={() => setUppercase(true)}>UPPER</Button>
            <Button size="sm" variant={!uppercase ? "default" : "outline"} onClick={() => setUppercase(false)}>lower</Button>
          </div>
        </div>
        <div>
          <Label>Indent</Label>
          <div className="mt-1 flex items-center gap-2">
            <Button size="sm" variant={!useTabs ? "default" : "outline"} onClick={() => setUseTabs(false)}>Spaces</Button>
            <Button size="sm" variant={useTabs ? "default" : "outline"} onClick={() => setUseTabs(true)}>Tabs</Button>
            {!useTabs && <Input type="number" min={1} max={8} value={tabWidth} onChange={(e) => setTabWidth(Math.max(1, Math.min(8, Number(e.target.value) || 2)))} className="w-16" />}
          </div>
        </div>
      </div>
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste SQL query…" className="min-h-[180px] font-mono text-sm" />
      <div className="flex gap-2">
        <Button onClick={run}>Format SQL</Button>
        {output && <>
          <Button variant="outline" onClick={copy}>Copy</Button>
          <Button variant="outline" onClick={download}>Download .sql</Button>
        </>}
      </div>
      {error && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
      {output && (
        <pre className="overflow-x-auto rounded-xl border bg-muted/40 p-4 text-xs leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: highlight(output) }} />
        </pre>
      )}
    </div>
  );
}