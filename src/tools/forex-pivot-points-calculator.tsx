import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [high, setHigh] = useState(1.12);
  const [low, setLow] = useState(1.08);
  const [close, setClose] = useState(1.1);

  const r = useMemo(() => {
    const P = (high + low + close) / 3;
    const R1 = 2 * P - low, S1 = 2 * P - high;
    const R2 = P + (high - low), S2 = P - (high - low);
    const R3 = high + 2 * (P - low), S3 = low - 2 * (high - P);
    return { P, R1, R2, R3, S1, S2, S3 };
  }, [high, low, close]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Previous high</Label><Input type="number" step="0.0001" value={high} onChange={(e) => setHigh(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Previous low</Label><Input type="number" step="0.0001" value={low} onChange={(e) => setLow(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Previous close</Label><Input type="number" step="0.0001" value={close} onChange={(e) => setClose(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border">
        <table className="w-full text-sm"><tbody>
          <Row label="R3" value={r.R3} color="text-emerald-500"/>
          <Row label="R2" value={r.R2} color="text-emerald-500"/>
          <Row label="R1" value={r.R1} color="text-emerald-500"/>
          <Row label="Pivot" value={r.P} bold/>
          <Row label="S1" value={r.S1} color="text-red-500"/>
          <Row label="S2" value={r.S2} color="text-red-500"/>
          <Row label="S3" value={r.S3} color="text-red-500"/>
        </tbody></table>
      </div>
    </div>
  );
}
function Row({ label, value, color, bold }: { label: string; value: number; color?: string; bold?: boolean }) {
  return <tr className="border-t"><td className={`p-2 ${bold ? "font-bold" : ""}`}>{label}</td><td className={`p-2 text-right ${color || ""} ${bold ? "font-bold" : ""}`}>{value.toFixed(4)}</td></tr>;
}