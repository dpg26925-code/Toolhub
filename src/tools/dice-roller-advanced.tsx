import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Preset = "custom" | "dnd" | "craps" | "shadowrun";
const PRESETS: Record<Preset, string> = { custom: "1d20", dnd: "4d6", craps: "2d6", shadowrun: "6d6" };

function parse(expr: string) {
  const m = expr.trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!m) return null;
  return { count: Math.min(100, +m[1]), sides: Math.min(1000, +m[2]), mod: m[3] ? +m[3] : 0 };
}
function secureInt(max: number) { const b = new Uint32Array(1); crypto.getRandomValues(b); return (b[0] % max) + 1; }

export default function DiceRollerAdvancedTool() {
  const [preset, setPreset] = useState<Preset>("custom");
  const [expr, setExpr] = useState("1d20");
  const [sound, setSound] = useState(true);
  const [rolls, setRolls] = useState<number[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [history, setHistory] = useState<{ expr: string; total: number; rolls: number[] }[]>([]);
  const ctxRef = useRef<AudioContext | null>(null);

  const parsed = useMemo(() => parse(expr), [expr]);

  const beep = () => {
    if (!sound) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ctxRef.current) ctxRef.current = new AC();
      const ctx = ctxRef.current;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "triangle"; o.frequency.setValueAtTime(440 + Math.random() * 200, ctx.currentTime);
      g.gain.setValueAtTime(0.001, ctx.currentTime); g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.2);
    } catch { /* ignore */ }
  };

  const roll = () => {
    if (!parsed) return;
    const r = Array.from({ length: parsed.count }, () => secureInt(parsed.sides));
    const t = r.reduce((s, v) => s + v, 0) + parsed.mod;
    setRolls(r); setTotal(t);
    setHistory((h) => [{ expr, total: t, rolls: r }, ...h].slice(0, 20));
    beep();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label>Preset</Label>
          <Select value={preset} onValueChange={(v) => { setPreset(v as Preset); setExpr(PRESETS[v as Preset]); }}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="custom">Custom</SelectItem><SelectItem value="dnd">D&D (4d6)</SelectItem><SelectItem value="craps">Craps (2d6)</SelectItem><SelectItem value="shadowrun">Shadowrun (6d6)</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Expression</Label><Input value={expr} onChange={(e) => { setExpr(e.target.value); setPreset("custom"); }} placeholder="1d20+3" className="mt-1 font-mono"/></div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> Sound</label></div>
        <div className="flex items-end"><Button className="w-full" onClick={roll} disabled={!parsed}>Roll</Button></div>
      </div>
      {!parsed && <p className="text-xs text-destructive">Invalid expression. Use format NdS+M (e.g. 3d6+2).</p>}
      {rolls.length > 0 && (
        <div className="rounded-lg border p-4 text-center">
          <div className="text-xs text-muted-foreground">{expr}</div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {rolls.map((r, i) => (
              <span key={i} className="inline-flex h-12 w-12 items-center justify-center rounded-lg border-2 border-primary bg-primary/10 text-xl font-bold animate-in zoom-in duration-300">{r}</span>
            ))}
          </div>
          <div className="mt-3 text-3xl font-bold">Total: {total}</div>
        </div>
      )}
      {history.length > 0 && (
        <div className="rounded-lg border p-3 text-sm">
          <div className="mb-1 text-xs font-semibold text-muted-foreground">Recent rolls</div>
          <ul className="space-y-1">
            {history.map((h, i) => (
              <li key={i} className="flex justify-between font-mono text-xs"><span>{h.expr}</span><span>[{h.rolls.join(", ")}] = <strong>{h.total}</strong></span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}