import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [text, setText] = useState("TIKTOK MADE ME BUY IT");
  const [bg, setBg] = useState("#111827");
  const [fg, setFg] = useState("#ffffff");
  const [emoji, setEmoji] = useState("🔥");
  const [size, setSize] = useState(120);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const W = 540, H = 960;
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    // background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, bg); grad.addColorStop(1, "#000");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    // vignette
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(0, H - 260, W, 260);
    // emoji
    ctx.font = "220px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(emoji, W / 2, H / 2 - 100);
    // text
    ctx.fillStyle = fg;
    ctx.font = `900 ${size}px Impact, "Arial Black", sans-serif`;
    ctx.lineWidth = 8; ctx.strokeStyle = "#000";
    const words = text.toUpperCase().split(/\s+/);
    const lines: string[] = []; let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (ctx.measureText(test).width > W - 60 && cur) { lines.push(cur); cur = w; } else cur = test;
    }
    if (cur) lines.push(cur);
    const startY = H - 160 - (lines.length - 1) * (size + 10);
    lines.forEach((ln, i) => { ctx.strokeText(ln, W / 2, startY + i * (size + 10)); ctx.fillText(ln, W / 2, startY + i * (size + 10)); });
  }, [text, bg, fg, emoji, size]);

  const download = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = "tiktok-thumbnail.png"; a.click();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border bg-muted/20 p-4">
        <canvas ref={canvasRef} className="mx-auto block w-full max-w-[300px] rounded-md shadow-lg" />
      </div>
      <div className="space-y-3">
        <div><Label>Overlay text</Label><Input value={text} onChange={(e) => setText(e.target.value)} className="mt-1"/></div>
        <div><Label>Emoji</Label><Input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="mt-1"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Background</Label><Input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-1 h-10"/></div>
          <div><Label>Text color</Label><Input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="mt-1 h-10"/></div>
        </div>
        <div><Label>Font size ({size}px)</Label><input type="range" min={60} max={200} value={size} onChange={(e) => setSize(+e.target.value)} className="mt-1 w-full"/></div>
        <Button onClick={download} className="w-full">Download 9:16 PNG</Button>
      </div>
    </div>
  );
}