import { useEffect, useRef } from "react";

export type Series = { name: string; color: string; data: number[]; type?: "line" | "hist" };

export function LineChart({ series, height = 220, thresholds }: { series: Series[]; height?: number; thresholds?: { y: number; color: string }[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    canvas.width = w * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, height);

    const all = series.flatMap((s) => s.data.filter((v) => isFinite(v)));
    if (!all.length) return;
    let min = Math.min(...all);
    let max = Math.max(...all);
    if (thresholds) { thresholds.forEach((t) => { min = Math.min(min, t.y); max = Math.max(max, t.y); }); }
    if (min === max) { min -= 1; max += 1; }
    const pad = (max - min) * 0.05;
    min -= pad; max += pad;
    const maxLen = Math.max(...series.map((s) => s.data.length));
    const xAt = (i: number) => (i / Math.max(1, maxLen - 1)) * (w - 40) + 30;
    const yAt = (v: number) => height - 20 - ((v - min) / (max - min)) * (height - 30);

    ctx.strokeStyle = "rgba(120,120,120,0.15)";
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const y = 10 + (g / 4) * (height - 30);
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(w - 10, y); ctx.stroke();
    }
    ctx.fillStyle = "rgba(120,120,120,0.8)";
    ctx.font = "10px system-ui";
    ctx.fillText(max.toFixed(2), 2, 14);
    ctx.fillText(min.toFixed(2), 2, height - 22);

    thresholds?.forEach((t) => {
      ctx.strokeStyle = t.color; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(30, yAt(t.y)); ctx.lineTo(w - 10, yAt(t.y)); ctx.stroke();
      ctx.setLineDash([]);
    });

    for (const s of series) {
      if (s.type === "hist") {
        const bw = Math.max(1, (w - 40) / s.data.length - 1);
        s.data.forEach((v, i) => {
          if (!isFinite(v)) return;
          const x = xAt(i);
          const y0 = yAt(0);
          const y = yAt(v);
          ctx.fillStyle = v >= 0 ? "rgba(34,197,94,0.7)" : "rgba(239,68,68,0.7)";
          ctx.fillRect(x - bw / 2, Math.min(y, y0), bw, Math.abs(y - y0));
        });
        continue;
      }
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      s.data.forEach((v, i) => {
        if (!isFinite(v)) { started = false; return; }
        const x = xAt(i); const y = yAt(v);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [series, height, thresholds]);

  return (
    <div>
      <canvas ref={ref} style={{ width: "100%", height }} />
      {series.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          {series.map((s) => (
            <span key={s.name} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-3 rounded" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}