import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Rule = { find: string; replace: string; regex: boolean; ci: boolean };

export default function BatchFindReplaceTool() {
  const [text, setText] = useState("");
  const [rules, setRules] = useState<Rule[]>([{ find: "", replace: "", regex: false, ci: false }]);

  const result = useMemo(() => {
    let out = text; let count = 0;
    for (const r of rules) {
      if (!r.find) continue;
      const flags = "g" + (r.ci ? "i" : "");
      const re = r.regex ? new RegExp(r.find, flags) : new RegExp(r.find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      out = out.replace(re, (m) => { count++; return r.replace; });
    }
    return { out, count };
  }, [text, rules]);

  const update = (i: number, p: Partial<Rule>) => setRules(rules.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const add = () => setRules([...rules, { find: "", replace: "", regex: false, ci: false }]);
  const remove = (i: number) => rules.length > 1 && setRules(rules.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <div><Label>Input text</Label><Textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 min-h-[160px] font-mono text-sm"/></div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><Label>Rules ({rules.length})</Label><Button size="sm" variant="outline" onClick={add}>Add rule</Button></div>
        {rules.map((r, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
            <Input placeholder="Find" value={r.find} onChange={(e) => update(i, { find: e.target.value })} className="font-mono text-sm"/>
            <Input placeholder="Replace" value={r.replace} onChange={(e) => update(i, { replace: e.target.value })} className="font-mono text-sm"/>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={r.regex} onChange={(e) => update(i, { regex: e.target.checked })}/>regex</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={r.ci} onChange={(e) => update(i, { ci: e.target.checked })}/>case‑ins</label>
            <Button size="sm" variant="ghost" onClick={() => remove(i)} disabled={rules.length <= 1}>×</Button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Label>Result — {result.count} replacements</Label>
        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(result.out); toast.success("Copied"); }}>Copy</Button>
      </div>
      <Textarea readOnly value={result.out} className="min-h-[160px] font-mono text-sm"/>
    </div>
  );
}