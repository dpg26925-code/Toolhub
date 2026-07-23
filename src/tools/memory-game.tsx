import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Size = "4x4" | "6x6" | "8x8";
type Theme = "emoji" | "numbers" | "colors";
const SIZES: Record<Size, number> = { "4x4": 4, "6x6": 6, "8x8": 8 };
const EMOJI = "🍎🍌🍇🍓🍉🍊🥝🍒🥥🍍🍑🥭🍋🥕🌽🍆🥔🥑🍅🌶️🍄🥦🧄🧅🥞🍞🥖🧀🍔🍟🍕🌭".split(/(?=[\p{Emoji}])/u);
const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#a855f7","#f43f5e","#0ea5e9","#14b8a6","#84cc16","#facc15","#fb923c","#a3e635","#f472b6","#c084fc","#60a5fa","#34d399","#fbbf24","#fca5a5","#93c5fd","#c7d2fe","#fdba74","#d9f99d","#bef264","#4ade80","#38bdf8","#818cf8","#a78bfa","#e879f9"];

type Card = { id: number; value: string; matched: boolean; flipped: boolean };

function buildDeck(size: number, theme: Theme): Card[] {
  const pairs = (size * size) / 2;
  const symbols: string[] = [];
  for (let i = 0; i < pairs; i++) {
    symbols.push(theme === "numbers" ? String(i + 1) : theme === "colors" ? COLORS[i % COLORS.length] : EMOJI[i % EMOJI.length]);
  }
  const deck = [...symbols, ...symbols].map((v, i) => ({ id: i, value: v, matched: false, flipped: false }));
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck.map((c, i) => ({ ...c, id: i }));
}

export default function MemoryGameTool() {
  const [size, setSize] = useState<Size>("4x4");
  const [theme, setTheme] = useState<Theme>("emoji");
  const [deck, setDeck] = useState<Card[]>(() => buildDeck(4, "emoji"));
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState<{ moves: number; time: number } | null>(null);

  const sizeN = SIZES[size];
  const won = deck.length > 0 && deck.every((c) => c.matched);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(`memory-best-${size}-${theme}`);
    if (raw) { try { setBest(JSON.parse(raw)); } catch { /* ignore */ } } else setBest(null);
  }, [size, theme]);

  useEffect(() => {
    if (!running || won) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running, won]);

  useEffect(() => {
    if (!won) return;
    setRunning(false);
    const rec = { moves, time };
    if (!best || moves < best.moves || (moves === best.moves && time < best.time)) {
      setBest(rec);
      if (typeof window !== "undefined") localStorage.setItem(`memory-best-${size}-${theme}`, JSON.stringify(rec));
    }
  }, [won]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = (s = size, t = theme) => {
    setDeck(buildDeck(SIZES[s], t)); setSelected([]); setMoves(0); setTime(0); setRunning(false);
  };

  const flip = (id: number) => {
    if (!running) setRunning(true);
    if (selected.length === 2) return;
    const card = deck.find((c) => c.id === id);
    if (!card || card.matched || card.flipped) return;
    const next = deck.map((c) => c.id === id ? { ...c, flipped: true } : c);
    const nextSelected = [...selected, id];
    setDeck(next); setSelected(nextSelected);
    if (nextSelected.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nextSelected.map((i) => next.find((c) => c.id === i)!);
      if (a.value === b.value) {
        setTimeout(() => { setDeck((d) => d.map((c) => c.id === a.id || c.id === b.id ? { ...c, matched: true } : c)); setSelected([]); }, 400);
      } else {
        setTimeout(() => { setDeck((d) => d.map((c) => c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c)); setSelected([]); }, 900);
      }
    }
  };

  const cellStyle: React.CSSProperties = useMemo(() => ({ gridTemplateColumns: `repeat(${sizeN}, minmax(0, 1fr))` }), [sizeN]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label>Grid</Label>
          <Select value={size} onValueChange={(v) => { setSize(v as Size); reset(v as Size, theme); }}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="4x4">4×4</SelectItem><SelectItem value="6x6">6×6</SelectItem><SelectItem value="8x8">8×8</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <Label>Theme</Label>
          <Select value={theme} onValueChange={(v) => { setTheme(v as Theme); reset(size, v as Theme); }}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="emoji">Emoji</SelectItem><SelectItem value="numbers">Numbers</SelectItem><SelectItem value="colors">Colors</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex items-end justify-between rounded-lg border px-3 py-2 text-sm">
          <span>⏱ {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}</span>
          <span>♟ {moves}</span>
        </div>
        <div className="flex items-end"><Button variant="outline" className="w-full" onClick={() => reset()}>New game</Button></div>
      </div>
      {best && <p className="text-xs text-muted-foreground">Best: {best.moves} moves · {best.time}s</p>}
      <div className="grid gap-2" style={cellStyle}>
        {deck.map((c) => (
          <button
            key={c.id}
            onClick={() => flip(c.id)}
            className={`aspect-square rounded-lg border text-2xl font-bold transition ${c.flipped || c.matched ? "bg-background" : "bg-muted hover:bg-muted/70"} ${c.matched ? "opacity-50" : ""}`}
            style={theme === "colors" && (c.flipped || c.matched) ? { background: c.value } : undefined}
          >
            {theme !== "colors" && (c.flipped || c.matched) ? c.value : ""}
          </button>
        ))}
      </div>
      {won && <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-center text-sm font-semibold">🎉 You won in {moves} moves · {time}s</div>}
    </div>
  );
}