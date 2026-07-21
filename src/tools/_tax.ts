export type FilingStatus = "single" | "married" | "hoh";
export type Bracket = { up: number | null; rate: number };

// 2024 & 2025 US federal ordinary income brackets (IRS).
export const US_FEDERAL_BRACKETS: Record<"2024" | "2025", Record<FilingStatus, Bracket[]>> = {
  "2024": {
    single: [
      { up: 11600, rate: 10 }, { up: 47150, rate: 12 }, { up: 100525, rate: 22 },
      { up: 191950, rate: 24 }, { up: 243725, rate: 32 }, { up: 609350, rate: 35 }, { up: null, rate: 37 },
    ],
    married: [
      { up: 23200, rate: 10 }, { up: 94300, rate: 12 }, { up: 201050, rate: 22 },
      { up: 383900, rate: 24 }, { up: 487450, rate: 32 }, { up: 731200, rate: 35 }, { up: null, rate: 37 },
    ],
    hoh: [
      { up: 16550, rate: 10 }, { up: 63100, rate: 12 }, { up: 100500, rate: 22 },
      { up: 191950, rate: 24 }, { up: 243700, rate: 32 }, { up: 609350, rate: 35 }, { up: null, rate: 37 },
    ],
  },
  "2025": {
    single: [
      { up: 11925, rate: 10 }, { up: 48475, rate: 12 }, { up: 103350, rate: 22 },
      { up: 197300, rate: 24 }, { up: 250525, rate: 32 }, { up: 626350, rate: 35 }, { up: null, rate: 37 },
    ],
    married: [
      { up: 23850, rate: 10 }, { up: 96950, rate: 12 }, { up: 206700, rate: 22 },
      { up: 394600, rate: 24 }, { up: 501050, rate: 32 }, { up: 751600, rate: 35 }, { up: null, rate: 37 },
    ],
    hoh: [
      { up: 17000, rate: 10 }, { up: 64850, rate: 12 }, { up: 103350, rate: 22 },
      { up: 197300, rate: 24 }, { up: 250500, rate: 32 }, { up: 626350, rate: 35 }, { up: null, rate: 37 },
    ],
  },
};

// Simplified top marginal state rates for common states (%).
export const US_STATE_RATE: Record<string, number> = {
  AL: 5, AK: 0, AZ: 2.5, AR: 4.4, CA: 9.3, CO: 4.4, CT: 5.5, DE: 5.55,
  FL: 0, GA: 5.39, HI: 8.25, ID: 5.8, IL: 4.95, IN: 3.05, IA: 4.4, KS: 5.7,
  KY: 4, LA: 4.25, ME: 6.75, MD: 5, MA: 5, MI: 4.25, MN: 6.8, MS: 4.7,
  MO: 4.8, MT: 5.9, NE: 5.2, NV: 0, NH: 0, NJ: 6.37, NM: 4.9, NY: 6.85,
  NC: 4.5, ND: 2.04, OH: 3.5, OK: 4.75, OR: 8.75, PA: 3.07, RI: 4.75, SC: 6.4,
  SD: 0, TN: 0, TX: 0, UT: 4.55, VT: 6.6, VA: 5.75, WA: 0, WV: 4.82,
  WI: 5.3, WY: 0, DC: 8.5,
};

export function calcProgressive(taxable: number, br: Bracket[]) {
  const rows: { from: number; to: number; rate: number; tax: number }[] = [];
  let prev = 0, total = 0, marginal = 0;
  for (const b of br) {
    const cap = b.up ?? Infinity;
    if (taxable <= prev) break;
    const inThis = Math.min(taxable, cap) - prev;
    const tax = (inThis * b.rate) / 100;
    rows.push({ from: prev, to: cap === Infinity ? Math.max(taxable, prev + 1) : cap, rate: b.rate, tax });
    total += tax;
    marginal = b.rate;
    prev = cap;
    if (taxable <= cap) break;
  }
  const nextBracket = br.find((b) => (b.up ?? Infinity) > taxable && (b.up ?? Infinity) !== Infinity);
  const roomToNext = nextBracket ? Math.max(0, (nextBracket.up ?? 0) - taxable) : 0;
  return { rows, total, marginal, roomToNext };
}