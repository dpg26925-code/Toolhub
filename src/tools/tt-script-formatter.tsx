import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TtScriptFormatter() {
  const [text, setText] = useState("");
  const formatted = useMemo(() => {
    const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
    const wpm = 150; // TikTok pace ~2.5 wps
    let total = 0;
    return lines.map((l, i) => {
      const words = l.split(/\s+/).length;
      const sec = Math.max(1, Math.round((words / wpm) * 60));
      total += sec;
      return { i, l, sec, elapsed: total };
    });
  }, [text]);
  const totalSec = formatted.reduce((s, x) => s + x.sec, 0);
  const copy = () => {
    const out = formatted.map((x) => `[${x.elapsed}s] ${x.l}`).join("\n");
    navigator.clipboard.writeText(out); toast.success("Copied");
  };
  return (
    <div className="space-y-4">
      <div>
        <Label>Your script (one beat per line)</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 min-h-[180px]" placeholder={"Hook — you won't believe this trick\nProblem — most people do X wrong\nSolution — here's the fix\nCTA — follow for more"} />
      </div>
      <div className="rounded-xl border bg-card">
        {formatted.map((x) => (
          <div key={x.i} className="flex gap-3 border-b p-3 last:border-b-0">
            <span className="w-16 shrink-0 rounded bg-secondary px-2 py-1 text-center text-xs font-mono">{x.elapsed}s</span>
            <span className="flex-1 text-sm">{x.l}</span>
            <span className="text-xs text-muted-foreground">{x.sec}s</span>
          </div>
        ))}
      </div>
      {formatted.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Estimated total: <b className="text-foreground">{totalSec}s</b> · {totalSec > 60 ? "Trim for <60s TikTok" : "Fits under 60s"}</p>
          <Button variant="outline" onClick={copy}>Copy with timing</Button>
        </div>
      )}
    </div>
  );
}