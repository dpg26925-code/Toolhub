import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CURRENCIES } from "./_travel";

const COUNTRY_TIP: { country: string; pct: number; note: string }[] = [
  { country: "United States", pct: 20, note: "Tipping expected in restaurants, bars, taxis." },
  { country: "Canada",        pct: 18, note: "15–20% standard at sit-down restaurants." },
  { country: "United Kingdom",pct: 12, note: "10–15% if service isn't already added." },
  { country: "France",        pct: 5,  note: "Service compris — round up or leave small change." },
  { country: "Germany",       pct: 10, note: "Round up or add 5–10%." },
  { country: "Italy",         pct: 10, note: "Coperto usually covers service; small tip appreciated." },
  { country: "Spain",         pct: 10, note: "Not mandatory. Round up for good service." },
  { country: "Japan",         pct: 0,  note: "Tipping is not customary and can offend." },
  { country: "South Korea",   pct: 0,  note: "Tipping is not expected." },
  { country: "China",         pct: 0,  note: "Tipping is not customary outside tourist hotels." },
  { country: "Thailand",      pct: 10, note: "Round up in restaurants; small notes for staff." },
  { country: "Vietnam",       pct: 5,  note: "Small tips appreciated in tourist areas." },
  { country: "Indonesia",     pct: 10, note: "Check for service charge on the bill." },
  { country: "UAE",           pct: 15, note: "10–15% expected in restaurants." },
  { country: "Australia",     pct: 10, note: "Optional. Round up for good service." },
  { country: "Mexico",        pct: 12, note: "10–15% standard in restaurants." },
  { country: "Brazil",        pct: 10, note: "Usually included as 10% service on the bill." },
  { country: "India",         pct: 10, note: "10% at mid- and upscale restaurants." },
];

const CURRENCY_CODES = Object.keys(CURRENCIES).sort();

export default function TipCalculatorTravel() {
  const [bill, setBill] = useState<number>(50);
  const [tipPct, setTipPct] = useState<number>(15);
  const [people, setPeople] = useState<number>(2);
  const [currency, setCurrency] = useState("USD");
  const [round, setRound] = useState<"none" | "up" | "nearest">("nearest");

  const r = useMemo(() => {
    const tip = bill * (tipPct / 100);
    const total = bill + tip;
    let perPerson = total / Math.max(1, people);
    if (round === "up") perPerson = Math.ceil(perPerson);
    else if (round === "nearest") perPerson = Math.round(perPerson * 100) / 100;
    const finalTotal = round === "up" ? perPerson * people : total;
    const finalTip = finalTotal - bill;
    return { tip: finalTip, total: finalTotal, perPerson };
  }, [bill, tipPct, people, round]);

  const sym = CURRENCIES[currency]?.symbol ?? "$";
  const fmt = (n: number) => `${sym}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bill">Bill amount</Label>
          <Input id="bill" type="number" min={0} step={0.01} value={bill} onChange={(e) => setBill(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div>
          <Label htmlFor="tip">Tip %</Label>
          <Input id="tip" type="number" min={0} max={100} value={tipPct} onChange={(e) => setTipPct(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div>
          <Label htmlFor="pax">People to split</Label>
          <Input id="pax" type="number" min={1} value={people} onChange={(e) => setPeople(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <div>
          <Label>Currency</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label>Quick tip presets by country</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {COUNTRY_TIP.map((c) => (
            <button key={c.country} type="button" onClick={() => setTipPct(c.pct)} title={c.note}
              className={`rounded-full border px-3 py-1 text-xs transition ${tipPct === c.pct ? "border-primary bg-primary/10" : "hover:bg-secondary"}`}>
              {c.country} · {c.pct}%
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Rounding</Label>
        <div className="mt-2 flex gap-2 text-sm">
          {(["none","nearest","up"] as const).map((r) => (
            <button key={r} type="button" onClick={() => setRound(r)}
              className={`rounded-md border px-3 py-1.5 ${round === r ? "border-primary bg-primary/10" : "hover:bg-secondary"}`}>
              {r === "none" ? "Exact" : r === "nearest" ? "Round cents" : "Round up per person"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Tip" value={fmt(r.tip)} />
        <Stat label="Total bill" value={fmt(r.total)} accent />
        <Stat label={`Per person (÷${people})`} value={fmt(r.perPerson)} />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? "bg-primary/10 border-primary/30" : "bg-background"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}