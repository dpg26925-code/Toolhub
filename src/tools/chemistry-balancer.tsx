import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function parseSide(side: string): Array<Record<string, number>> {
  return side.split("+").map(t => {
    const m: Record<string, number> = {};
    const compound = t.trim().replace(/^\d+\s*/, "");
    const re = /([A-Z][a-z]?)(\d*)|\(([^)]+)\)(\d*)/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(compound)) !== null) {
      if (match[1]) {
        const el = match[1];
        const n = match[2] ? parseInt(match[2]) : 1;
        m[el] = (m[el] || 0) + n;
      } else if (match[3]) {
        const mult = match[4] ? parseInt(match[4]) : 1;
        const inner = match[3];
        const inRe = /([A-Z][a-z]?)(\d*)/g;
        let im: RegExpExecArray | null;
        while ((im = inRe.exec(inner)) !== null) {
          if (!im[1]) continue;
          m[im[1]] = (m[im[1]] || 0) + (im[2] ? parseInt(im[2]) : 1) * mult;
        }
      }
    }
    return m;
  });
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function lcm(a: number, b: number) { return Math.abs(a * b) / gcd(a, b); }

// Brute-force small coefficients (up to 12)
function balance(eq: string): { coeffs: number[]; balanced: string } | { error: string } {
  try {
    const [lhs, rhs] = eq.split(/=|->|→/).map(s => s.trim());
    if (!lhs || !rhs) return { error: "Use format: H2 + O2 = H2O" };
    const L = parseSide(lhs);
    const R = parseSide(rhs);
    const n = L.length + R.length;
    if (n > 6) return { error: "Too many terms (max 6)" };
    const elements = Array.from(new Set([...L, ...R].flatMap(m => Object.keys(m))));
    const MAX = 10;
    const combos: number[][] = [[]];
    for (let i = 0; i < n; i++) {
      const next: number[][] = [];
      for (const c of combos) for (let v = 1; v <= MAX; v++) next.push([...c, v]);
      combos.splice(0, combos.length, ...next);
    }
    // Prefer smaller sums
    combos.sort((a, b) => a.reduce((x, y) => x + y, 0) - b.reduce((x, y) => x + y, 0));
    for (const c of combos) {
      let ok = true;
      for (const el of elements) {
        let ls = 0, rs = 0;
        L.forEach((m, i) => ls += (m[el] || 0) * c[i]);
        R.forEach((m, i) => rs += (m[el] || 0) * c[L.length + i]);
        if (ls !== rs) { ok = false; break; }
      }
      if (ok) {
        // Reduce by gcd
        let g = c[0]; for (const v of c) g = gcd(g, v);
        const r = c.map(v => v / g);
        const lterms = lhs.split("+").map((t, i) => `${r[i] === 1 ? "" : r[i]}${t.trim().replace(/^\d+\s*/, "")}`);
        const rterms = rhs.split("+").map((t, i) => `${r[L.length + i] === 1 ? "" : r[L.length + i]}${t.trim().replace(/^\d+\s*/, "")}`);
        return { coeffs: r, balanced: `${lterms.join(" + ")} → ${rterms.join(" + ")}` };
      }
    }
    return { error: "No solution found (try simpler equation)" };
  } catch { return { error: "Invalid format" }; }
}

export default function ChemistryBalancer() {
  const [eq, setEq] = useState("H2 + O2 = H2O");
  const [result, setResult] = useState<{ balanced: string } | { error: string } | null>(null);
  return (
    <div className="space-y-4">
      <Input value={eq} onChange={e => setEq(e.target.value)} placeholder="e.g. Fe + O2 = Fe2O3" className="font-mono" />
      <Button onClick={() => setResult(balance(eq))}>Balance</Button>
      {result && "balanced" in result && (
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground mb-2">Balanced:</div>
          <div className="text-xl font-mono">{result.balanced}</div>
        </div>
      )}
      {result && "error" in result && <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{result.error}</div>}
      <p className="text-xs text-muted-foreground">Try: CH4 + O2 = CO2 + H2O · Fe + Cl2 = FeCl3</p>
    </div>
  );
}
