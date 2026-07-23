import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>/?~";
const AMBIGUOUS = /[0Oo1lI|]/g;

const CV = ["ba","be","bi","bo","bu","ca","de","di","du","fa","fe","fi","ga","gi","ho","ka","ki","la","le","li","lo","ma","me","mi","mo","mu","na","ne","ni","no","pa","pe","pi","ra","re","ri","ro","sa","se","si","so","ta","te","ti","to","tu","va","ve","vi","yo","zu"];

function secureInt(max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}
function generate(length: number, alpha: string, requiredSets: string[]) {
  if (!alpha) return "";
  const chars: string[] = [];
  for (const set of requiredSets) chars.push(set[secureInt(set.length)]);
  while (chars.length < length) chars.push(alpha[secureInt(alpha.length)]);
  // shuffle
  for (let i = chars.length - 1; i > 0; i--) { const j = secureInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.slice(0, length).join("");
}
function generatePronounceable(length: number) {
  let out = "";
  while (out.length < length) out += CV[secureInt(CV.length)];
  return out.slice(0, length);
}

export default function PasswordGeneratorAdvancedTool() {
  const [length, setLength] = useState(20);
  const [count, setCount] = useState(5);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [pronounceable, setPronounceable] = useState(false);
  const [tick, setTick] = useState(0);

  const passwords = useMemo(() => {
    void tick;
    if (pronounceable) return Array.from({ length: count }, () => generatePronounceable(length));
    let alpha = "";
    const required: string[] = [];
    if (lower) { alpha += LOWER; required.push(LOWER); }
    if (upper) { alpha += UPPER; required.push(UPPER); }
    if (digits) { alpha += DIGITS; required.push(DIGITS); }
    if (symbols) { alpha += SYMBOLS; required.push(SYMBOLS); }
    if (noAmbiguous) alpha = alpha.replace(AMBIGUOUS, "");
    if (!alpha) return [];
    return Array.from({ length: count }, () => generate(length, alpha, required));
  }, [length, count, lower, upper, digits, symbols, noAmbiguous, pronounceable, tick]);

  const pool = (lower ? 26 : 0) + (upper ? 26 : 0) + (digits ? 10 : 0) + (symbols ? SYMBOLS.length : 0) - (noAmbiguous ? 6 : 0);
  const entropy = pool > 0 ? Math.log2(pool) * length : 0;
  const guesses = Math.pow(2, entropy);
  const seconds = guesses / 1e10;
  const humanTime = seconds < 1 ? "instant" : seconds < 60 ? `${seconds.toFixed(0)}s` : seconds < 3600 ? `${(seconds / 60).toFixed(0)}m` : seconds < 86400 ? `${(seconds / 3600).toFixed(0)}h` : seconds < 31536000 ? `${(seconds / 86400).toFixed(0)}d` : seconds < 31536000 * 100 ? `${(seconds / 31536000).toFixed(0)}y` : "centuries";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Length: {length}</Label><input type="range" min={4} max={64} value={length} onChange={(e) => setLength(+e.target.value)} className="mt-2 w-full" /></div>
        <div><Label>How many</Label><Input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, +e.target.value)))} className="mt-1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} /> Lowercase</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={digits} onChange={(e) => setDigits(e.target.checked)} /> Digits</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} /> Symbols</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={noAmbiguous} onChange={(e) => setNoAmbiguous(e.target.checked)} /> Exclude 0/O/1/l/I</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pronounceable} onChange={(e) => setPronounceable(e.target.checked)} /> Pronounceable</label>
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
        <div><span className="text-muted-foreground">Entropy:</span> <strong>{entropy.toFixed(1)} bits</strong></div>
        <div><span className="text-muted-foreground">Crack time:</span> <strong>{humanTime}</strong></div>
        <Button size="sm" variant="outline" onClick={() => setTick((t) => t + 1)}>Regenerate</Button>
      </div>
      <div className="space-y-2">
        {passwords.map((p, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border bg-background p-2">
            <code className="flex-1 truncate font-mono text-sm">{p}</code>
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(p); toast.success("Copied"); }}>Copy</Button>
          </div>
        ))}
      </div>
      {passwords.length > 1 && (
        <Button variant="outline" onClick={() => { navigator.clipboard.writeText(passwords.join("\n")); toast.success("All copied"); }}>Copy all</Button>
      )}
      <p className="text-xs text-muted-foreground">Generated with <code>crypto.getRandomValues()</code>. Never leaves your browser.</p>
    </div>
  );
}