import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Difficulty = "easy" | "medium" | "hard";
const REMOVE: Record<Difficulty, number> = { easy: 36, medium: 46, hard: 54 };

function shuffled<T>(a: T[]): T[] { const c = [...a]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }

function isValid(g: number[][], r: number, c: number, n: number) {
  for (let i = 0; i < 9; i++) if (g[r][i] === n || g[i][c] === n) return false;
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (g[br + i][bc + j] === n) return false;
  return true;
}
function solve(g: number[][]): boolean {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    if (g[r][c] === 0) {
      for (const n of shuffled([1,2,3,4,5,6,7,8,9])) {
        if (isValid(g, r, c, n)) { g[r][c] = n; if (solve(g)) return true; g[r][c] = 0; }
      }
      return false;
    }
  }
  return true;
}
function makePuzzle(diff: Difficulty) {
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(solution);
  const puzzle = solution.map((r) => [...r]);
  const cells = shuffled(Array.from({ length: 81 }, (_, i) => i)).slice(0, REMOVE[diff]);
  for (const c of cells) puzzle[Math.floor(c / 9)][c % 9] = 0;
  return { puzzle, solution };
}

export default function SudokuGeneratorTool() {
  const [diff, setDiff] = useState<Difficulty>("easy");
  const [{ puzzle, solution }, setBoards] = useState(() => makePuzzle("easy"));
  const [grid, setGrid] = useState<number[][]>(puzzle.map((r) => [...r]));
  const [time, setTime] = useState(0);

  const fixed = useMemo(() => puzzle.map((r) => r.map((v) => v !== 0)), [puzzle]);

  useEffect(() => { const id = setInterval(() => setTime((t) => t + 1), 1000); return () => clearInterval(id); }, [puzzle]);

  const reset = (d = diff) => { const b = makePuzzle(d); setBoards(b); setGrid(b.puzzle.map((r) => [...r])); setTime(0); };

  const setCell = (r: number, c: number, v: string) => {
    if (fixed[r][c]) return;
    const n = v === "" ? 0 : Math.max(0, Math.min(9, +v));
    setGrid((g) => g.map((row, ri) => row.map((cv, ci) => ri === r && ci === c ? n : cv)));
  };

  const isCellCorrect = (r: number, c: number) => grid[r][c] === 0 || grid[r][c] === solution[r][c];
  const complete = grid.flat().every((v, i) => v === solution[Math.floor(i / 9)][i % 9]);

  const hint = () => {
    const empties: [number, number][] = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (grid[r][c] !== solution[r][c]) empties.push([r, c]);
    if (!empties.length) return;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    setGrid((g) => g.map((row, ri) => row.map((cv, ci) => ri === r && ci === c ? solution[r][c] : cv)));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Difficulty</Label><Select value={diff} onValueChange={(v) => { setDiff(v as Difficulty); reset(v as Difficulty); }}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
        <div className="flex items-end rounded-lg border px-3 py-2 text-sm">⏱ {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}</div>
        <div className="flex items-end gap-2"><Button variant="outline" className="w-full" onClick={hint}>Hint</Button><Button variant="outline" className="w-full" onClick={() => setGrid(solution.map((r) => [...r]))}>Solve</Button></div>
        <div className="flex items-end"><Button className="w-full" onClick={() => reset()}>New puzzle</Button></div>
      </div>
      <div className="mx-auto grid w-fit grid-cols-9 border-2 border-foreground bg-background">
        {grid.map((row, r) => row.map((v, c) => (
          <input
            key={`${r}-${c}`}
            value={v || ""}
            onChange={(e) => setCell(r, c, e.target.value.replace(/[^1-9]/g, "").slice(-1))}
            className={`h-10 w-10 text-center text-lg font-semibold outline-none border-border ${fixed[r][c] ? "bg-muted text-foreground" : v && !isCellCorrect(r, c) ? "bg-destructive/20 text-destructive" : ""} ${r % 3 === 0 ? "border-t-2 border-t-foreground" : "border-t"} ${c % 3 === 0 ? "border-l-2 border-l-foreground" : "border-l"} ${r === 8 ? "border-b-2 border-b-foreground" : ""} ${c === 8 ? "border-r-2 border-r-foreground" : ""}`}
            readOnly={fixed[r][c]}
          />
        )))}
      </div>
      {complete && <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-center text-sm font-semibold">🎉 Solved in {time}s</div>}
    </div>
  );
}