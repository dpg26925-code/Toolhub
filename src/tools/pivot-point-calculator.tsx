import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "./_trading";

type Method = "classic" | "woodie" | "camarilla";

function pivots(h: number, l: number, c: number, o: number, method: Method) {
  if (method === "woodie") {
    const pp = (h + l + 2 * c) / 4;
    return { PP: pp, R1: 2 * pp - l, R2: pp + (h - l), R3: h + 2 * (pp - l), S1: 2 * pp - h, S2: pp - (h - l), S3: l - 2 * (h - pp) };
  }
  if (method === "camarilla") {
    const r = h - l;
    return {
      PP: (h + l + c) / 3,
      R1: c + r * 1.1 / 12, R2: c + r * 1.1 / 6, R3: c + r * 1.1 / 4,
      S1: c - r * 1.1 / 12, S2: c - r * 1.1 / 6, S3: c - r * 1.1 / 4,
    };
  }
  const pp = (h + l + c) / 3;
  return { PP: pp, R1: 2 * pp - l, R2: pp + (h - l), R3: h + 2 * (pp - l), S1: 2 * pp - h, S2: pp - (h - l), S3: l - 2 * (h - pp) };
}

export default function PivotPointCalculator() {
  const [h, setH] = useState(1.105);
  const [l, setL] = useState(1.095);
  const [c, setC] = useState(1.10);
  const [o, setO] = useState(1.098);
  const [method, setMethod] = useState<Method>("classic");

  const r = useMemo(() => pivots(h, l, c, o, method), [h, l, c, o, method]);
  const rows = [["R3", r.R3], ["R2", r.R2], ["R1", r.R1], ["PP", r.PP], ["S1", r.S1], ["S2", r.S2], ["S3", r.S3]] as const;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>High</Label><Input type="number" step="0.00001" value={h} onChange={(e) => setH(+e.target.value)} className="mt-1" /></div>
        <div><Label>Low</Label><Input type="number" step="0.00001" value={l} onChange={(e) => setL(+e.target.value)} className="mt-1" /></div>
        <div><Label>Close</Label><Input type="number" step="0.00001" value={c} onChange={(e) => setC(+e.target.value)} className="mt-1" /></div>
        <div><Label>Open (Woodie)</Label><Input type="number" step="0.00001" value={o} onChange={(e) => setO(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="flex gap-2">
        {(["classic", "woodie", "camarilla"] as const).map((m) => (
          <Button key={m} size="sm" variant={method === m ? "default" : "outline"} onClick={() => setMethod(m)}>{m}</Button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className={`border-b border-border/40 last:border-0 ${k === "PP" ? "font-semibold text-primary" : ""}`}>
                <td className="py-2 font-mono">{k}</td>
                <td className="py-2 text-right font-mono">{fmt(v as number, 5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button size="sm" className="mt-3" onClick={() => { copy(rows.map(([k, v]) => `${k}\t${fmt(v as number, 5)}`).join("\n")); toast.success("Copied"); }}>Copy table</Button>
      </div>
    </div>
  );
}