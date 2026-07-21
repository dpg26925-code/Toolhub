import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight } from "lucide-react";
import { CopyBtn, formatNum } from "./_units";

type Mode = "decimal" | "binary";

function unitsFor(mode: Mode) {
  const base = mode === "decimal" ? 1000 : 1024;
  const suf = mode === "decimal" ? ["B", "KB", "MB", "GB", "TB", "PB"] : ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
  const arr: { key: string; label: string; toBits: number }[] = [
    { key: "bit", label: "bit", toBits: 1 },
  ];
  for (let i = 0; i < suf.length; i++) {
    arr.push({ key: suf[i], label: suf[i], toBits: 8 * Math.pow(base, i) });
  }
  return arr;
}

function realWorld(bytes: number): string {
  if (bytes <= 0) return "empty";
  const kb = bytes / 1000;
  const mb = kb / 1000;
  const gb = mb / 1000;
  const tb = gb / 1000;
  if (bytes < 1000) return `${Math.round(bytes)} bytes — a short text message`;
  if (kb < 500) return `about ${Math.round(kb)} KB — a plain-text article`;
  if (mb < 4) return `about ${mb.toFixed(1)} MB — a hi-res photo`;
  if (mb < 50) return `about ${(mb / 4).toFixed(0)} photos or a short MP3`;
  if (mb < 700) return `about ${Math.round(mb / 4)} photos or ${(mb / 5).toFixed(0)} min of MP3 audio`;
  if (gb < 5) return `about ${(gb / 0.7).toFixed(1)} CDs or a single-layer DVD`;
  if (gb < 50) return `about ${(gb / 4.7).toFixed(1)} DVDs or ~${Math.round(gb * 60)} min of 1080p video`;
  if (gb < 1000) return `about ${(gb / 25).toFixed(1)} Blu-ray discs or ${Math.round(gb / 5)} HD movies`;
  if (tb < 10) return `about ${tb.toFixed(2)} TB — a large SSD`;
  return `about ${tb.toFixed(1)} TB — a data-center scale volume`;
}

export default function DataStorageConverter() {
  const [mode, setMode] = useState<Mode>("decimal");
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState("GB");
  const [to, setTo] = useState("MB");

  const units = useMemo(() => unitsFor(mode), [mode]);
  const fromU = units.find((u) => u.key === from) || units[0];
  const toU = units.find((u) => u.key === to) || units[0];
  const num = parseFloat(value);
  const valid = !isNaN(num) && num >= 0;
  const bits = valid ? num * fromU.toBits : NaN;
  const result = valid ? bits / toU.toBits : NaN;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">Prefix mode:</div>
        <Button size="sm" variant={mode === "decimal" ? "default" : "outline"} onClick={() => { setMode("decimal"); setFrom("GB"); setTo("MB"); }}>Decimal (KB = 1000 B)</Button>
        <Button size="sm" variant={mode === "binary" ? "default" : "outline"} onClick={() => { setMode("binary"); setFrom("GiB"); setTo("MiB"); }}>Binary (KiB = 1024 B)</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_1fr] md:items-end">
        <div>
          <Label>Value</Label>
          <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>From</Label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {units.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
        <div className="flex md:justify-center">
          <Button variant="ghost" size="icon" className="mt-6 md:mt-0" onClick={() => { setFrom(to); setTo(from); }}>
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <Label>To</Label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {units.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
      </div>

      {!valid && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">Enter a valid non-negative number.</div>}

      {valid && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Result</div>
              <div className="text-3xl font-semibold">{formatNum(result)} <span className="text-lg font-normal text-muted-foreground">{toU.label}</span></div>
              <div className="text-sm text-muted-foreground mt-1">{formatNum(num)} {fromU.label} = {formatNum(result)} {toU.label}</div>
            </div>
            <CopyBtn text={formatNum(result)} />
          </div>
          <div className="rounded-md bg-background/60 border border-border px-3 py-2 text-sm font-mono">
            1 {fromU.label} = {formatNum(fromU.toBits / toU.toBits)} {toU.label} (base = {mode === "decimal" ? "1000" : "1024"})
          </div>
          <div className="text-sm text-muted-foreground">Real-world: <span className="text-foreground font-medium">{realWorld(bits / 8)}</span></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((u) => (
              <div key={u.key} className="flex justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">{u.label}</span>
                <span className="font-mono">{formatNum(bits / u.toBits)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}