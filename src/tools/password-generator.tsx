import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?";

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [pwd, setPwd] = useState("");

  const generate = useCallback(() => {
    const pool = (lower ? LOWER : "") + (upper ? UPPER : "") + (digits ? DIGITS : "") + (symbols ? SYMBOLS : "");
    if (!pool) return setPwd("");
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    let out = "";
    for (let i = 0; i < length; i++) out += pool[arr[i] % pool.length];
    setPwd(out);
  }, [length, lower, upper, digits, symbols]);

  useEffect(() => { generate(); }, [generate]);

  const strength = Math.min(100, Math.round((length / 32) * 60 + (Number(lower) + Number(upper) + Number(digits) + Number(symbols)) * 10));

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Input value={pwd} readOnly className="font-mono text-sm" />
        <Button onClick={() => { navigator.clipboard.writeText(pwd); toast.success("Copied"); }} disabled={!pwd}>Copy</Button>
        <Button variant="secondary" onClick={generate}>Regenerate</Button>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${strength}%` }} />
      </div>
      <div>
        <div className="mb-2 flex justify-between text-sm"><span>Length</span><span className="font-mono">{length}</span></div>
        <Slider min={6} max={64} step={1} value={[length]} onValueChange={(v) => setLength(v[0])} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={lower} onCheckedChange={(v) => setLower(!!v)} /> Lowercase</label>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={upper} onCheckedChange={(v) => setUpper(!!v)} /> Uppercase</label>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={digits} onCheckedChange={(v) => setDigits(!!v)} /> Digits</label>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={symbols} onCheckedChange={(v) => setSymbols(!!v)} /> Symbols</label>
      </div>
    </div>
  );
}