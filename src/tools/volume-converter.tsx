import { LinearConverter, UnitDef, formatNum } from "./_units";

// Base: liter
const UNITS: UnitDef[] = [
  { key: "ml", label: "milliliter (ml)", toBase: 0.001 },
  { key: "l", label: "liter (L)", toBase: 1 },
  { key: "m3", label: "cubic meter (m³)", toBase: 1000 },
  { key: "galUS", label: "US gallon", toBase: 3.785411784 },
  { key: "galUK", label: "UK gallon", toBase: 4.54609 },
  { key: "ptUS", label: "US pint", toBase: 0.473176473 },
  { key: "ptUK", label: "UK pint", toBase: 0.56826125 },
  { key: "cup", label: "US cup", toBase: 0.2365882365 },
  { key: "flozUS", label: "US fluid ounce", toBase: 0.0295735295625 },
  { key: "flozUK", label: "UK fluid ounce", toBase: 0.0284130625 },
  { key: "bbl", label: "oil barrel (bbl)", toBase: 158.987294928 },
];

function container(liters: number): string {
  if (liters <= 0) return "empty";
  if (liters < 0.05) return "a teaspoon";
  if (liters < 0.35) return "a coffee cup";
  if (liters < 0.6) return "a standard water bottle (500 ml)";
  if (liters < 1.5) return "a 1-liter carton";
  if (liters < 3) return "a large soda bottle (2 L)";
  if (liters < 12) return "a household bucket (~10 L)";
  if (liters < 60) return "a car fuel tank (~50 L)";
  if (liters < 250) return "an oil barrel (159 L)";
  if (liters < 2000) return "an IBC tote (~1000 L)";
  if (liters < 500000) return `${(liters / 1000).toFixed(1)} m³ — small pool`;
  return `${(liters / 2500000).toFixed(2)} Olympic swimming pools`;
}

export default function VolumeConverter() {
  return (
    <LinearConverter
      units={UNITS}
      defaultFrom="l"
      defaultTo="galUS"
      formula={(v, f, t, r) => (
        <>1 {f.label} = {formatNum(f.toBase / t.toBase)} {t.label} · {formatNum(v)} × {formatNum(f.toBase / t.toBase)} = {formatNum(r)}</>
      )}
      extras={(v, f) => {
        const liters = v * f.toBase;
        return (
          <div className="text-sm text-muted-foreground">
            Roughly: <span className="text-foreground font-medium">{container(liters)}</span>
          </div>
        );
      }}
    />
  );
}