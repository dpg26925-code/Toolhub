import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type Op = { type: "eq" | "add" | "del"; value: string };

function lcsDiff(a: string[], b: string[]): Op[] {
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ type: "eq", value: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: "del", value: a[i++] }); }
    else { ops.push({ type: "add", value: b[j++] }); }
  }
  while (i < n) ops.push({ type: "del", value: a[i++] });
  while (j < m) ops.push({ type: "add", value: b[j++] });
  return ops;
}

export default function TextDiffCheckerTool() {
  const [a, setA] = useState("The quick brown fox\njumps over the lazy dog.");
  const [b, setB] = useState("The quick red fox\nleaps over the lazy dog.");
  const [mode, setMode] = useState<"line" | "word" | "char">("line");
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const ops = useMemo(() => {
    const norm = (s: string) => { let x = s; if (ignoreCase) x = x.toLowerCase(); if (ignoreWs) x = x.replace(/\s+/g, " ").trim(); return x; };
    const split = (s: string) => mode === "line" ? s.split("\n") : mode === "word" ? s.split(/(\s+)/) : Array.from(s);
    const av = split(norm(a)); const bv = split(norm(b));
    return lcsDiff(av, bv);
  }, [a, b, mode, ignoreWs, ignoreCase]);

  const stats = useMemo(() => ({
    add: ops.filter(o => o.type === "add").length,
    del: ops.filter(o => o.type === "del").length,
    eq: ops.filter(o => o.type === "eq").length,
  }), [ops]);

  const cleaned = ops.filter(o => o.type !== "del").map(o => o.value).join(mode === "line" ? "\n" : "");

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList><TabsTrigger value="line">Line</TabsTrigger><TabsTrigger value="word">Word</TabsTrigger><TabsTrigger value="char">Character</TabsTrigger></TabsList>
      </Tabs>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2"><Switch checked={ignoreWs} onCheckedChange={setIgnoreWs} /><Label>Ignore whitespace</Label></div>
        <div className="flex items-center gap-2"><Switch checked={ignoreCase} onCheckedChange={setIgnoreCase} /><Label>Ignore case</Label></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Original</Label><Textarea rows={10} className="mt-1 font-mono text-sm" value={a} onChange={(e) => setA(e.target.value)} /></div>
        <div><Label>Modified</Label><Textarea rows={10} className="mt-1 font-mono text-sm" value={b} onChange={(e) => setB(e.target.value)} /></div>
      </div>
      <div className="flex gap-4 text-sm">
        <span className="text-emerald-600">+{stats.add} added</span>
        <span className="text-rose-600">-{stats.del} removed</span>
        <span className="text-muted-foreground">{stats.eq} unchanged</span>
      </div>
      <div>
        <Label>Diff</Label>
        <div className="mt-1 max-h-96 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-sm whitespace-pre-wrap">
          {ops.map((o, idx) => (
            <span key={idx} className={o.type === "add" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : o.type === "del" ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 line-through" : ""}>
              {o.value}{mode === "line" ? "\n" : ""}
            </span>
          ))}
        </div>
      </div>
      <Button onClick={() => { navigator.clipboard.writeText(cleaned); toast.success("Copied merged result"); }}>Copy merged result</Button>
    </div>
  );
}