import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Difficulty = "easy" | "hard";

function rgb() { return { r: Math.floor(Math.random() * 256), g: Math.floor(Math.random() * 256), b: Math.floor(Math.random() * 256) }; }
function fmt({ r, g, b }: { r: number; g: number; b: number }) { return `rgb(${r}, ${g}, ${b})`; }

export default function ColorGameTool() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [target, setTarget] = useState(rgb());
  const [choices, setChoices] = useState<{ r: number; g: number; b: number }[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [time, setTime] = useState(0);

  const optionCount = difficulty === "easy" ? 3 : 6;

  useEffect(() => {
    const t = rgb();
    const decoys = Array.from({ length: optionCount - 1 }, rgb);
    const arr = [...decoys, t].sort(() => Math.random() - 0.5);
    setTarget(t); setChoices(arr); setPicked(null);
  }, [difficulty, score.total]);

  useEffect(() => { const id = setInterval(() => setTime((v) => v + 1), 1000); return () => clearInterval(id); }, []);

  const pick = (c: { r: number; g: number; b: number }) => {
    if (picked) return;
    const key = fmt(c);
    setPicked(key);
    const correct = c.r === target.r && c.g === target.g && c.b === target.b;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  const percent = score.total ? Math.round((score.correct / score.total) * 100) : 0;
  const targetStr = useMemo(() => fmt(target), [target]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Difficulty</Label><Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="easy">Easy (3)</SelectItem><SelectItem value="hard">Hard (6)</SelectItem></SelectContent></Select></div>
        <div className="flex items-end rounded-lg border px-3 py-2 text-sm">Score: {score.correct}/{score.total} ({percent}%)</div>
        <div className="flex items-end rounded-lg border px-3 py-2 text-sm">⏱ {time}s</div>
        <div className="flex items-end"><Button variant="outline" className="w-full" onClick={() => { setScore({ correct: 0, total: 0 }); setTime(0); }}>Reset</Button></div>
      </div>
      <div className="rounded-lg border p-4 text-center">
        <div className="text-xs text-muted-foreground">Guess this color</div>
        <div className="mt-1 font-mono text-lg font-semibold">{targetStr}</div>
      </div>
      <div className={`grid gap-3 ${difficulty === "easy" ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-6"}`}>
        {choices.map((c) => {
          const key = fmt(c);
          const isCorrect = c.r === target.r && c.g === target.g && c.b === target.b;
          return (
            <button
              key={key}
              onClick={() => pick(c)}
              className={`aspect-square rounded-xl border-4 transition ${picked ? (isCorrect ? "border-emerald-500 scale-105" : key === picked ? "border-destructive opacity-70" : "border-transparent opacity-40") : "border-transparent hover:scale-105"}`}
              style={{ background: key }}
            />
          );
        })}
      </div>
      {picked && <Button className="w-full" onClick={() => setScore((s) => ({ ...s, total: s.total }))}>Next round</Button>}
    </div>
  );
}