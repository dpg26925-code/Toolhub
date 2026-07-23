import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type State = "idle" | "waiting" | "go" | "too-soon" | "result";

export default function ReactionTimeTestTool() {
  const [state, setState] = useState<State>("idle");
  const [ms, setMs] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };

  const start = () => {
    clearTimer();
    setState("waiting"); setMs(null);
    timerRef.current = setTimeout(() => { setState("go"); startRef.current = performance.now(); }, 1200 + Math.random() * 2500);
  };

  const click = () => {
    if (state === "idle" || state === "result" || state === "too-soon") { start(); return; }
    if (state === "waiting") { clearTimer(); setState("too-soon"); return; }
    if (state === "go") {
      const t = Math.round(performance.now() - startRef.current);
      setMs(t); setHistory((h) => [t, ...h].slice(0, 20)); setState("result");
    }
  };

  const stats = history.length ? {
    best: Math.min(...history),
    worst: Math.max(...history),
    avg: Math.round(history.reduce((s, v) => s + v, 0) / history.length),
  } : null;

  const bg = state === "waiting" ? "bg-red-500" : state === "go" ? "bg-emerald-500" : state === "too-soon" ? "bg-amber-500" : "bg-muted";
  const label =
    state === "idle" ? "Click to start" :
    state === "waiting" ? "Wait for green…" :
    state === "go" ? "Click NOW!" :
    state === "too-soon" ? "Too soon — click to retry" :
    `${ms} ms — click for another go`;

  return (
    <div className="space-y-4">
      <button onClick={click} className={`flex h-72 w-full items-center justify-center rounded-2xl text-2xl font-bold text-white transition-colors ${bg}`}>
        {label}
      </button>
      <div className="flex justify-around gap-2">
        <div className="rounded-full h-3 w-3 bg-red-500" title="Red = wait" />
        <div className="rounded-full h-3 w-3 bg-amber-500" title="Amber = too soon" />
        <div className="rounded-full h-3 w-3 bg-emerald-500" title="Green = click!" />
      </div>
      {stats && (
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg border p-2"><div className="text-xs text-muted-foreground">Best</div><div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.best} ms</div></div>
          <div className="rounded-lg border p-2"><div className="text-xs text-muted-foreground">Average</div><div className="text-lg font-bold">{stats.avg} ms</div></div>
          <div className="rounded-lg border p-2"><div className="text-xs text-muted-foreground">Worst</div><div className="text-lg font-bold text-destructive">{stats.worst} ms</div></div>
        </div>
      )}
      {history.length > 0 && (
        <>
          <div className="rounded-lg border p-3">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">History (last {history.length})</div>
            <div className="flex flex-wrap gap-1 text-xs font-mono">{history.map((t, i) => <span key={i} className="rounded border px-2 py-0.5">{t}</span>)}</div>
          </div>
          <Button variant="outline" onClick={() => { setHistory([]); setMs(null); setState("idle"); }}>Reset history</Button>
        </>
      )}
    </div>
  );
}