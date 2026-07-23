import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function stripComments(code: string, keepComments: boolean) {
  if (keepComments) return code;
  let out = "";
  let i = 0;
  const n = code.length;
  let inStr: string | null = null;
  let inTpl = false;
  let inRegex = false;
  let prev = "";
  while (i < n) {
    const c = code[i];
    const next = code[i + 1];
    if (inStr) {
      out += c;
      if (c === "\\") { out += next; i += 2; continue; }
      if (c === inStr) inStr = null;
      i++; continue;
    }
    if (inTpl) {
      out += c;
      if (c === "\\") { out += next; i += 2; continue; }
      if (c === "`") inTpl = false;
      i++; continue;
    }
    if (inRegex) {
      out += c;
      if (c === "\\") { out += next; i += 2; continue; }
      if (c === "/") inRegex = false;
      i++; continue;
    }
    if (c === "/" && next === "/") { while (i < n && code[i] !== "\n") i++; continue; }
    if (c === "/" && next === "*") { i += 2; while (i < n && !(code[i] === "*" && code[i + 1] === "/")) i++; i += 2; continue; }
    if (c === '"' || c === "'") { inStr = c; out += c; i++; continue; }
    if (c === "`") { inTpl = true; out += c; i++; continue; }
    if (c === "/" && /[=(,;:!&|?{}\n\r]/.test(prev || "")) { inRegex = true; out += c; i++; continue; }
    out += c;
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out;
}

function minifyJs(code: string, { keepComments, mangle }: { keepComments: boolean; mangle: boolean }) {
  let out = stripComments(code, keepComments);
  let s = "";
  let inStr: string | null = null;
  let inTpl = false;
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (inStr) { s += c; if (c === "\\") { s += out[++i]; continue; } if (c === inStr) inStr = null; continue; }
    if (inTpl) { s += c; if (c === "\\") { s += out[++i]; continue; } if (c === "`") inTpl = false; continue; }
    if (c === '"' || c === "'") { inStr = c; s += c; continue; }
    if (c === "`") { inTpl = true; s += c; continue; }
    if (c === "\n" || c === "\t" || c === "\r") { s += " "; continue; }
    s += c;
  }
  let r = "";
  inStr = null; inTpl = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) { r += c; if (c === "\\") { r += s[++i]; continue; } if (c === inStr) inStr = null; continue; }
    if (inTpl) { r += c; if (c === "\\") { r += s[++i]; continue; } if (c === "`") inTpl = false; continue; }
    if (c === '"' || c === "'") { inStr = c; r += c; continue; }
    if (c === "`") { inTpl = true; r += c; continue; }
    if (c === " " && r.endsWith(" ")) continue;
    r += c;
  }
  r = r.replace(/ ?([{}();,:=+\-*/<>!&|?[\]]) ?/g, "$1").trim();
  if (mangle) {
    const counts = new Map<string, number>();
    r.replace(/\b([A-Za-z_$][\w$]*)\b/g, (_: string, id: string) => { counts.set(id, (counts.get(id) || 0) + 1); return ""; });
    const RESERVED = new Set("if else return function var let const true false null undefined new this class extends import export from as async await try catch finally throw for while do break continue switch case default typeof instanceof in of yield void delete debugger with static get set super public private protected".split(" "));
    const reMap = new Map<string, string>();
    let n = 0;
    for (const [id, count] of counts) {
      if (count < 2 || id.length < 4 || RESERVED.has(id) || /^[A-Z]/.test(id)) continue;
      let short = "";
      let m = n++;
      do { short = String.fromCharCode(97 + (m % 26)) + short; m = Math.floor(m / 26) - 1; } while (m >= 0);
      if (counts.has(short)) continue;
      reMap.set(id, short);
    }
    for (const [long, short] of reMap) {
      r = r.replace(new RegExp(`\\b${long}\\b`, "g"), short);
    }
  }
  return r;
}

export default function JavascriptMinifier() {
  const [code, setCode] = useState("function greet(name) {\n  // say hi\n  console.log('Hello, ' + name);\n}\ngreet('world');\n");
  const [keepComments, setKeepComments] = useState(false);
  const [mangle, setMangle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const output = useMemo(() => {
    try {
      new Function(code);
      setError(null);
      return minifyJs(code, { keepComments, mangle });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Syntax error");
      return "";
    }
  }, [code, keepComments, mangle]);

  const before = new Blob([code]).size;
  const after = new Blob([output]).size;
  const saved = before ? Math.round((1 - after / before) * 100) : 0;

  const onFile = async (f: File | null) => { if (f) setCode(await f.text()); };
  const copy = async () => { await navigator.clipboard.writeText(output); toast.success("Copied"); };
  const download = () => {
    const blob = new Blob([output], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "script.min.js"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>Source JavaScript</Label>
            <Input type="file" accept=".js,text/javascript" className="h-8 w-auto" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </div>
          <Textarea rows={16} value={code} onChange={(e) => setCode(e.target.value)} className="font-mono text-xs" />
          {error && <p className="text-xs text-destructive mt-1">Syntax error: {error}</p>}
        </div>
        <div>
          <Label>Minified output</Label>
          <Textarea rows={16} value={output} readOnly className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground mt-1">Original: {before}B · Minified: {after}B · Saved {saved}%</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2"><Switch id="c" checked={keepComments} onCheckedChange={setKeepComments} /><Label htmlFor="c">Preserve comments</Label></div>
        <div className="flex items-center gap-2"><Switch id="m" checked={mangle} onCheckedChange={setMangle} /><Label htmlFor="m">Mangle variables</Label></div>
        <Button onClick={copy} disabled={!output}>Copy</Button>
        <Button variant="outline" onClick={download} disabled={!output}>Download .min.js</Button>
      </div>
    </div>
  );
}