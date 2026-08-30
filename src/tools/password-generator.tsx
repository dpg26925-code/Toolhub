import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const LOOKALIKES = /[O0Il1|]/g;

function createSecurePassword(
  length: number,
  lower: boolean,
  upper: boolean,
  digits: boolean,
  symbols: boolean,
  noLookalikes: boolean
): string {
  let pool = "";
  if (lower) pool += LOWER;
  if (upper) pool += UPPER;
  if (digits) pool += DIGITS;
  if (symbols) pool += SYMBOLS;

  if (noLookalikes) {
    pool = pool.replace(LOOKALIKES, "");
  }

  if (!pool) pool = LOWER + DIGITS;

  const array = new Uint32Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 1000000);
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    result += pool[array[i] % pool.length];
  }
  return result;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
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
  const [copied, setCopied] = useState(false);

  // Initialize password immediately on component initialization
  const [pwd, setPwd] = useState(() =>
    createSecurePassword(20, true, true, true, true, false)
  );

  const generate = useCallback(
    (
      len = length,
      l = lower,
      u = upper,
      d = digits,
      s = symbols,
      look = noLookalikes
    ) => {
      const nextPwd = createSecurePassword(len, l, u, d, s, look);
      setPwd(nextPwd);
    },
    [length, lower, upper, digits, symbols, noLookalikes]
  );

  const strengthInfo = useMemo(() => {
    let poolSize = 0;
    if (lower) poolSize += 26;
    if (upper) poolSize += 26;
    if (digits) poolSize += 10;
    if (symbols) poolSize += 28;

    const entropy = Math.round(length * (Math.log2(poolSize || 1)));

    if (entropy < 40) {
      return { label: "Weak", color: "bg-destructive", textColor: "text-destructive", pct: 25 };
    } else if (entropy < 65) {
      return { label: "Moderate", color: "bg-amber-500", textColor: "text-amber-500", pct: 55 };
    } else if (entropy < 90) {
      return { label: "Strong", color: "bg-blue-500", textColor: "text-blue-500", pct: 80 };
    }
    return { label: "Very Strong", color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", pct: 100 };
  }, [length, lower, upper, digits, symbols]);

  const handleCopy = async () => {
    if (!pwd) return;
    const ok = await copyToClipboard(pwd);
    if (ok) {
      setCopied(true);
      toast.success("Password copied to clipboard!");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handlePreset = (presetLen: number, s: boolean) => {
    setLength(presetLen);
    setSymbols(s);
    generate(presetLen, lower, upper, digits, s, noLookalikes);
    toast.info(`Preset applied: ${presetLen} characters`);
  };

  return (
    <div className="space-y-6">
      {/* Generated Password Box */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <KeyRound className="h-4 w-4 text-brand" />
            Generated Secure Password
          </Label>
          <span className={`text-xs font-bold ${strengthInfo.textColor}`}>
            {strengthInfo.label} Security
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={pwd}
            readOnly
            className="h-12 font-mono text-base font-medium tracking-wider select-all bg-muted/40"
          />
          <div className="flex gap-2">
            <Button
              size="lg"
              onClick={handleCopy}
              className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold px-5"
            >
              {copied ? (
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
              title="Generate new password"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Strength Meter Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${strengthInfo.color} transition-all duration-300`}
              style={{ width: `${strengthInfo.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Configuration & Options */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-xs">
        {/* Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <span className="text-xs font-semibold text-muted-foreground">Quick Presets:</span>
          <div className="flex flex-wrap gap-2">
            <Button size="xs" variant="outline" onClick={() => handlePreset(12, false)} className="text-xs">
              Simple (12 chars)
            </Button>
            <Button size="xs" variant="outline" onClick={() => handlePreset(16, true)} className="text-xs">
              <Zap className="mr-1 h-3 w-3 text-brand" />
              Standard (16 chars)
            </Button>
            <Button size="xs" variant="outline" onClick={() => handlePreset(24, true)} className="text-xs">
              High Security (24 chars)
            </Button>
            <Button size="xs" variant="outline" onClick={() => handlePreset(32, true)} className="text-xs">
              Maximum (32 chars)
            </Button>
          </div>
        </div>

        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <Label>Password Length</Label>
            <span className="font-mono text-brand font-bold text-base">{length}</span>
          </div>
          <Slider
            min={6}
            max={64}
            step={1}
            value={[length]}
            onValueChange={(v) => {
              const nextLen = v[0];
              setLength(nextLen);
              generate(nextLen, lower, upper, digits, symbols, noLookalikes);
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
                generate(length, val, upper, digits, symbols, noLookalikes);
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
                generate(length, lower, val, digits, symbols, noLookalikes);
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
                generate(length, lower, upper, val, symbols, noLookalikes);
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
                generate(length, lower, upper, digits, val, noLookalikes);
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
                generate(length, lower, upper, digits, symbols, val);
              }}
            />
            <span>Avoid ambiguous chars (0, O, 1, l, I)</span>
          </label>
        </div>

        <div className="rounded-xl bg-muted/30 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            Generated cryptographically using <code>window.crypto.getRandomValues</code> for complete entropy.
          </span>
        </div>
      </div>
    </div>
  );
}