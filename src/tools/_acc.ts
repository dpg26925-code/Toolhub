export const fmt = (n: number, d = 2) => (isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");
export const copy = (s: string) => navigator.clipboard.writeText(s);
export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "VND", "AUD", "CAD", "SGD"];
export const currencySymbol = (c: string) => ({ USD: "$", EUR: "€", GBP: "£", JPY: "¥", VND: "₫", AUD: "A$", CAD: "C$", SGD: "S$" }[c] || c + " ");