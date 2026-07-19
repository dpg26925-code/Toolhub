// Shared trading helpers used by all trader-tool components.
export type PairKey =
  | "EUR/USD" | "GBP/USD" | "USD/JPY" | "USD/CHF"
  | "AUD/USD" | "NZD/USD" | "USD/CAD" | "GBP/JPY";

export const PAIRS: PairKey[] = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF",
  "AUD/USD", "NZD/USD", "USD/CAD", "GBP/JPY",
];

/** 1 pip in price units (JPY quote = 0.01, others = 0.0001). */
export function pipSize(pair: string): number {
  return pair.endsWith("JPY") ? 0.01 : 0.0001;
}

/** Units per 1 lot given lot type. */
export const LOT_UNITS = { standard: 100_000, mini: 10_000, micro: 1_000 } as const;
export type LotType = keyof typeof LOT_UNITS;

/**
 * Pip value in the account currency (assumed USD).
 * For X/USD pairs: pip value = pipSize * units. For USD/X: pip value = pipSize * units / price.
 * For JPY-quoted USD/JPY: (0.01 * units) / price.
 */
export function pipValueUSD(pair: string, units: number, price: number): number {
  const ps = pipSize(pair);
  const [base, quote] = pair.split("/");
  if (quote === "USD") return ps * units;
  if (base === "USD") return price > 0 ? (ps * units) / price : 0;
  // Cross like GBP/JPY — approximate using quote price ratio (assumed price is quote per base).
  return price > 0 ? (ps * units) / price : 0;
}

/** Difference in pips between two prices (absolute). */
export function priceDiffPips(pair: string, a: number, b: number): number {
  return Math.abs(a - b) / pipSize(pair);
}

export function fmt(n: number, digits = 2): string {
  if (!isFinite(n)) return "—";
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function parsePriceSeries(input: string): number[] {
  return input
    .split(/[\s,;\n\r\t]+/)
    .map((v) => Number(v))
    .filter((v) => isFinite(v) && v > 0);
}

/** Simple moving average of window w over series. Returns array aligned to input; leading (w-1) values are NaN. */
export function sma(series: number[], w: number): number[] {
  const out = new Array(series.length).fill(NaN);
  if (w <= 0 || series.length < w) return out;
  let sum = 0;
  for (let i = 0; i < series.length; i++) {
    sum += series[i];
    if (i >= w) sum -= series[i - w];
    if (i >= w - 1) out[i] = sum / w;
  }
  return out;
}

/** Exponential moving average. Same length as input; leading values NaN until seeded. */
export function ema(series: number[], w: number): number[] {
  const out = new Array(series.length).fill(NaN);
  if (w <= 0 || series.length < w) return out;
  const k = 2 / (w + 1);
  // seed with SMA of first w
  let seed = 0;
  for (let i = 0; i < w; i++) seed += series[i];
  seed /= w;
  out[w - 1] = seed;
  for (let i = w; i < series.length; i++) out[i] = series[i] * k + out[i - 1] * (1 - k);
  return out;
}

export function stddev(series: number[], mean: number): number {
  if (!series.length) return 0;
  const v = series.reduce((s, x) => s + (x - mean) ** 2, 0) / series.length;
  return Math.sqrt(v);
}

export function copy(text: string) {
  try {
    navigator.clipboard.writeText(text);
  } catch { /* ignore */ }
}