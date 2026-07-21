import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function randInt(min: number, max: number) {
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

export default function RandomNumberGenerator() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [qty, setQty] = useState(5);
  const [unique, setUnique] = useState(true);
  const [sorted, setSorted] = useState(false);
  const [excludeStr, setExcludeStr] = useState("");
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<number[][]>([]);

  const excludes = useMemo(
    () => new Set(excludeStr.split(/[,\s]+/).map((s) => +s).filter((n) => Number.isFinite(n))),
    [excludeStr]
  );

  const generate = () => {
    const lo = Math.min(min, max), hi = Math.max(min, max);
    const rangeSize = hi - lo + 1 - excludes.size;
    const need = Math.max(1, Math.min(1000, qty));
    if (unique && need > rangeSize) {
      toast.error(`Cannot generate ${need} unique numbers in this range (only ${rangeSize} available).`);
      return;
    }
    const out: number[] = [];
    const seen = new Set<number>();
    let safety = need * 500;
    while (out.length < need && safety-- > 0) {
      const v = randInt(lo, hi);
      if (excludes.has(v)) continue;
      if (unique && seen.has(v)) continue;
      seen.add(v); out.push(v);
    }
    const final = sorted ? [...out].sort((a, b) => a - b) : out;
    setResults(final);
    setHistory((h) => [final, ...h].slice(0, 10));
  };

  const preset = (name: "lotto" | "powerball" | "dice") => {
    if (name === "lotto") { setMin(1); setMax(49); setQty(6); setUnique(true); setSorted(true); }
    else if (name === "powerball") { setMin(1); setMax(69); setQty(5); setUnique(true); setSorted(true); }
    else if (name === "dice") { setMin(1); setMax(6); setQty(2); setUnique(false); setSorted(false); }
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(results.join(", "));
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><Label>Min value</Label><Input type="number" value={min} onChange={(e) => setMin(+e.target.value)} className="mt-1" /></div>
        <div><Label>Max value</Label><Input type="number" value={max} onChange={(e) => setMax(+e.target.value)} className="mt-1" /></div>
        <div><Label>Quantity (1–1000)</Label><Input type="number" min={1} max={1000} value={qty} onChange={(e) => setQty(+e.target.value)} className="mt-1" /></div>
        <div><Label>Exclude</Label><Input placeholder="e.g. 7, 13" value={excludeStr} onChange={(e) => setExcludeStr(e.target.value)} className="mt-1" /></div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} /> Unique numbers only</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sorted} onChange={(e) => setSorted(e.target.checked)} /> Sorted ascending</label>
        <Button size="sm" variant="outline" onClick={() => preset("lotto")}>Lotto 6/49</Button>
        <Button size="sm" variant="outline" onClick={() => preset("powerball")}>Powerball</Button>
        <Button size="sm" variant="outline" onClick={() => preset("dice")}>2 dice</Button>
        <Button className="ml-auto" onClick={generate}>Generate</Button>
      </div>

      {results.length > 0 && (
        <>
          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs uppercase text-muted-foreground">Results ({results.length})</div>
              <Button size="sm" variant="outline" onClick={copyAll}>Copy all</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {results.map((v, i) => (
                <div key={i} className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm font-semibold">{v}</div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 text-xs uppercase text-muted-foreground">Range visualisation ({Math.min(min, max)} – {Math.max(min, max)})</div>
            <div className="relative h-6 rounded-full bg-secondary">
              {results.map((v, i) => {
                const lo = Math.min(min, max), hi = Math.max(min, max);
                const pct = ((v - lo) / (hi - lo)) * 100;
                return <div key={i} className="absolute top-0 h-6 w-0.5 bg-primary" style={{ left: `${pct}%` }} title={String(v)} />;
              })}
            </div>
          </div>
        </>
      )}

      {history.length > 1 && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-2 text-sm font-semibold">Last 10 generations</h3>
          <ul className="space-y-1 text-xs font-mono text-muted-foreground">
            {history.map((h, i) => <li key={i} className="truncate">#{history.length - i}: {h.join(", ")}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}