import { LinearConverter, UnitDef, formatNum } from "./_units";

// Base: m^2
const UNITS: UnitDef[] = [
  { key: "mm2", label: "mm²", toBase: 1e-6 },
  { key: "cm2", label: "cm²", toBase: 1e-4 },
  { key: "m2", label: "m²", toBase: 1 },
  { key: "km2", label: "km²", toBase: 1e6 },
  { key: "ha", label: "hectare (ha)", toBase: 10000 },
  { key: "ac", label: "acre", toBase: 4046.8564224 },
  { key: "in2", label: "square inch (in²)", toBase: 0.00064516 },
  { key: "ft2", label: "square foot (ft²)", toBase: 0.09290304 },
  { key: "mi2", label: "square mile (mi²)", toBase: 2589988.110336 },
];

export default function AreaConverter() {
  return (
    <LinearConverter
      units={UNITS}
      defaultFrom="m2"
      defaultTo="ft2"
      formula={(v, f, t, r) => (
        <>1 {f.label} = {formatNum(f.toBase / t.toBase)} {t.label} · {formatNum(v)} × {formatNum(f.toBase / t.toBase)} = {formatNum(r)}</>
      )}
      extras={(v, f) => {
        const m2 = v * f.toBase;
        const side = Math.sqrt(m2);
        // scale a preview square: max 160px, based on log
        const maxPx = 160;
        const scale = Math.min(1, maxPx / (side || 1));
        const px = Math.max(4, Math.min(maxPx, side * scale));
        return (
          <div className="flex items-center gap-4">
            <div className="border-2 border-primary bg-primary/20 rounded" style={{ width: `${px}px`, height: `${px}px` }} />
            <div className="text-sm text-muted-foreground">
              Equivalent square: <span className="text-foreground font-mono">{formatNum(side)} m × {formatNum(side)} m</span>
            </div>
          </div>
        );
      }}
    />
  );
}