import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function flip(): "H" | "T" {
  const b = new Uint8Array(1); crypto.getRandomValues(b);
  return b[0] % 2 === 0 ? "H" : "T";
}

export default function CoinFlip() {
  const [n, setN] = useState(1);
  const [results, setResults] = useState<("H" | "T")[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [firstHeadsTries, setFirstHeadsTries] = useState<number | null>(null);

  const doFlip = (count = n) => {
    setSpinning(true);
    const r = Array.from({ length: Math.max(1, Math.min(1000, count)) }, flip);
    setTimeout(() => { setResults(r); setSpinning(false); }, 400);
  };

  const flipUntilHeads = () => {
    let tries = 0;
    const seq: ("H" | "T")[] = [];
    for (;;) {
      tries++;
      const v = flip(); seq.push(v);
      if (v === "H" || tries > 500) break;
    }
    setResults(seq);
    setFirstHeadsTries(tries);
  };

  const stats = useMemo(() => {
    const h = results.filter((x) => x === "H").length;
    const t = results.length - h;
    return { h, t, total: results.length, hp: results.length ? (h / results.length) * 100 : 0 };
  }, [results]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2"><Label>Number of flips</Label><Input type="number" min={1} max={1000} value={n} onChange={(e) => setN(+e.target.value)} className="mt-1" /></div>
        <div className="flex items-end"><Button className="w-full" onClick={() => doFlip()}>Flip</Button></div>
        <div className="flex items-end"><Button className="w-full" variant="outline" onClick={() => { setFirstHeadsTries(null); doFlip(1); }}>Quick flip</Button></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => { setN(10); doFlip(10); }}>10×</Button>
        <Button size="sm" variant="outline" onClick={() => { setN(100); doFlip(100); }}>100×</Button>
        <Button size="sm" variant="outline" onClick={() => { setN(1000); doFlip(1000); }}>1000×</Button>
        <Button size="sm" variant="outline" onClick={flipUntilHeads}>Flip until heads</Button>
      </div>

      {results.length > 0 && (
        <>
          <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-3">
            <div><div className="text-xs uppercase text-muted-foreground">Heads</div><div className="mt-1 text-2xl font-bold text-primary">{stats.h}</div><div className="text-xs text-muted-foreground">{stats.hp.toFixed(1)}%</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">Tails</div><div className="mt-1 text-2xl font-bold">{stats.t}</div><div className="text-xs text-muted-foreground">{(100 - stats.hp).toFixed(1)}%</div></div>
            <div><div className="text-xs uppercase text-muted-foreground">Total flips</div><div className="mt-1 text-2xl font-bold">{stats.total}</div>{firstHeadsTries !== null && <div className="text-xs text-muted-foreground">First heads after {firstHeadsTries} flip{firstHeadsTries === 1 ? "" : "s"}</div>}</div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Distribution</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1"><div className="mb-1 text-xs text-muted-foreground">Heads</div><div className="h-32 rounded-t bg-primary" style={{ height: `${stats.hp * 1.28}px` }} /></div>
              <div className="flex-1"><div className="mb-1 text-xs text-muted-foreground">Tails</div><div className="h-32 rounded-t bg-muted-foreground/50" style={{ height: `${(100 - stats.hp) * 1.28}px` }} /></div>
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">Results</h3>
            {results.length <= 100 ? (
              <div className="flex flex-wrap gap-2">
                {results.map((r, i) => (
                  <div key={i} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${spinning ? "animate-spin" : ""} ${r === "H" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary"}`}>{r}</div>
                ))}
              </div>
            ) : (
              <div className="max-h-40 overflow-auto font-mono text-xs text-muted-foreground">{results.join(" ")}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}