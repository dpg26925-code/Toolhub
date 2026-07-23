import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRIES: Record<string, { code: string; commission: number; tx: number; symbol: string }> = {
  SG: { code: "SG", commission: 5, tx: 2, symbol: "S$" },
  MY: { code: "MY", commission: 6, tx: 2, symbol: "RM" },
  TH: { code: "TH", commission: 5, tx: 3, symbol: "฿" },
  VN: { code: "VN", commission: 4, tx: 2, symbol: "₫" },
  PH: { code: "PH", commission: 6, tx: 2, symbol: "₱" },
  ID: { code: "ID", commission: 6, tx: 2, symbol: "Rp" },
};

export default function Tool() {
  const [price, setPrice] = useState(100);
  const [country, setCountry] = useState("SG");
  const [weight, setWeight] = useState(0.5);
  const [cost, setCost] = useState(30);

  const c = COUNTRIES[country];
  const r = useMemo(() => {
    const commission = price * c.commission / 100;
    const tx = price * c.tx / 100;
    const service = price * 0.01; // service fee
    const settlement = price - commission - tx - service;
    const margin = ((settlement - cost) / price) * 100;
    return { commission, tx, service, settlement, margin };
  }, [price, c, cost]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Demo mode — Shopee fees change frequently. Verify with your seller center.</div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Country</Label>
          <Select value={country} onValueChange={setCountry}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent>{Object.keys(COUNTRIES).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Price ({c.symbol})</Label><Input type="number" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Weight (kg)</Label><Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Cost price</Label><Input type="number" value={cost} onChange={(e) => setCost(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border p-4 space-y-1 text-sm">
        <Row label={`Commission (${c.commission}%)`} value={`${c.symbol}${r.commission.toFixed(2)}`}/>
        <Row label={`Transaction fee (${c.tx}%)`} value={`${c.symbol}${r.tx.toFixed(2)}`}/>
        <Row label="Service fee (1%)" value={`${c.symbol}${r.service.toFixed(2)}`}/>
        <hr className="my-2"/>
        <Row label="Net settlement" value={`${c.symbol}${r.settlement.toFixed(2)}`} bold/>
        <Row label="Profit margin" value={`${r.margin.toFixed(1)}%`} bold/>
      </div>
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-semibold" : "text-muted-foreground"}`}><span>{label}</span><span>{value}</span></div>;
}