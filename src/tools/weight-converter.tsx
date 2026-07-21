import { LinearConverter, UnitDef, formatNum } from "./_units";

// Base: kilogram
const UNITS: UnitDef[] = [
  { key: "mg", label: "milligram (mg)", toBase: 0.000001 },
  { key: "g", label: "gram (g)", toBase: 0.001 },
  { key: "kg", label: "kilogram (kg)", toBase: 1 },
  { key: "t", label: "metric ton (t)", toBase: 1000 },
  { key: "oz", label: "ounce (oz)", toBase: 0.028349523125 },
  { key: "lb", label: "pound (lb)", toBase: 0.45359237 },
  { key: "st", label: "stone (st)", toBase: 6.35029318 },
  { key: "ct", label: "carat (ct)", toBase: 0.0002 },
];

export default function WeightConverter() {
  return (
    <LinearConverter
      units={UNITS}
      defaultFrom="kg"
      defaultTo="lb"
      formula={(v, f, t, r) => (
        <>1 {f.label} = {formatNum(f.toBase / t.toBase)} {t.label} · {formatNum(v)} × {formatNum(f.toBase / t.toBase)} = {formatNum(r)}</>
      )}
    />
  );
}