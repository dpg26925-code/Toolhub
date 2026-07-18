import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

function hexToRgb(hex: string) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorConverterTool() {
  const [hex, setHex] = useState("#6366f1");
  const parsed = useMemo(() => hexToRgb(hex), [hex]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <input type="color" value={parsed ? rgbToHex(parsed.r, parsed.g, parsed.b) : "#000000"} onChange={(e) => setHex(e.target.value)} className="h-12 w-16 cursor-pointer rounded-lg border border-border bg-background" />
        <Input value={hex} onChange={(e) => setHex(e.target.value)} className="font-mono" placeholder="#6366f1" />
      </div>
      {!parsed ? (
        <p className="text-sm text-destructive">Enter a valid hex color (e.g. #6366f1 or #abc).</p>
      ) : (
        <div className="space-y-3">
          {(() => {
            const hsl = rgbToHsl(parsed.r, parsed.g, parsed.b);
            const rows: [string, string][] = [
              ["HEX", rgbToHex(parsed.r, parsed.g, parsed.b).toUpperCase()],
              ["RGB", `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`],
              ["HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
              ["CSS var", `--color: ${rgbToHex(parsed.r, parsed.g, parsed.b)};`],
            ];
            return rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                <span className="font-mono text-sm">{value}</span>
              </div>
            ));
          })()}
          <div className="flex h-20 items-center justify-center rounded-xl text-sm font-medium text-white shadow-inner" style={{ background: rgbToHex(parsed.r, parsed.g, parsed.b) }}>
            Preview
          </div>
        </div>
      )}
    </div>
  );
}