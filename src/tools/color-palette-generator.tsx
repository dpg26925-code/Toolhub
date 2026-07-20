import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function hexToHsl(hex: string) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i); if (!m) return null;
  const n = parseInt(m[1], 16); const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}
function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100; const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return "#" + to(f(0)) + to(f(8)) + to(f(4));
}

type Mode = "monochrome" | "analogous" | "complementary" | "triadic" | "tetradic" | "shades";

function build(hex: string, mode: Mode): string[] {
  const hsl = hexToHsl(hex); if (!hsl) return [hex];
  const { h, s, l } = hsl;
  switch (mode) {
    case "monochrome": return [95, 80, 65, 50, l, 35, 20].map((L) => hslToHex(h, s, L));
    case "analogous": return [-60, -30, 0, 30, 60].map((d) => hslToHex((h + d + 360) % 360, s, l));
    case "complementary": return [hslToHex(h, s, l), hslToHex(h, s * 0.6, Math.min(90, l + 20)), hslToHex(h, s, Math.max(20, l - 20)), hslToHex((h + 180) % 360, s, l), hslToHex((h + 180) % 360, s * 0.6, Math.min(90, l + 20))];
    case "triadic": return [0, 120, 240].map((d) => hslToHex((h + d) % 360, s, l));
    case "tetradic": return [0, 90, 180, 270].map((d) => hslToHex((h + d) % 360, s, l));
    case "shades": return [10, 25, 40, 55, 70, 85].map((L) => hslToHex(h, s, L));
  }
}

export default function ColorPaletteGeneratorTool() {
  const [base, setBase] = useState("#7c3aed");
  const [mode, setMode] = useState<Mode>("analogous");
  const palette = useMemo(() => build(base, mode), [base, mode]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Base color</Label><div className="mt-1 flex gap-2"><Input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="h-10 w-14"/><Input value={base} onChange={(e) => setBase(e.target.value)}/></div></div>
        <div><Label>Harmony</Label>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option value="monochrome">Monochrome</option><option value="analogous">Analogous</option><option value="complementary">Complementary</option><option value="triadic">Triadic</option><option value="tetradic">Tetradic</option><option value="shades">Shades</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {palette.map((c) => (
          <button key={c} onClick={() => { navigator.clipboard.writeText(c); toast.success(`Copied ${c}`); }} className="group overflow-hidden rounded-xl border text-left">
            <div className="h-24 w-full" style={{ background: c }}/>
            <div className="p-2 font-mono text-xs uppercase">{c}</div>
          </button>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(palette.join(", ")); toast.success("Palette copied"); }}>Copy all</Button>
    </div>
  );
}