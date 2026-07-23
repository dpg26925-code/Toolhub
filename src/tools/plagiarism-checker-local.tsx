import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function ngrams(text: string, n = 5): Set<string> {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const s = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) s.add(words.slice(i, i + n).join(" "));
  return s;
}

export default function PlagiarismCheckerLocal() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState<{ score: number; matches: string[] } | null>(null);

  const check = () => {
    const na = ngrams(a);
    const nb = ngrams(b);
    if (na.size === 0 || nb.size === 0) return setResult({ score: 0, matches: [] });
    const matches = [...na].filter(g => nb.has(g));
    const score = (matches.length / Math.min(na.size, nb.size)) * 100;
    setResult({ score, matches: matches.slice(0, 30) });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="text-sm font-medium">Your text</label><Textarea rows={10} value={a} onChange={e => setA(e.target.value)} /></div>
        <div><label className="text-sm font-medium">Reference text</label><Textarea rows={10} value={b} onChange={e => setB(e.target.value)} /></div>
      </div>
      <Button onClick={check}>Check similarity</Button>
      {result && (
        <div className="rounded-lg border p-4">
          <div className="text-3xl font-bold">{result.score.toFixed(1)}% similar</div>
          <div className="mt-2 h-3 rounded-full bg-muted">
            <div className="h-3 rounded-full" style={{ width: `${Math.min(100, result.score)}%`, background: result.score > 30 ? "#ef4444" : result.score > 10 ? "#f97316" : "#22c55e" }} />
          </div>
          {result.matches.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Matching 5-word phrases:</div>
              <ul className="space-y-1 text-sm">{result.matches.map((m, i) => <li key={i} className="rounded bg-yellow-500/20 px-2 py-1 font-mono">{m}</li>)}</ul>
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">This is a basic 5-gram overlap check, not a substitute for Turnitin, iThenticate or similar services.</p>
    </div>
  );
}
