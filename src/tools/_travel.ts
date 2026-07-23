// Shared data for the travel tool suite. All values are approximate,
// bundled locally so every tool works 100% offline.

export type Destination = {
  city: string;
  country: string;
  // Average daily cost per person in USD by tier
  budget: number;
  mid: number;
  luxury: number;
  // IANA timezone
  tz: string;
  lat: number;
  lon: number;
  // Typical tip % in restaurants
  tipPct: number;
  currency: string;
};

export const DESTINATIONS: Destination[] = [
  { city: "Bangkok",   country: "Thailand",     budget: 35,  mid: 90,  luxury: 250, tz: "Asia/Bangkok",       lat: 13.7563, lon: 100.5018, tipPct: 10, currency: "THB" },
  { city: "Hanoi",     country: "Vietnam",      budget: 30,  mid: 80,  luxury: 220, tz: "Asia/Ho_Chi_Minh",   lat: 21.0285, lon: 105.8542, tipPct: 5,  currency: "VND" },
  { city: "Bali",      country: "Indonesia",    budget: 40,  mid: 100, luxury: 280, tz: "Asia/Makassar",      lat: -8.4095, lon: 115.1889, tipPct: 10, currency: "IDR" },
  { city: "Tokyo",     country: "Japan",        budget: 90,  mid: 200, luxury: 500, tz: "Asia/Tokyo",         lat: 35.6762, lon: 139.6503, tipPct: 0,  currency: "JPY" },
  { city: "Seoul",     country: "South Korea",  budget: 70,  mid: 160, luxury: 400, tz: "Asia/Seoul",         lat: 37.5665, lon: 126.9780, tipPct: 0,  currency: "KRW" },
  { city: "Singapore", country: "Singapore",    budget: 90,  mid: 210, luxury: 520, tz: "Asia/Singapore",     lat: 1.3521,  lon: 103.8198, tipPct: 10, currency: "SGD" },
  { city: "Dubai",     country: "UAE",          budget: 100, mid: 260, luxury: 700, tz: "Asia/Dubai",         lat: 25.2048, lon: 55.2708,  tipPct: 15, currency: "AED" },
  { city: "Istanbul",  country: "Turkey",       budget: 50,  mid: 120, luxury: 320, tz: "Europe/Istanbul",    lat: 41.0082, lon: 28.9784,  tipPct: 10, currency: "TRY" },
  { city: "Paris",     country: "France",       budget: 90,  mid: 220, luxury: 600, tz: "Europe/Paris",       lat: 48.8566, lon: 2.3522,   tipPct: 5,  currency: "EUR" },
  { city: "London",    country: "UK",           budget: 100, mid: 240, luxury: 650, tz: "Europe/London",      lat: 51.5074, lon: -0.1278,  tipPct: 12, currency: "GBP" },
  { city: "Rome",      country: "Italy",        budget: 80,  mid: 200, luxury: 520, tz: "Europe/Rome",        lat: 41.9028, lon: 12.4964,  tipPct: 10, currency: "EUR" },
  { city: "Barcelona", country: "Spain",        budget: 70,  mid: 180, luxury: 480, tz: "Europe/Madrid",      lat: 41.3874, lon: 2.1686,   tipPct: 10, currency: "EUR" },
  { city: "Berlin",    country: "Germany",      budget: 70,  mid: 170, luxury: 450, tz: "Europe/Berlin",      lat: 52.5200, lon: 13.4050,  tipPct: 10, currency: "EUR" },
  { city: "Amsterdam", country: "Netherlands",  budget: 90,  mid: 210, luxury: 550, tz: "Europe/Amsterdam",   lat: 52.3676, lon: 4.9041,   tipPct: 10, currency: "EUR" },
  { city: "New York",  country: "USA",          budget: 130, mid: 300, luxury: 800, tz: "America/New_York",   lat: 40.7128, lon: -74.0060, tipPct: 20, currency: "USD" },
  { city: "Los Angeles", country: "USA",        budget: 120, mid: 280, luxury: 750, tz: "America/Los_Angeles",lat: 34.0522, lon: -118.2437,tipPct: 20, currency: "USD" },
  { city: "Chicago",   country: "USA",          budget: 100, mid: 240, luxury: 620, tz: "America/Chicago",    lat: 41.8781, lon: -87.6298, tipPct: 20, currency: "USD" },
  { city: "Toronto",   country: "Canada",       budget: 90,  mid: 220, luxury: 580, tz: "America/Toronto",    lat: 43.6532, lon: -79.3832, tipPct: 18, currency: "CAD" },
  { city: "Mexico City", country: "Mexico",     budget: 50,  mid: 130, luxury: 340, tz: "America/Mexico_City",lat: 19.4326, lon: -99.1332, tipPct: 12, currency: "MXN" },
  { city: "Rio de Janeiro", country: "Brazil",  budget: 55,  mid: 140, luxury: 360, tz: "America/Sao_Paulo",  lat: -22.9068,lon: -43.1729, tipPct: 10, currency: "BRL" },
  { city: "Sydney",    country: "Australia",    budget: 110, mid: 260, luxury: 680, tz: "Australia/Sydney",   lat: -33.8688,lon: 151.2093, tipPct: 10, currency: "AUD" },
  { city: "Cairo",     country: "Egypt",        budget: 35,  mid: 95,  luxury: 260, tz: "Africa/Cairo",       lat: 30.0444, lon: 31.2357,  tipPct: 10, currency: "EGP" },
  { city: "Cape Town", country: "South Africa", budget: 55,  mid: 140, luxury: 360, tz: "Africa/Johannesburg",lat: -33.9249,lon: 18.4241,  tipPct: 12, currency: "ZAR" },
];

