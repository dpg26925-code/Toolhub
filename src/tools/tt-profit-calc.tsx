import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TtProfitCalc() {
  const [price, setPrice] = useState(29.99);
  const [cost, setCost] = useState(8);
  const [ship, setShip] = useState(3);
  const [fee, setFee] = useState(5); // TikTok Shop % fee
  const [units, setUnits] = useState(100);
  const feeAmt = price * (fee / 100);
  const perUnit = price - cost - ship - feeAmt;
  const margin = price ? (perUnit / price) * 100 : 0;
  const totalProfit = perUnit * units;
  const revenue = price * units;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <F l="Sale price ($)" v={price} on={setPrice} />
        <F l="Product cost ($)" v={cost} on={setCost} />
        <F l="Shipping cost ($)" v={ship} on={setShip} />
        <F l="Platform fee (%)" v={fee} on={setFee} />
        <F l="Units sold" v={units} on={setUnits} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <B l="Profit / unit" v={`$${perUnit.toFixed(2)}`} bad={perUnit < 0} />
        <B l="Margin" v={`${margin.toFixed(1)}%`} bad={margin < 10} />
        <B l="Total revenue" v={`$${revenue.toFixed(2)}`} />
        <B l="Total profit" v={`$${totalProfit.toFixed(2)}`} bad={totalProfit < 0} />
      </div>
    </div>
  );
}
function F({ l, v, on }: { l: string; v: number; on: (n: number) => void }) {
  return <div><Label>{l}</Label><Input type="number" min={0} step="0.01" value={v} onChange={(e) => on(+e.target.value || 0)} className="mt-1" /></div>;
}
function B({ l, v, bad }: { l: string; v: string; bad?: boolean }) {
  return <div className={`rounded-xl border p-4 ${bad ? "border-destructive/50 bg-destructive/5" : "bg-card"}`}><div className="text-xs text-muted-foreground">{l}</div><div className="mt-1 text-2xl font-bold">{v}</div></div>;
}