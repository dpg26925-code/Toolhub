import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Stat, loadJSON, saveJSON } from "./_edu";

type Phase = "focus" | "short" | "long";

const PRESETS = [
  { name: "Classic 25/5", focus: 25, shortBreak: 5, longBreak: 15, cycles: 4 },
  { name: "Extended 50/10", focus: 50, shortBreak: 10, longBreak: 30, cycles: 3 },
  { name: "Deep Work 90/20", focus: 90, shortBreak: 20, longBreak: 30, cycles: 2 },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function beep() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    o.start();
    o.stop(ctx.currentTime + 1);
  } catch {
    // audio unavailable — ignore
  }
}

export default function StudyTimer() {
  const [focus, setFocus] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [cycles, setCycles] = useState(4);

  const [phase, setPhase] = useState<Phase>("focus");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0); // focus sessions in this run
  const [focusSecondsToday, setFocusSecondsToday] = useState(0);
  const tick = useRef<number | null>(null);

  // Load today's focus total on mount (client only)
  useEffect(() => {
    const key = `nexatools.studyTimer.${today()}`;
    setFocusSecondsToday(loadJSON<number>(key, 0));
  }, []);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setRemaining((s) => {
        if (s > 1) return s - 1;
        return 0;
      });
      if (phase === "focus") {
        setFocusSecondsToday((v) => {
          const next = v + 1;
          saveJSON(`nexatools.studyTimer.${today()}`, next);
          return next;
        });
      }
    }, 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [running, phase]);

  useEffect(() => {
    if (remaining !== 0 || !running) return;
    beep();
    setRunning(false);
    if (phase === "focus") {
      const done = completed + 1;
      setCompleted(done);
      const isLong = done > 0 && done % cycles === 0;
      const next: Phase = isLong ? "long" : "short";
      setPhase(next);
      setRemaining((isLong ? longBreak : shortBreak) * 60);
    } else {
      setPhase("focus");
      setRemaining(focus * 60);
    }
  }, [remaining, running, phase, completed, cycles, focus, shortBreak, longBreak]);

  const applyPreset = (p: typeof PRESETS[number]) => {
    setFocus(p.focus);
    setShortBreak(p.shortBreak);
    setLongBreak(p.longBreak);
    setCycles(p.cycles);
    setPhase("focus");
    setRemaining(p.focus * 60);
    setRunning(false);
    setCompleted(0);
  };

  const reset = () => {
    setRunning(false);
    setPhase("focus");
    setRemaining(focus * 60);
    setCompleted(0);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const total = (phase === "focus" ? focus : phase === "short" ? shortBreak : longBreak) * 60;
  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;

  const phaseLabel = phase === "focus" ? "Focus" : phase === "short" ? "Short break" : "Long break";
  const phaseColor = phase === "focus" ? "bg-primary" : phase === "short" ? "bg-emerald-500" : "bg-sky-500";
  const nextLabel = (() => {
    if (phase !== "focus") return "Focus";
    const isLong = (completed + 1) % cycles === 0;
    return isLong ? "Long break" : "Short break";
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.name} size="sm" variant="outline" onClick={() => applyPreset(p)}>
            {p.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Focus (min)</Label><Input type="number" min={1} value={focus} onChange={(e) => { setFocus(+e.target.value); if (!running && phase === "focus") setRemaining(+e.target.value * 60); }} className="mt-1" /></div>
        <div><Label>Short break (min)</Label><Input type="number" min={1} value={shortBreak} onChange={(e) => setShortBreak(+e.target.value)} className="mt-1" /></div>
        <div><Label>Long break (min)</Label><Input type="number" min={1} value={longBreak} onChange={(e) => setLongBreak(+e.target.value)} className="mt-1" /></div>
        <div><Label>Sessions before long break</Label><Input type="number" min={1} value={cycles} onChange={(e) => setCycles(+e.target.value)} className="mt-1" /></div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/40 p-6 text-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{phaseLabel} — next: {nextLabel}</div>
        <div className="my-3 font-mono text-6xl font-bold text-foreground tabular-nums">
          {mm}:{ss}
        </div>
        <div className="mx-auto h-2 max-w-md overflow-hidden rounded-full bg-secondary">
          <div className={`h-full ${phaseColor}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {!running ? (
            <Button size="lg" onClick={() => setRunning(true)}>Start</Button>
          ) : (
            <Button size="lg" variant="secondary" onClick={() => setRunning(false)}>Pause</Button>
          )}
          <Button size="lg" variant="outline" onClick={reset}>Reset</Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-3">
        <Stat label="Completed this run" value={`${completed} focus session${completed === 1 ? "" : "s"}`} />
        <Stat label="Focus time today" value={`${Math.floor(focusSecondsToday / 60)} min`} hint="Tracked in your browser only" />
        <Stat label="Current cycle" value={`${(completed % cycles) + 1} / ${cycles}`} />
      </div>
    </div>
  );
}