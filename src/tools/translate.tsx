import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { translateText } from "@/lib/ai.functions";

const LANGS = ["English", "Vietnamese", "Spanish", "Indonesian"] as const;
type Lang = (typeof LANGS)[number];

export default function TranslateTool() {
  const call = useServerFn(translateText);
  const [text, setText] = useState("");
  const [target, setTarget] = useState<Lang>("Vietnamese");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setError(null);
    try {
      const r = await call({ data: { text, target } });
      setOut(r.translated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Text to translate…" className="min-h-[180px]" />
      <div>
        <Label>Translate to</Label>
        <Select value={target} onValueChange={(v) => setTarget(v as Lang)}>
          <SelectTrigger className="mt-2 max-w-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={run} disabled={!text.trim() || busy}>{busy ? "Translating…" : "Translate"}</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {out && <div className="rounded-xl border border-border bg-background p-4 whitespace-pre-wrap text-sm">{out}</div>}
    </div>
  );
}