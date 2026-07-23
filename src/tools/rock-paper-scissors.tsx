import { useState } from "react";
import { Button } from "@/components/ui/button";

type Move = "rock" | "paper" | "scissors";
const MOVES: Move[] = ["rock", "paper", "scissors"];
const EMOJI: Record<Move, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };

function winner(a: Move, b: Move): "player" | "cpu" | "draw" {
  if (a === b) return "draw";
  if ((a === "rock" && b === "scissors") || (a === "paper" && b === "rock") || (a === "scissors" && b === "paper")) return "player";
  return "cpu";
}

export default function RockPaperScissorsTool() {
  const [player, setPlayer] = useState<Move | null>(null);
  const [cpu, setCpu] = useState<Move | null>(null);
  const [result, setResult] = useState<"player" | "cpu" | "draw" | null>(null);
  const [score, setScore] = useState({ player: 0, cpu: 0, draws: 0 });
  const [streak, setStreak] = useState({ current: 0, best: 0, side: "" as "" | "player" | "cpu" });
  const [history, setHistory] = useState<{ p: Move; c: Move; r: "player" | "cpu" | "draw" }[]>([]);

  const play = (m: Move) => {
    const c = MOVES[Math.floor(Math.random() * 3)];
    const r = winner(m, c);
    setPlayer(m); setCpu(c); setResult(r);
    setScore((s) => ({ player: s.player + (r === "player" ? 1 : 0), cpu: s.cpu + (r === "cpu" ? 1 : 0), draws: s.draws + (r === "draw" ? 1 : 0) }));
    setHistory((h) => [{ p: m, c, r }, ...h].slice(0, 20));
    setStreak((s) => {
      if (r === "draw") return s;
      if (s.side === r) { const cur = s.current + 1; return { current: cur, best: Math.max(cur, s.best), side: r }; }
      return { current: 1, best: Math.max(1, s.best), side: r };
    });
  };

  const reset = () => { setScore({ player: 0, cpu: 0, draws: 0 }); setHistory([]); setStreak({ current: 0, best: 0, side: "" }); setPlayer(null); setCpu(null); setResult(null); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 rounded-lg border p-3 text-center text-sm">
        <div>You <div className="text-2xl font-bold">{score.player}</div></div>
        <div>Draws <div className="text-2xl font-bold">{score.draws}</div></div>
        <div>CPU <div className="text-2xl font-bold">{score.cpu}</div></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-6 text-center">
          <div className="text-xs text-muted-foreground">You</div>
          <div className="mt-2 text-6xl">{player ? EMOJI[player] : "❓"}</div>
        </div>
        <div className="rounded-lg border p-6 text-center">
          <div className="text-xs text-muted-foreground">CPU</div>
          <div className="mt-2 text-6xl">{cpu ? EMOJI[cpu] : "❓"}</div>
        </div>
      </div>
      {result && <div className={`text-center text-lg font-semibold ${result === "player" ? "text-emerald-600 dark:text-emerald-400" : result === "cpu" ? "text-destructive" : ""}`}>{result === "player" ? "You win!" : result === "cpu" ? "CPU wins" : "Draw"}</div>}
      <div className="grid grid-cols-3 gap-2">
        {MOVES.map((m) => (
          <Button key={m} onClick={() => play(m)} className="h-16 text-2xl">{EMOJI[m]} <span className="ml-2 text-sm capitalize">{m}</span></Button>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Streak: {streak.current} {streak.side && `(${streak.side})`}</span>
        <span>Best: {streak.best}</span>
        <Button size="sm" variant="ghost" onClick={reset}>Reset</Button>
      </div>
      {history.length > 0 && (
        <div className="rounded-lg border p-3">
          <div className="mb-1 text-xs font-semibold text-muted-foreground">History</div>
          <div className="flex flex-wrap gap-1 text-xs">
            {history.map((h, i) => (
              <span key={i} className={`rounded border px-2 py-0.5 ${h.r === "player" ? "border-emerald-500/40" : h.r === "cpu" ? "border-destructive/40" : ""}`}>
                {EMOJI[h.p]} vs {EMOJI[h.c]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}