import { LinearConverter, UnitDef, formatNum } from "./_units";

// Base: m/s
const UNITS: UnitDef[] = [
  { key: "mps", label: "meters/second (m/s)", toBase: 1 },
  { key: "kmh", label: "kilometers/hour (km/h)", toBase: 1000 / 3600 },
  { key: "mph", label: "miles/hour (mph)", toBase: 0.44704 },
  { key: "knot", label: "knot (kn)", toBase: 0.514444 },
  { key: "mach", label: "Mach (at sea level)", toBase: 340.29 },
  { key: "c", label: "speed of light (c)", toBase: 299792458 },
];

function comparison(mps: number): string {
  if (mps <= 0) return "at rest";
  const kmh = mps * 3.6;
  if (kmh < 5) return "walking pace";
  if (kmh < 25) return "brisk cycling";
  if (kmh < 60) return "city driving";
  if (kmh < 130) return `about ${(kmh / 100).toFixed(1)}× highway speed`;
  if (kmh < 400) return "high-speed rail";
  if (kmh < 1000) return "commercial airliner";
  if (mps < 340) return "subsonic";
  const mach = mps / 340.29;
  if (mach < 5) return `about Mach ${mach.toFixed(2)} (supersonic)`;
  if (mach < 25) return `hypersonic (Mach ${mach.toFixed(1)})`;
  const cFrac = mps / 299792458;
  if (cFrac < 1) return `${(cFrac * 100).toFixed(4)}% the speed of light`;
  return "faster than light";
}

export default function SpeedConverter() {
  return (
    <LinearConverter
      units={UNITS}
      defaultFrom="kmh"
      defaultTo="mph"
      formula={(v, f, t, r) => (
        <>1 {f.label} = {formatNum(f.toBase / t.toBase)} {t.label} · {formatNum(v)} × {formatNum(f.toBase / t.toBase)} = {formatNum(r)}</>
      )}
      extras={(v, f) => {
        const mps = v * f.toBase;
        return (
          <div className="text-sm text-muted-foreground">
            Real-world: <span className="text-foreground font-medium">{comparison(mps)}</span>
          </div>
        );
      }}
    />
  );
}