import { ReactNode } from "react";

export function Disclaimer({ extra }: { extra?: ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-muted-foreground">
      <p>
        <strong className="text-destructive">Medical disclaimer:</strong> This tool is for
        educational and informational purposes only and is not a substitute for professional
        medical advice, diagnosis or treatment. Always seek the advice of your physician or
        other qualified health provider.
      </p>
      {extra ? <p className="mt-2">{extra}</p> : null}
      <p className="mt-2">All calculations happen in your browser. No data is sent to any server.</p>
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={`mt-1 font-semibold ${
          highlight ? "text-primary text-lg" : "text-foreground"
        }`}
      >
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

/** Convert ft+in to cm; returns 0 if invalid. */
export function ftInToCm(ft: number, inches: number) {
  const total = (Number(ft) || 0) * 12 + (Number(inches) || 0);
  return total * 2.54;
}

export function lbsToKg(lbs: number) {
  return (Number(lbs) || 0) * 0.45359237;
}

export function inToCm(inches: number) {
  return (Number(inches) || 0) * 2.54;
}

export function round(n: number, d = 1) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

export function Bar({
  percent,
  label,
  color = "bg-primary",
}: {
  percent: number;
  label?: string;
  color?: string;
}) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div>
      {label ? <div className="mb-1 text-xs text-muted-foreground">{label}</div> : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${color}`} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}