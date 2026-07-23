import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TimerCountdown() {
  const [target, setTarget] = useState(1500); // seconds
  const [remaining, setRemaining] = useState(1500);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      ref.current = setInterval(() => setRemaining(r => {
        if (r <= 1) {
          try { new AudioContext().createOscillator(); } catch {}
          setRunning(false);
          return 0;
        }
        return r - 1;
      }), 1000);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const set = (s: number) => { setTarget(s); setRemaining(s); setRunning(false); };
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pct = target > 0 ? (remaining / target) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => set(1500)}>Pomodoro (25m)</Button>
        <Button variant="outline" onClick={() => set(180)}>Tea (3m)</Button>
        <Button variant="outline" onClick={() => set(1800)}>Meeting (30m)</Button>
        <Button variant="outline" onClick={() => set(300)}>Break (5m)</Button>
      </div>
      <div className="rounded-lg border p-8 text-center">
        <div className="font-mono text-7xl font-bold tabular-nums">{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</div>
        <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
          <div className="h-3 bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</Button>
        <Button variant="outline" onClick={() => { setRunning(false); setRemaining(target); }}>Reset</Button>
        <Input type="number" min={1} className="w-32" placeholder="Seconds" onChange={e => { const v = parseInt(e.target.value); if (v > 0) set(v); }} />
      </div>
    </div>
  );
}
