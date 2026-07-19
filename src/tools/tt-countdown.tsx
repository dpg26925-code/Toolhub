import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TtCountdown() {
  const [start, setStart] = useState(3);
  const [value, setValue] = useState<number | "GO">(3);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const beep = (freq: number) => {
    if (!sound) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const ctx = ctxRef.current!;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = freq; o.type = "sine";
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.26);
    } catch { /* ignore */ }
  };
  useEffect(() => {
    if (!running) return;
    if (typeof value === "number") {
      if (value <= 0) { setValue("GO"); beep(1200); setTimeout(() => setRunning(false), 700); return; }
      beep(700);
      const t = setTimeout(() => setValue((v) => (typeof v === "number" ? v - 1 : v)), 1000);
      return () => clearTimeout(t);
    }
  }, [running, value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Start from</Label><Input type="number" min={1} max={60} value={start} onChange={(e) => setStart(+e.target.value || 3)} className="mt-1" /></div>
        <div className="flex items-end gap-2">
          <Button className="flex-1" onClick={() => { setValue(start); setRunning(true); }}>Start</Button>
          <Button variant="outline" onClick={() => { setRunning(false); setValue(start); }}>Reset</Button>
        </div>
        <label className="flex items-end gap-2 text-sm"><input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> Beep sound</label>
      </div>
      <div className="flex h-[320px] items-center justify-center rounded-xl bg-black">
        <div className="text-[160px] font-black text-white tabular-nums">{value}</div>
      </div>
    </div>
  );
}