// Offline fallback rates: 1 USD = value in target currency.
// Sourced as reasonable long-run averages; user can override manually.
export const CURRENCIES: Record<string, { name: string; symbol: string; usd: number }> = {
  USD: { name: "US Dollar",         symbol: "$",   usd: 1 },
  EUR: { name: "Euro",              symbol: "€",   usd: 0.92 },
  GBP: { name: "British Pound",     symbol: "£",   usd: 0.79 },
  JPY: { name: "Japanese Yen",      symbol: "¥",   usd: 155 },
  CNY: { name: "Chinese Yuan",      symbol: "¥",   usd: 7.25 },
  KRW: { name: "Korean Won",        symbol: "₩",   usd: 1370 },
  INR: { name: "Indian Rupee",      symbol: "₹",   usd: 83.5 },
  IDR: { name: "Indonesian Rupiah", symbol: "Rp",  usd: 15900 },
  THB: { name: "Thai Baht",         symbol: "฿",   usd: 36.5 },
  VND: { name: "Vietnamese Dong",   symbol: "₫",   usd: 25200 },
  PHP: { name: "Philippine Peso",   symbol: "₱",   usd: 57 },
  MYR: { name: "Malaysian Ringgit", symbol: "RM",  usd: 4.7 },
  SGD: { name: "Singapore Dollar",  symbol: "S$",  usd: 1.34 },
  HKD: { name: "Hong Kong Dollar",  symbol: "HK$", usd: 7.8 },
  TWD: { name: "Taiwan Dollar",     symbol: "NT$", usd: 32 },
  AUD: { name: "Australian Dollar", symbol: "A$",  usd: 1.52 },
  NZD: { name: "New Zealand Dollar",symbol: "NZ$", usd: 1.65 },
  CAD: { name: "Canadian Dollar",   symbol: "C$",  usd: 1.36 },
  MXN: { name: "Mexican Peso",      symbol: "$",   usd: 17.5 },
  BRL: { name: "Brazilian Real",    symbol: "R$",  usd: 5.05 },
  ARS: { name: "Argentine Peso",    symbol: "$",   usd: 900 },
  CLP: { name: "Chilean Peso",      symbol: "$",   usd: 950 },
  COP: { name: "Colombian Peso",    symbol: "$",   usd: 4000 },
  PEN: { name: "Peruvian Sol",      symbol: "S/",  usd: 3.75 },
  CHF: { name: "Swiss Franc",       symbol: "Fr",  usd: 0.88 },
  SEK: { name: "Swedish Krona",     symbol: "kr",  usd: 10.5 },
  NOK: { name: "Norwegian Krone",   symbol: "kr",  usd: 10.7 },
  DKK: { name: "Danish Krone",      symbol: "kr",  usd: 6.9 },
  PLN: { name: "Polish Zloty",      symbol: "zł",  usd: 3.95 },
  CZK: { name: "Czech Koruna",      symbol: "Kč",  usd: 23 },
  HUF: { name: "Hungarian Forint",  symbol: "Ft",  usd: 355 },
  RON: { name: "Romanian Leu",      symbol: "lei", usd: 4.6 },
  BGN: { name: "Bulgarian Lev",     symbol: "лв",  usd: 1.8 },
  TRY: { name: "Turkish Lira",      symbol: "₺",   usd: 32 },
  RUB: { name: "Russian Ruble",     symbol: "₽",   usd: 90 },
  UAH: { name: "Ukrainian Hryvnia", symbol: "₴",   usd: 40 },
  ILS: { name: "Israeli Shekel",    symbol: "₪",   usd: 3.7 },
  AED: { name: "UAE Dirham",        symbol: "د.إ", usd: 3.67 },
  SAR: { name: "Saudi Riyal",       symbol: "﷼",   usd: 3.75 },
  QAR: { name: "Qatari Riyal",      symbol: "﷼",   usd: 3.64 },
  EGP: { name: "Egyptian Pound",    symbol: "£",   usd: 48 },
  ZAR: { name: "South African Rand",symbol: "R",   usd: 18.8 },
  NGN: { name: "Nigerian Naira",    symbol: "₦",   usd: 1600 },
  KES: { name: "Kenyan Shilling",   symbol: "KSh", usd: 130 },
  MAD: { name: "Moroccan Dirham",   symbol: "د.م.",usd: 10 },
  PKR: { name: "Pakistani Rupee",   symbol: "₨",   usd: 278 },
  BDT: { name: "Bangladeshi Taka",  symbol: "৳",   usd: 110 },
  LKR: { name: "Sri Lankan Rupee",  symbol: "Rs",  usd: 300 },
  NPR: { name: "Nepalese Rupee",    symbol: "₨",   usd: 133 },
  KZT: { name: "Kazakhstani Tenge", symbol: "₸",   usd: 470 },
  ISK: { name: "Icelandic Króna",   symbol: "kr",  usd: 138 },
};

export function convert(amount: number, from: string, to: string) {
  const f = CURRENCIES[from]?.usd;
  const t = CURRENCIES[to]?.usd;
  if (!f || !t) return { value: 0, rate: 0 };
  const usd = amount / f;
  const rate = t / f;
  return { value: usd * t, rate };
}

// Deterministic pseudo-random walk to visualize a plausible recent trend
// around the fallback rate (labeled as illustrative — never presented as live data).
export function synthHistory(rate: number, days = 30, seed = 1): number[] {
  const out: number[] = [];
  let x = rate;
  let s = seed || 1;
  for (let i = 0; i < days; i++) {
    s = (s * 9301 + 49297) % 233280;
    const drift = ((s / 233280) - 0.5) * rate * 0.02;
    x = Math.max(rate * 0.85, Math.min(rate * 1.15, x + drift));
    out.push(x);
  }
  return out;
}

export function fmt(n: number, currency: string) {
  const c = CURRENCIES[currency];
  if (!c) return n.toFixed(2);
  const digits = c.usd > 100 ? 0 : 2;
  return `${c.symbol}${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

// Haversine distance in km
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}