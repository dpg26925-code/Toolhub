import { ReactNode } from "react";

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
      <div className={`mt-1 font-semibold ${highlight ? "text-primary text-lg" : "text-foreground"}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function Bar({
  percent,
  color = "bg-primary",
  label,
}: {
  percent: number;
  color?: string;
  label?: string;
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

export function round(n: number, d = 2) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

// ---------- Grade scale helpers ----------
// 4.0 scale (US +/- system, common convention)
export const LETTER_4 = [
  { l: "A+", g: 4.0, pctMin: 97 },
  { l: "A", g: 4.0, pctMin: 93 },
  { l: "A-", g: 3.7, pctMin: 90 },
  { l: "B+", g: 3.3, pctMin: 87 },
  { l: "B", g: 3.0, pctMin: 83 },
  { l: "B-", g: 2.7, pctMin: 80 },
  { l: "C+", g: 2.3, pctMin: 77 },
  { l: "C", g: 2.0, pctMin: 73 },
  { l: "C-", g: 1.7, pctMin: 70 },
  { l: "D+", g: 1.3, pctMin: 67 },
  { l: "D", g: 1.0, pctMin: 63 },
  { l: "D-", g: 0.7, pctMin: 60 },
  { l: "F", g: 0.0, pctMin: 0 },
];

// 5.0 scale (weighted; A+ = 5.0, A = 5.0, A- = 4.7, etc.)
export const LETTER_5 = LETTER_4.map((r) => ({
  ...r,
  g: r.l === "F" ? 0 : Math.min(5, r.g + 1),
}));

export function pctToLetter(pct: number) {
  return LETTER_4.find((r) => pct >= r.pctMin)?.l ?? "F";
}

export function letterTo4(letter: string) {
  return LETTER_4.find((r) => r.l.toUpperCase() === letter.toUpperCase())?.g ?? null;
}

export function saveJSON<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}