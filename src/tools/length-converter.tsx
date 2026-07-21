import { LinearConverter, UnitDef, formatNum } from "./_units";

// Base: meter
const UNITS: UnitDef[] = [
  { key: "mm", label: "millimeter (mm)", toBase: 0.001 },
  { key: "cm", label: "centimeter (cm)", toBase: 0.01 },
  { key: "m", label: "meter (m)", toBase: 1 },
  { key: "km", label: "kilometer (km)", toBase: 1000 },
  { key: "in", label: "inch (in)", toBase: 0.0254 },
  { key: "ft", label: "foot (ft)", toBase: 0.3048 },
  { key: "yd", label: "yard (yd)", toBase: 0.9144 },
  { key: "mi", label: "mile (mi)", toBase: 1609.344 },
  { key: "nmi", label: "nautical mile (nmi)", toBase: 1852 },
];

export default function LengthConverter() {
  return (
    <LinearConverter
      units={UNITS}
      defaultFrom="m"
      defaultTo="ft"
      formula={(v, f, t, r) => (
        <>1 {f.label} = {formatNum(f.toBase / t.toBase)} {t.label} · {formatNum(v)} × {formatNum(f.toBase / t.toBase)} = {formatNum(r)}</>
      )}
      extras={(_v, _f, _t, r) => {
        // comparison bar in meters
        const meters = r * (UNITS.find(u => u.key === _t.key)!.toBase);
        const refs = [
          { name: "Human", m: 1.7 },
          { name: "Bus", m: 12 },
          { name: "Football pitch", m: 105 },
          { name: "Eiffel Tower", m: 330 },
          { name: "1 km", m: 1000 },
          { name: "Marathon", m: 42195 },
        ];
        const max = Math.max(meters, ...refs.map(r => r.m));
        const rows = [{ name: "Your value", m: meters }, ...refs];
        return (
          <div className="space-y-1.5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Compared</div>
            {rows.map((row) => (
              <div key={row.name} className="flex items-center gap-2 text-xs">
                <div className="w-32 shrink-0 text-muted-foreground">{row.name}</div>
                <div className="h-2 flex-1 rounded bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.max(1, (row.m / max) * 100)}%` }} />
                </div>
                <div className="w-24 text-right font-mono">{formatNum(row.m)} m</div>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}