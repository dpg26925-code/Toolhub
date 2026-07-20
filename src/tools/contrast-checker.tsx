import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function hexToRgb(hex: string) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function lum({ r, g, b }: { r: number; g: number; b: number }) {
  const c = [r, g, b].map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export default function ContrastCheckerTool() {
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");

  const ratio = useMemo(() => {
    const a = hexToRgb(fg), b = hexToRgb(bg); if (!a || !b) return 0;
    const la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }, [fg, bg]);

  const check = (min: number) => ratio >= min;
  const Badge = ({ ok, label }: { ok: boolean; label: string }) => (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${ok ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/15 text-destructive"}`}>{ok ? "Pass" : "Fail"} · {label}</span>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Foreground</Label><div className="mt-1 flex gap-2"><Input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-14"/><Input value={fg} onChange={(e) => setFg(e.target.value)}/></div></div>
        <div><Label>Background</Label><div className="mt-1 flex gap-2"><Input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-14"/><Input value={bg} onChange={(e) => setBg(e.target.value)}/></div></div>
      </div>
      <div className="rounded-xl border p-6" style={{ background: bg, color: fg }}>
        <div className="text-2xl font-bold">The quick brown fox jumps over the lazy dog</div>
        <div className="mt-2 text-sm">Aa Bb Cc — 14px body text sample for contrast preview.</div>
      </div>
      <div className="rounded-xl border p-4">
        <div className="text-3xl font-bold">{ratio.toFixed(2)}<span className="text-base font-normal text-muted-foreground">:1</span></div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge ok={check(4.5)} label="AA · Normal"/>
          <Badge ok={check(3)} label="AA · Large"/>
          <Badge ok={check(7)} label="AAA · Normal"/>
          <Badge ok={check(4.5)} label="AAA · Large"/>
          <Badge ok={check(3)} label="UI components"/>
        </div>
      </div>
    </div>
  );
}