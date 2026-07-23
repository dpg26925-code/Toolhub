import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Target = "js" | "json" | "python" | "php" | "java" | "xml" | "url" | "sql";
type Mode = "escape" | "unescape";

function escape(mode: Target, s: string, doubleQuotes = true): string {
  const q = doubleQuotes ? '"' : "'";
  if (mode === "url") return encodeURIComponent(s);
  if (mode === "json") return JSON.stringify(s).slice(1, -1);
  if (mode === "xml") return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  if (mode === "sql") return s.replace(/'/g, "''");
  // js / python / php / java
  let out = "";
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (ch === "\\") out += "\\\\";
    else if (ch === q) out += "\\" + q;
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch === "\t") out += "\\t";
    else if (code < 0x20 || code === 0x7f) out += "\\x" + code.toString(16).padStart(2, "0");
    else out += ch;
  }
  return out;
}

function unescape(mode: Target, s: string): string {
  if (mode === "url") { try { return decodeURIComponent(s); } catch { return s; } }
  if (mode === "json") { try { return JSON.parse(`"${s.replace(/(^|[^\\])"/g, '$1\\"')}"`); } catch { return s; } }
  if (mode === "xml") return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  if (mode === "sql") return s.replace(/''/g, "'");
  return s.replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");
}

export default function StringEscaperTool() {
  const [target, setTarget] = useState<Target>("js");
  const [mode, setMode] = useState<Mode>("escape");
  const [doubleQuotes, setDoubleQuotes] = useState(true);
  const [text, setText] = useState('Hello "world"\nLine 2\tTabbed');

  const output = useMemo(() => mode === "escape" ? escape(target, text, doubleQuotes) : unescape(target, text), [target, text, mode, doubleQuotes]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Target</Label>
          <Select value={target} onValueChange={(v) => setTarget(v as Target)}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="js">JavaScript</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="xml">XML / HTML</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="escape">Escape</SelectItem><SelectItem value="unescape">Unescape</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={doubleQuotes} onChange={(e) => setDoubleQuotes(e.target.checked)} /> Double quotes</label></div>
      </div>
      <div><Label>Input</Label><Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} className="mt-1 font-mono text-sm"/></div>
      <div><div className="mb-1 flex items-center justify-between"><Label>Output</Label><Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>Copy</Button></div><Textarea rows={6} readOnly value={output} className="font-mono text-sm"/></div>
    </div>
  );
}