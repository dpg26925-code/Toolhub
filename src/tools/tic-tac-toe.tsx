import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Cell = "X" | "O" | null;
type Mode = "pvp" | "pvai";

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function winnerOf(b: Cell[]): { winner: Cell; line: number[] | null } {
  for (const l of LINES) { const [a,b1,c] = l; if (b[a] && b[a] === b[b1] && b[a] === b[c]) return { winner: b[a], line: l }; }
  return { winner: null, line: null };
}
function minimax(b: Cell[], player: "X" | "O"): number {
  const w = winnerOf(b).winner;
  if (w === "O") return 1; if (w === "X") return -1;
  if (b.every(Boolean)) return 0;
  const scores: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (!b[i]) { b[i] = player; scores.push(minimax(b, player === "O" ? "X" : "O")); b[i] = null; }
  }
  return player === "O" ? Math.max(...scores) : Math.min(...scores);
}
function bestMove(b: Cell[]): number {
  let best = -Infinity, move = -1;
  for (let i = 0; i < 9; i++) {
    if (!b[i]) { b[i] = "O"; const s = minimax(b, "X"); b[i] = null; if (s > best) { best = s; move = i; } }
  }
  return move;
}

export default function TicTacToeTool() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [mode, setMode] = useState<Mode>("pvai");
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("hard");
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 });

  const { winner, line } = winnerOf(board);
  const draw = !winner && board.every(Boolean);
  const gameOver = !!winner || draw;

  useEffect(() => {
    if (mode !== "pvai" || turn !== "O" || gameOver) return;
    const t = setTimeout(() => {
      const empty = board.map((c, i) => c ? -1 : i).filter((i) => i >= 0);
      const move = difficulty === "easy" ? empty[Math.floor(Math.random() * empty.length)] : bestMove([...board]);
      if (move >= 0) { setBoard((b) => b.map((c, i) => i === move ? "O" : c)); setTurn("X"); }
    }, 350);
    return () => clearTimeout(t);
  }, [turn, mode, board, gameOver, difficulty]);

  useEffect(() => {
    if (winner) setScore((s) => ({ ...s, [winner]: s[winner] + 1 }));
    else if (draw) setScore((s) => ({ ...s, draw: s.draw + 1 }));
  }, [winner, draw]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = (i: number) => {
    if (board[i] || gameOver) return;
    if (mode === "pvai" && turn !== "X") return;
    setBoard((b) => b.map((c, j) => j === i ? turn : c));
    setTurn((t) => t === "X" ? "O" : "X");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Mode</Label><Select value={mode} onValueChange={(v) => { setMode(v as Mode); setBoard(Array(9).fill(null)); setTurn("X"); }}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="pvp">Player vs Player</SelectItem><SelectItem value="pvai">Player vs AI</SelectItem></SelectContent></Select></div>
        {mode === "pvai" && <div><Label>AI difficulty</Label><Select value={difficulty} onValueChange={(v) => setDifficulty(v as "easy" | "hard")}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="easy">Easy (random)</SelectItem><SelectItem value="hard">Hard (unbeatable)</SelectItem></SelectContent></Select></div>}
        <div className="flex items-end"><Button variant="outline" className="w-full" onClick={() => { setBoard(Array(9).fill(null)); setTurn("X"); }}>New round</Button></div>
      </div>
      <div className="flex justify-around rounded-lg border p-3 text-sm">
        <div>X: <strong>{score.X}</strong></div>
        <div>O: <strong>{score.O}</strong></div>
        <div>Draws: <strong>{score.draw}</strong></div>
      </div>
      <div className="mx-auto grid w-64 grid-cols-3 gap-2">
        {board.map((c, i) => (
          <button key={i} onClick={() => play(i)} className={`aspect-square rounded-lg border-2 text-4xl font-bold ${line?.includes(i) ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-background"} ${c || gameOver ? "" : "hover:bg-muted"}`}>
            <span className={c === "X" ? "text-primary" : "text-orange-500"}>{c}</span>
          </button>
        ))}
      </div>
      <div className="text-center text-sm">
        {winner ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">{winner} wins!</span> : draw ? <span className="font-semibold">Draw</span> : <span className="text-muted-foreground">Turn: <strong>{turn}</strong></span>}
      </div>
    </div>
  );
}