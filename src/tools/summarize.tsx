import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { summarizeText } from "@/lib/ai.functions";

export default function SummarizeTool() {
  const call = useServerFn(summarizeText);
  const [text, setText] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [style, setStyle] = useState<"bullet" | "paragraph">("paragraph");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setError(null);
    try {
      const r = await call({ data: { text, length, style } });
      setOut(r.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the text you'd like summarised…" className="min-h-[200px]" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Length</Label>
          <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Style</Label>
          <Select value={style} onValueChange={(v) => setStyle(v as typeof style)}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraph">Paragraph</SelectItem>
              <SelectItem value="bullet">Bullet list</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={run} disabled={!text.trim() || busy}>{busy ? "Summarising…" : "Summarise"}</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {out && <div className="rounded-xl border border-border bg-background p-4 whitespace-pre-wrap text-sm">{out}</div>}
    </div>
  );
}