import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { rewriteText } from "@/lib/ai.functions";

export default function RewriteTool() {
  const call = useServerFn(rewriteText);
  const [text, setText] = useState("");
  const [tone, setTone] = useState<"formal" | "casual" | "professional">("professional");
  const [length, setLength] = useState<"shorter" | "same" | "longer">("same");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setError(null);
    try {
      const r = await call({ data: { text, tone, length } });
      setOut(r.rewritten);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Text to rewrite…" className="min-h-[200px]" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Tone</Label>
          <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Length</Label>
          <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="shorter">Shorter</SelectItem>
              <SelectItem value="same">About the same</SelectItem>
              <SelectItem value="longer">Longer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={run} disabled={!text.trim() || busy}>{busy ? "Rewriting…" : "Rewrite"}</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {out && <div className="rounded-xl border border-border bg-background p-4 whitespace-pre-wrap text-sm">{out}</div>}
    </div>
  );
}