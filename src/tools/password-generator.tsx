import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  Zap,
  AlertCircle,
} from "lucide-react";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = /[O0Il1|]/g;

function getCharset(
  lower: boolean,
  upper: boolean,
  digits: boolean,
  symbols: boolean,
  excludeAmbiguous: boolean
): string {
  let pool = "";
  if (lower) pool += LOWER;
  if (upper) pool += UPPER;
  if (digits) pool += DIGITS;
  if (symbols) pool += SYMBOLS;

  if (excludeAmbiguous) {
    pool = pool.replace(AMBIGUOUS, "");
  }
  return pool;
}

function generateSinglePassword(len: number, pool: string): string {
  if (!pool || len <= 0) return "";
  const array = new Uint32Array(len);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < len; i++) array[i] = Math.floor(Math.random() * 1000000);
  }

  let result = "";
  for (let i = 0; i < len; i++) {
    result += pool[array[i] % pool.length];
  }
  return result;
}

function calculateCrackTime(entropy: number, charsetSize: number, length: number): string {
  if (entropy < 28) return "Instant (< 1 ms)";
  // Attack model: 100 billion (10^11) hashes per second
  const logCombinations = length * Math.log10(charsetSize || 1);
  const logSeconds = logCombinations - 11;

  if (logSeconds <= 0) return "Instant (< 1 second)";
  if (logSeconds < 1.77) {
    const s = Math.round(Math.pow(10, logSeconds));
    return `${s} second${s > 1 ? "s" : ""}`;
  }
  if (logSeconds < 3.55) {
    const m = Math.round(Math.pow(10, logSeconds) / 60);
    return `${m} minute${m > 1 ? "s" : ""}`;
  }
  if (logSeconds < 4.93) {
    const h = Math.round(Math.pow(10, logSeconds) / 3600);
    return `${h} hour${h > 1 ? "s" : ""}`;
  }
  if (logSeconds < 6.49) {
    const d = Math.round(Math.pow(10, logSeconds) / 86400);
    return `${d} day${d > 1 ? "s" : ""}`;
  }
  if (logSeconds < 8.49) {
    const y = Math.round(Math.pow(10, logSeconds) / 31536000);
    return `${y} year${y > 1 ? "s" : ""}`;
  }
  if (logSeconds < 11) {
    const my = Math.round(Math.pow(10, logSeconds) / (31536000 * 1000));
    return `${my.toLocaleString()} thousand years`;
  }
  if (logSeconds < 14) {
    const mil = Math.round(Math.pow(10, logSeconds) / (31536000 * 1000000));
    return `${mil.toLocaleString()} million years`;
  }
  return "Centuries (Cryptographically Unbreakable)";
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
    }
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const res = document.execCommand("copy");
    document.body.removeChild(textArea);
    return res;
  } catch {
    return false;
  }
}

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [noLookalikes, setNoLookalikes] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const pool = useMemo(
    () => getCharset(lower, upper, digits, symbols, noLookalikes),
    [lower, upper, digits, symbols, noLookalikes]
  );

  const isValidCharset = pool.length > 0;
  const isLengthValid = length >= 8 && length <= 128;

  // Passwords list state
  const [passwords, setPasswords] = useState<string[]>(() => {
    const initialPool = getCharset(true, true, true, true, false);
    return [generateSinglePassword(20, initialPool)];
  });

  const generate = useCallback(
    (
      len = length,
      l = lower,
      u = upper,
      d = digits,
      s = symbols,
      look = noLookalikes,
      qty = quantity
    ) => {
      const activePool = getCharset(l, u, d, s, look);
      if (!activePool) {
        toast.error("At least one character set must be selected");
        return;
      }
      const actualLen = Math.max(8, Math.min(128, len));
      const list: string[] = [];
      for (let i = 0; i < qty; i++) {
        list.push(generateSinglePassword(actualLen, activePool));
      }
      setPasswords(list);
    },
    [length, lower, upper, digits, symbols, noLookalikes, quantity]
  );

  const securityInfo = useMemo(() => {
    const charsetSize = pool.length;
    const entropy = isValidCharset && isLengthValid ? Math.round(length * Math.log2(charsetSize || 1)) : 0;
    const crackTime = isValidCharset && isLengthValid ? calculateCrackTime(entropy, charsetSize, length) : "N/A";

    let label = "Weak";
    let color = "bg-destructive";
    let textColor = "text-destructive";
    let pct = 25;

    if (entropy < 40) {
      label = "Weak";
      color = "bg-destructive";
      textColor = "text-destructive";
      pct = 25;
    } else if (entropy < 65) {
      label = "Moderate";
      color = "bg-amber-500";
      textColor = "text-amber-500";
      pct = 55;
    } else if (entropy < 90) {
      label = "Strong";
      color = "bg-blue-500";
      textColor = "text-blue-500";
      pct = 80;
    } else {
      label = "Very Strong";
      color = "bg-emerald-500";
      textColor = "text-emerald-600 dark:text-emerald-400";
      pct = 100;
    }

    return {
      charsetSize,
      entropy,
      crackTime,
      label,
      color,
      textColor,
      pct,
    };
  }, [pool, length, isValidCharset, isLengthValid]);

  const handleCopySingle = async (idx: number, pwdText: string) => {
    if (!pwdText) return;
    const ok = await copyToClipboard(pwdText);
    if (ok) {
      setCopiedIndex(idx);
      toast.success(`Password #${idx + 1} copied to clipboard!`);
      setTimeout(() => setCopiedIndex(null), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleCopyAll = async () => {
    if (passwords.length === 0) return;
    const allText = passwords.join("\n");
    const ok = await copyToClipboard(allText);
    if (ok) {
      setCopiedAll(true);
      toast.success("All passwords copied to clipboard!");
      setTimeout(() => setCopiedAll(false), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handlePreset = (presetLen: number, s: boolean) => {
    setLength(presetLen);
    setSymbols(s);
    generate(presetLen, lower, upper, digits, s, noLookalikes, quantity);
    toast.info(`Preset applied: ${presetLen} characters`);
  };

  return (
    <div className="space-y-6">
      {/* Generated Password(s) Box */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <KeyRound className="h-4 w-4 text-brand" />
            Generated Password{passwords.length > 1 ? `s (${passwords.length})` : ""}
          </Label>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground font-mono">
              Entropy: <strong>{securityInfo.entropy} bits</strong>
            </span>
            <span className={`font-bold ${securityInfo.textColor}`}>
              {securityInfo.label} Security
            </span>
          </div>
        </div>

        {/* Password Output Area */}
        {passwords.length === 1 ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={passwords[0] || ""}
              readOnly
              className="h-12 font-mono text-base font-medium tracking-wider select-all bg-muted/40"
            />
            <div className="flex gap-2">
              <Button
                size="lg"
                onClick={() => handleCopySingle(0, passwords[0])}
                disabled={!passwords[0]}
                className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold px-5"
              >
                {copiedIndex === 0 ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4 text-emerald-300" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => generate()}
                disabled={!isValidCharset}
                title="Generate new password"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {passwords.map((pwd, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={pwd}
                    readOnly
                    className="h-10 font-mono text-xs font-medium tracking-wider select-all bg-muted/40"
                  />
                  <Button
                    size="sm"
                    variant={copiedIndex === idx ? "default" : "secondary"}
                    onClick={() => handleCopySingle(idx, pwd)}
                    className="h-10 text-xs shrink-0"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="mr-1 h-3 w-3 text-emerald-300" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyAll}
                className="text-xs"
              >
                {copiedAll ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                    Copied All Passwords!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy All {passwords.length} Passwords
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => generate()}
                disabled={!isValidCharset}
                className="bg-brand text-brand-foreground hover:bg-brand/90 text-xs font-semibold"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Regenerate Batch
              </Button>
            </div>
          </div>
        )}

        {/* Strength & Crack Time Info */}
        <div className="space-y-2 pt-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${securityInfo.color} transition-all duration-300`}
              style={{ width: `${securityInfo.pct}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1">
            <span>
              Estimated Crack Time:{" "}
              <strong className="text-foreground">{securityInfo.crackTime}</strong>
            </span>
            <span>
              Charset Size: <strong>{securityInfo.charsetSize} characters</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Configuration & Options */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-xs">
        {/* Error banner if no charset selected */}
        {!isValidCharset && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Selection Error: </strong>
              <span>At least one character set must be selected.</span>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <span className="text-xs font-semibold text-muted-foreground">Quick Presets:</span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreset(12, false)}
              className="text-xs"
            >
              Simple (12 chars)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreset(16, true)}
              className="text-xs"
            >
              <Zap className="mr-1 h-3 w-3 text-brand" />
              Standard (16 chars)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreset(24, true)}
              className="text-xs"
            >
              High Security (24 chars)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreset(32, true)}
              className="text-xs"
            >
              Maximum (32 chars)
            </Button>
          </div>
        </div>

        {/* Length Slider (8 - 128) */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <Label>Password Length (8 - 128)</Label>
            <span className="font-mono text-brand font-bold text-base">{length}</span>
          </div>
          <Slider
            min={8}
            max={128}
            step={1}
            value={[length]}
            onValueChange={(v) => {
              const nextLen = v[0];
              setLength(nextLen);
              generate(nextLen, lower, upper, digits, symbols, noLookalikes, quantity);
            }}
          />
        </div>

        {/* Number of Passwords (1 - 10) */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <Label>Number of Passwords (1 - 10)</Label>
            <span className="font-mono text-brand font-bold text-base">{quantity}</span>
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[quantity]}
            onValueChange={(v) => {
              const nextQty = v[0];
              setQuantity(nextQty);
              generate(length, lower, upper, digits, symbols, noLookalikes, nextQty);
            }}
          />
        </div>

        {/* Character Type Checkboxes */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 pt-2">
          <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer rounded-xl border border-border p-3 hover:bg-muted/40">
            <Checkbox
              checked={lower}
              onCheckedChange={(v) => {
                const val = !!v;
                setLower(val);
                generate(length, val, upper, digits, symbols, noLookalikes, quantity);
              }}
            />
            <span>Lowercase (a-z)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer rounded-xl border border-border p-3 hover:bg-muted/40">
            <Checkbox
              checked={upper}
              onCheckedChange={(v) => {
                const val = !!v;
                setUpper(val);
                generate(length, lower, val, digits, symbols, noLookalikes, quantity);
              }}
            />
            <span>Uppercase (A-Z)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer rounded-xl border border-border p-3 hover:bg-muted/40">
            <Checkbox
              checked={digits}
              onCheckedChange={(v) => {
                const val = !!v;
                setDigits(val);
                generate(length, lower, upper, val, symbols, noLookalikes, quantity);
              }}
            />
            <span>Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer rounded-xl border border-border p-3 hover:bg-muted/40">
            <Checkbox
              checked={symbols}
              onCheckedChange={(v) => {
                const val = !!v;
                setSymbols(val);
                generate(length, lower, upper, digits, val, noLookalikes, quantity);
              }}
            />
            <span>Symbols (!@#$%)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer rounded-xl border border-border p-3 hover:bg-muted/40 sm:col-span-2">
            <Checkbox
              checked={noLookalikes}
              onCheckedChange={(v) => {
                const val = !!v;
                setNoLookalikes(val);
                generate(length, lower, upper, digits, symbols, val, quantity);
              }}
            />
            <span>Exclude ambiguous (l, 1, I, O, 0)</span>
          </label>
        </div>

        {/* Generate Action Button */}
        <div className="pt-2">
          <Button
            size="lg"
            onClick={() => generate()}
            disabled={!isValidCharset}
            className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Password{quantity > 1 ? `s (${quantity})` : ""}
          </Button>
        </div>

        <div className="rounded-xl bg-muted/30 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            Generated cryptographically using <code>crypto.getRandomValues()</code> CSPRNG for complete randomness.
          </span>
        </div>
      </div>
    </div>
  );
}