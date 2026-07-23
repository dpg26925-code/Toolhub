// Shared odds math for the sports/betting tool suite.
// American: +150 means bet 100 to win 150; -200 means bet 200 to win 100.
// Decimal: 2.50 means bet 1 to receive 2.50 total (1.50 profit).
// Fractional: 3/2 means bet 2 to win 3 (profit).

export type OddsFormat = "american" | "decimal" | "fractional";

export function toDecimal(value: string | number, format: OddsFormat): number {
  if (format === "decimal") {
    const d = Number(value);
    return Number.isFinite(d) && d > 1 ? d : NaN;
  }
  if (format === "american") {
    const a = Number(value);
    if (!Number.isFinite(a) || a === 0) return NaN;
    return a > 0 ? 1 + a / 100 : 1 + 100 / Math.abs(a);
  }
  // fractional "3/2" or "3-2"
  const parts = String(value).replace("-", "/").split("/");
  if (parts.length !== 2) return NaN;
  const num = Number(parts[0]); const den = Number(parts[1]);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return NaN;
  return 1 + num / den;
}

export function fromDecimal(d: number, format: OddsFormat): string {
  if (!Number.isFinite(d) || d <= 1) return "—";
  if (format === "decimal") return d.toFixed(2);
  if (format === "american") {
    const a = d >= 2 ? (d - 1) * 100 : -100 / (d - 1);
    return `${a > 0 ? "+" : ""}${Math.round(a)}`;
  }
  // fractional — reduce to lowest terms with a scale search
  const profit = d - 1;
  let bestN = 1, bestD = 1, bestErr = Infinity;
  for (let den = 1; den <= 50; den++) {
    const num = Math.round(profit * den);
    if (num <= 0) continue;
    const err = Math.abs(profit - num / den);
    if (err < bestErr) { bestErr = err; bestN = num; bestD = den; }
  }
  const g = gcd(bestN, bestD);
  return `${bestN / g}/${bestD / g}`;
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

export function impliedProbability(decimal: number): number {
  if (!Number.isFinite(decimal) || decimal <= 1) return 0;
  return 1 / decimal;
}

export function payout(stake: number, decimal: number): { total: number; profit: number } {
  if (!Number.isFinite(stake) || stake <= 0 || !Number.isFinite(decimal) || decimal <= 1) {
    return { total: 0, profit: 0 };
  }
  const total = stake * decimal;
  return { total, profit: total - stake };
}

export const DISCLAIMER =
  "For entertainment and statistical analysis only. Gambling involves risk and can be addictive. If you or someone you know needs help: 1-800-GAMBLER (US).";