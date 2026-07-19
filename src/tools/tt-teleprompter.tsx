import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TtTeleprompter() {
  const [text, setText] = useState("Paste your script here.\nEach line will scroll smoothly.\nRecord your video and read along.");
  const [speed, setSpeed] = useState(40);
  const [fontSize, setFontSize] = useState(36);
  const [playing, setPlaying] = useState(false);
  const [mirror, setMirror] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!playing || !ref.current) return;
    let raf = 0; let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000; last = t;
      if (ref.current) ref.current.scrollTop += speed * dt;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);
  return (
    <div className="space-y-4">
      <div><Label>Script</Label><Textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 min-h-[120px]" /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Speed (px/s)</Label><Input type="number" value={speed} onChange={(e) => setSpeed(+e.target.value || 40)} min={5} max={400} className="mt-1" /></div>
        <div><Label>Font size</Label><Input type="number" value={fontSize} onChange={(e) => setFontSize(+e.target.value || 24)} min={12} max={96} className="mt-1" /></div>
        <div className="flex items-end gap-2">
          <Button onClick={() => setPlaying((p) => !p)} className="flex-1">{playing ? "Pause" : "Play"}</Button>
          <Button variant="outline" onClick={() => { setPlaying(false); if (ref.current) ref.current.scrollTop = 0; }}>Reset</Button>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} /> Mirror text (for prompter rigs)</label>
      <div ref={ref} className="h-[400px] overflow-hidden rounded-xl bg-black p-8 leading-relaxed text-white" style={{ fontSize, transform: mirror ? "scaleX(-1)" : undefined }}>
        <div style={{ whiteSpace: "pre-wrap" }}>{text}{"\n\n\n\n\n\n\n"}</div>
      </div>
    </div>
  );
}