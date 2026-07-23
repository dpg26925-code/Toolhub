import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

type Mode = "text" | "image";
type Pos = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // TL,TC,TR,ML,MC,MR,BL,BC,BR

export default function ImageWatermarkTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [base, setBase] = useState<HTMLImageElement | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("© Your Brand");
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(70);
  const [rotation, setRotation] = useState(0);
  const [pos, setPos] = useState<Pos>(8);
  const [logoScale, setLogoScale] = useState(20);

  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error("Load failed"));
      img.src = URL.createObjectURL(file);
    });

  useEffect(() => {
    const c = canvasRef.current; if (!c || !base) return;
    c.width = base.naturalWidth; c.height = base.naturalHeight;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.drawImage(base, 0, 0);
    ctx.globalAlpha = opacity / 100;

    const col = pos % 3, row = Math.floor(pos / 3);
    const pad = Math.round(Math.min(c.width, c.height) * 0.03);
    const anchorX = col === 0 ? pad : col === 1 ? c.width / 2 : c.width - pad;
    const anchorY = row === 0 ? pad : row === 1 ? c.height / 2 : c.height - pad;

    ctx.save();
    ctx.translate(anchorX, anchorY);
    ctx.rotate((rotation * Math.PI) / 180);

    if (mode === "text") {
      const size = Math.round((fontSize / 100) * Math.min(c.width, c.height) * 0.12) + fontSize;
      ctx.font = `bold ${size}px system-ui, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = col === 0 ? "left" : col === 1 ? "center" : "right";
      ctx.textBaseline = row === 0 ? "top" : row === 1 ? "middle" : "bottom";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = size * 0.08;
      ctx.fillText(text, 0, 0);
    } else if (logo) {
      const w = (logoScale / 100) * c.width;
      const h = (w / logo.naturalWidth) * logo.naturalHeight;
      const dx = col === 0 ? 0 : col === 1 ? -w / 2 : -w;
      const dy = row === 0 ? 0 : row === 1 ? -h / 2 : -h;
      ctx.drawImage(logo, dx, dy, w, h);
    }
    ctx.restore();
  }, [base, logo, mode, text, color, fontSize, opacity, rotation, pos, logoScale]);

  const download = () => {
    const c = canvasRef.current; if (!c) return;
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "watermarked.png"; a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Base image</Label>
          <Input type="file" accept="image/png,image/jpeg,image/webp" className="mt-1" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setBase(await loadImage(f)); }} />
        </div>
        <div>
          <Label>Watermark type</Label>
          <div className="mt-1 flex gap-2">
            <Button size="sm" variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")}>Text</Button>
            <Button size="sm" variant={mode === "image" ? "default" : "outline"} onClick={() => setMode("image")}>Logo</Button>
          </div>
        </div>
      </div>

      {mode === "text" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Text</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 min-h-[60px]" />
          </div>
          <div>
            <Label>Color</Label>
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10 w-24" />
          </div>
          <div>
            <Label>Font size: {fontSize}</Label>
            <Slider className="mt-2" value={[fontSize]} min={12} max={200} step={1} onValueChange={(v) => setFontSize(v[0])} />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Logo image</Label>
            <Input type="file" accept="image/*" className="mt-1" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setLogo(await loadImage(f)); }} />
          </div>
          <div>
            <Label>Logo scale: {logoScale}% of width</Label>
            <Slider className="mt-2" value={[logoScale]} min={5} max={80} step={1} onValueChange={(v) => setLogoScale(v[0])} />
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Opacity: {opacity}%</Label>
          <Slider className="mt-2" value={[opacity]} min={5} max={100} step={1} onValueChange={(v) => setOpacity(v[0])} />
        </div>
        <div>
          <Label>Rotation: {rotation}°</Label>
          <Slider className="mt-2" value={[rotation]} min={-90} max={90} step={1} onValueChange={(v) => setRotation(v[0])} />
        </div>
      </div>

      <div>
        <Label>Position</Label>
        <div className="mt-1 grid w-fit grid-cols-3 gap-1">
          {(Array.from({ length: 9 }) as unknown[]).map((_, i) => (
            <button key={i} onClick={() => setPos(i as Pos)} className={`h-9 w-9 rounded border text-xs ${pos === i ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>{i + 1}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={download} disabled={!base}>Download watermarked PNG</Button>
      </div>
      <div className="overflow-hidden rounded-xl border bg-muted/40 p-2">
        <canvas ref={canvasRef} className="mx-auto block max-h-[520px] w-auto max-w-full" />
        {!base && <p className="p-8 text-center text-sm text-muted-foreground">Upload a base image to preview.</p>}
      </div>
    </div>
  );
}