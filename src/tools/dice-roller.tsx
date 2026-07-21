import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Die = 4 | 6 | 8 | 10 | 12 | 20 | 100;
const DICE: Die[] = [4, 6, 8, 10, 12, 20, 100];

function roll(sides: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] % sides) + 1;
}

export default function DiceRoller() {
  const [count, setCount] = useState(2);
  const [sides, setSides] = useState<Die>(6);
  const [mod, setMod] = useState(0);
  const [rolls, setRolls] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState<{ label: string; total: number; rolls: number[] }[]>([]);
  const [sound, setSound] = useState(false);

  const total = rolls.reduce((a, b) => a + b, 0) + mod;

  const doRoll = (n = count, s: Die = sides, m = mod) => {
    setSpinning(true);
    const results = Array.from({ length: Math.max(1, Math.min(50, n)) }, () => roll(s));
    setTimeout(() => {
      setRolls(results);
      setSpinning(false);
      const label = `${n}d${s}${m ? (m > 0 ? `+${m}` : m) : ""}`;
      setHistory((h) => [{ label, total: results.reduce((a, b) => a + b, 0) + m, rolls: results }, ...h].slice(0, 10));
      if (sound) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.type = "square"; o.frequency.value = 220 + Math.random() * 200;
          g.gain.value = 0.05; o.connect(g); g.connect(ctx.destination);
          o.start(); o.stop(ctx.currentTime + 0.08);
        } catch { /* noop */ }
      }
    }, 350);
  };

  const preset = (n: number, s: Die, label: string) => { setCount(n); setSides(s); setMod(0); doRoll(n, s, 0); void label; };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Number of dice</Label><Input type="number" min={1} max={50} value={count} onChange={(e) => setCount(+e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Dice type</Label>
          <select value={sides} onChange={(e) => setSides(+e.target.value as Die)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {DICE.map((d) => <option key={d} value={d}>d{d}</option>)}
          </select>
        </div>
        <div><Label>Modifier</Label><Input type="number" value={mod} onChange={(e) => setMod(+e.target.value)} className="mt-1" /></div>
        <div className="flex items-end"><Button className="w-full" onClick={() => doRoll()}>Roll {count}d{sides}{mod ? (mod > 0 ? `+${mod}` : mod) : ""}</Button></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => preset(1, 20, "D&D d20")}>D&D (1d20)</Button>
        <Button size="sm" variant="outline" onClick={() => preset(2, 6, "Craps 2d6")}>Craps (2d6)</Button>
        <Button size="sm" variant="outline" onClick={() => preset(6, 6, "Shadowrun d6 pool")}>Shadowrun (6d6)</Button>
        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> Sound
        </label>
      </div>

      {rolls.length > 0 && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase text-muted-foreground">Result</div>
            <div className="text-2xl font-bold text-primary">{total}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {rolls.map((v, i) => {
              const crit = sides === 20 && v === 20;
              const fail = sides === 20 && v === 1;
              return (
                <div
                  key={i}
                  className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 text-lg font-bold transition-transform ${
                    spinning ? "animate-spin" : ""
                  } ${crit ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : fail ? "border-red-500 bg-red-500/10 text-red-600" : "border-border bg-background"}`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {v}
                </div>
              );
            })}
            {mod !== 0 && <div className="flex h-14 items-center px-2 text-sm text-muted-foreground">{mod > 0 ? "+" : ""}{mod}</div>}
          </div>
          {sides === 20 && rolls.some((v) => v === 20) && <div className="mt-2 text-sm font-semibold text-emerald-600">Critical success!</div>}
          {sides === 20 && rolls.some((v) => v === 1) && <div className="mt-2 text-sm font-semibold text-red-600">Critical failure!</div>}
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-2 text-sm font-semibold">Roll history</h3>
          <ul className="space-y-1 text-sm">
            {history.map((h, i) => (
              <li key={i} className="flex items-center justify-between border-b border-border/50 py-1 last:border-0">
                <span className="text-muted-foreground">{h.label} → [{h.rolls.join(", ")}]</span>
                <span className="font-semibold">{h.total}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}