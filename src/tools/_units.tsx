import { useState, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";

export type UnitDef = { key: string; label: string; toBase: number };

export function formatNum(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e15)) return n.toExponential(6);
  const s = n.toPrecision(12);
  return parseFloat(s).toString();
}

export function CopyBtn({ text }: { text: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        navigator.clipboard.writeText(text);
        toast.success("Copied");
      }}
    >
      <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
    </Button>
  );
}

type Props = {
  units: UnitDef[];
  defaultFrom: string;
  defaultTo: string;
  allowNegative?: boolean;
  formula?: (value: number, from: UnitDef, to: UnitDef, result: number) => ReactNode;
  extras?: (value: number, from: UnitDef, to: UnitDef, result: number) => ReactNode;
  convert?: (value: number, from: UnitDef, to: UnitDef) => number;
  headerRight?: ReactNode;
};

export function LinearConverter({
  units, defaultFrom, defaultTo, allowNegative = false, formula, extras, convert, headerRight,
}: Props) {
  const [value, setValue] = useState<string>("1");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const fromU = units.find((u) => u.key === from) || units[0];
  const toU = units.find((u) => u.key === to) || units[0];

  const num = parseFloat(value);
  const valid = !isNaN(num) && (allowNegative || num >= 0);
  const result = valid
    ? convert
      ? convert(num, fromU, toU)
      : (num * fromU.toBase) / toU.toBase
    : NaN;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="space-y-4">
      {headerRight && <div className="flex justify-end">{headerRight}</div>}
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_1fr] md:items-end">
        <div>
          <Label>Value</Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1"
            min={allowNegative ? undefined : 0}
          />
        </div>
        <div>
          <Label>From</Label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {units.map((u) => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
        <div className="flex md:justify-center">
          <Button variant="ghost" size="icon" onClick={swap} title="Swap units" className="mt-6 md:mt-0">
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

      {!valid && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {allowNegative ? "Enter a valid number." : "Enter a valid non-negative number."}
        </div>
      )}

      {valid && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Result</div>
              <div className="text-3xl font-semibold text-foreground">
                {formatNum(result)} <span className="text-lg font-normal text-muted-foreground">{toU.label}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatNum(num)} {fromU.label} = {formatNum(result)} {toU.label}
              </div>
            </div>
            <CopyBtn text={formatNum(result)} />
          </div>
          {formula && (
            <div className="rounded-md bg-background/60 border border-border px-3 py-2 text-sm font-mono">
              {formula(num, fromU, toU, result)}
            </div>
          )}
          {extras && <div>{extras(num, fromU, toU, result)}</div>}
        </div>
      )}

      <div>
        <div className="text-sm text-muted-foreground mb-2">All units</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((u) => {
            const v = valid ? (convert ? convert(num, fromU, u) : (num * fromU.toBase) / u.toBase) : NaN;
            return (
              <div key={u.key} className="flex justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">{u.label}</span>
                <span className="font-mono">{formatNum(v)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}