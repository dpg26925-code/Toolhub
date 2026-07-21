import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Stat, round } from "./_edu";

type Mode = "of" | "isWhatOf" | "change" | "add";

const MODES: { key: Mode; label: string }[] = [
  { key: "of", label: "X% of Y" },
  { key: "isWhatOf", label: "X is what % of Y" },
  { key: "change", label: "% change from X to Y" },
  { key: "add", label: "Y + / − X%" },
];

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("of");
  const [x, setX] = useState(20);
  const [y, setY] = useState(150);
  const [op, setOp] = useState<"add" | "sub">("add");

  let result: number | null = null;
  let formula = "";
  if (Number.isFinite(x) && Number.isFinite(y)) {
    if (mode === "of") {
      result = (x / 100) * y;
      formula = `${x}% × ${y} = ${x} ÷ 100 × ${y}`;
    } else if (mode === "isWhatOf") {
      result = y !== 0 ? (x / y) * 100 : null;
      formula = y !== 0 ? `${x} ÷ ${y} × 100` : "Y cannot be 0";
    } else if (mode === "change") {
      result = x !== 0 ? ((y - x) / Math.abs(x)) * 100 : null;
      formula = x !== 0 ? `(${y} − ${x}) ÷ |${x}| × 100` : "Start value cannot be 0";
    } else if (mode === "add") {
      const delta = (x / 100) * y;
      result = op === "add" ? y + delta : y - delta;
      formula = `${y} ${op === "add" ? "+" : "−"} (${x}% × ${y}) = ${y} ${op === "add" ? "+" : "−"} ${round(delta, 4)}`;
    }
  }

  // Bar visualisation — clamp result to a reasonable range for the chart
  const chart = (() => {
    if (result === null) return null;
    if (mode === "of") {
      const pct = y !== 0 ? (result / y) * 100 : 0;
      return { parts: [{ label: `${round(x, 2)}% (${round(result, 2)})`, pct: Math.max(0, Math.min(100, pct)), color: "bg-primary" }, { label: `Remaining (${round(y - result, 2)})`, pct: Math.max(0, Math.min(100, 100 - pct)), color: "bg-secondary" }] };
    }
    if (mode === "isWhatOf") {
      const pct = Math.max(0, Math.min(100, result));
      return { parts: [{ label: `${round(result, 2)}%`, pct, color: "bg-primary" }, { label: `Remaining`, pct: 100 - pct, color: "bg-secondary" }] };
    }
    return null;
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <Button key={m.key} size="sm" variant={mode === m.key ? "default" : "outline"} onClick={() => setMode(m.key)}>
            {m.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>
            {mode === "of" && "X (%)"}
            {mode === "isWhatOf" && "X (value)"}
            {mode === "change" && "Start value (X)"}
            {mode === "add" && "X (%)"}
          </Label>
          <Input type="number" value={x} onChange={(e) => setX(+e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>
            {mode === "of" && "Y (value)"}
            {mode === "isWhatOf" && "Y (value)"}
            {mode === "change" && "End value (Y)"}
            {mode === "add" && "Y (value)"}
          </Label>
          <Input type="number" value={y} onChange={(e) => setY(+e.target.value)} className="mt-1" />
        </div>
        {mode === "add" && (
          <div className="sm:col-span-2 flex gap-2">
            <Button size="sm" variant={op === "add" ? "default" : "outline"} onClick={() => setOp("add")}>Add %</Button>
            <Button size="sm" variant={op === "sub" ? "default" : "outline"} onClick={() => setOp("sub")}>Subtract %</Button>
          </div>
        )}
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-2">
        <Stat
          label="Result"
          value={result === null ? "—" : mode === "isWhatOf" || mode === "change" ? `${round(result, 4)} %` : round(result, 4)}
          highlight
        />
        <Stat label="Formula" value={<span className="font-mono text-sm">{formula}</span>} />
      </div>

      {chart && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-3 text-sm font-semibold">Visual</h3>
          <div className="flex h-6 overflow-hidden rounded-full">
            {chart.parts.map((p, i) => (
              <div key={i} className={`${p.color} flex items-center justify-center text-[10px] font-medium text-primary-foreground`} style={{ width: `${p.pct}%` }}>
                {p.pct > 10 ? `${round(p.pct, 1)}%` : ""}
              </div>
            ))}
          </div>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {chart.parts.map((p, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded ${p.color}`} />
                {p.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}