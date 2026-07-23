import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.272, 1.618, 2.618];

export default function Tool() {
  const [dir, setDir] = useState<"up" | "down">("up");
  const [high, setHigh] = useState(1.15);
  const [low, setLow] = useState(1.05);
  const rows = useMemo(() => LEVELS.map((f) => ({ f, price: dir === "up" ? high - (high - low) * f : low + (high - low) * f })), [dir, high, low]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Trend</Label><Select value={dir} onValueChange={(v) => setDir(v as typeof dir)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="up">Uptrend (retrace from high)</SelectItem><SelectItem value="down">Downtrend (retrace from low)</SelectItem></SelectContent></Select></div>
        <div><Label>High</Label><Input type="number" step="0.0001" value={high} onChange={(e) => setHigh(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Low</Label><Input type="number" step="0.0001" value={low} onChange={(e) => setLow(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border">
        <table className="w-full text-sm"><thead className="bg-muted"><tr><th className="p-2 text-left">Level</th><th className="p-2 text-right">Price</th></tr></thead>
          <tbody>{rows.map((r) => {
            const key = r.f === 0.618 || r.f === 0.5;
            return <tr key={r.f} className={`border-t ${key ? "bg-primary/5 font-semibold" : ""}`}><td className="p-2">{(r.f * 100).toFixed(1)}%</td><td className="p-2 text-right">{r.price.toFixed(4)}</td></tr>;
          })}</tbody></table>
      </div>
    </div>
  );
}