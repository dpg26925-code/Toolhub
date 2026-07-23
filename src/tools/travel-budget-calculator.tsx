import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DESTINATIONS } from "./_travel";

type Tier = "budget" | "mid" | "luxury";
type Transport = "walking" | "public" | "rideshare" | "rental";

const TRANSPORT_COST: Record<Transport, { label: string; usdPerDay: number }> = {
  walking:   { label: "Walking / free",       usdPerDay: 0 },
  public:    { label: "Public transit",       usdPerDay: 8 },
  rideshare: { label: "Rideshare / taxi",     usdPerDay: 25 },
  rental:    { label: "Rental car",           usdPerDay: 60 },
};

const TIER_LABEL: Record<Tier, string> = { budget: "Budget hostel", mid: "Mid-range hotel", luxury: "Luxury resort" };

const SAVING_TIPS = [
  "Book flights 6–8 weeks out and fly midweek for the cheapest fares.",
  "Stay 4+ nights to unlock weekly discounts on Airbnb and hotels.",
  "Eat where locals eat — street food is often the safest budget option.",
  "Buy a local SIM or eSIM instead of paying roaming fees.",
  "Use free walking tours on day 1 to get your bearings.",
  "Withdraw cash from bank ATMs — avoid airport currency exchange booths.",
];

export default function TravelBudgetCalculator() {
  const [destSlug, setDestSlug] = useState(DESTINATIONS[0].city);
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(2);
  const [tier, setTier] = useState<Tier>("mid");
  const [transport, setTransport] = useState<Transport>("public");
  const [foodPerDay, setFoodPerDay] = useState<number | null>(null);

  const dest = DESTINATIONS.find((d) => d.city === destSlug) ?? DESTINATIONS[0];

  const result = useMemo(() => {
    const baseDaily = dest[tier];
    const stayShare = baseDaily * 0.5;
    const foodShare = foodPerDay ?? baseDaily * 0.3;
    const activityShare = baseDaily * 0.2;
    const transportShare = TRANSPORT_COST[transport].usdPerDay;
    const dailyPerPerson = stayShare + foodShare + activityShare + transportShare;
    const perPerson = dailyPerPerson * days;
    const total = perPerson * travelers;
    return {
      total,
      perPerson,
      dailyPerPerson,
      breakdown: [
        { label: "Accommodation", value: stayShare * days * travelers },
        { label: "Food & drinks", value: foodShare * days * travelers },
        { label: "Local transport", value: transportShare * days * travelers },
        { label: "Activities & entry fees", value: activityShare * days * travelers },
      ],
    };
  }, [dest, tier, transport, days, travelers, foodPerDay]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Destination</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={destSlug} onChange={(e) => setDestSlug(e.target.value)}>
            {DESTINATIONS.map((d) => (
              <option key={d.city} value={d.city}>{d.city}, {d.country}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Accommodation</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
            {(Object.keys(TIER_LABEL) as Tier[]).map((k) => (
              <option key={k} value={k}>{TIER_LABEL[k]}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="days">Trip duration (days)</Label>
          <Input id="days" type="number" min={1} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <div>
          <Label htmlFor="pax">Travelers</Label>
          <Input id="pax" type="number" min={1} value={travelers} onChange={(e) => setTravelers(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <div>
          <Label>Local transport</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={transport} onChange={(e) => setTransport(e.target.value as Transport)}>
            {(Object.keys(TRANSPORT_COST) as Transport[]).map((k) => (
              <option key={k} value={k}>{TRANSPORT_COST[k].label} · ${TRANSPORT_COST[k].usdPerDay}/day</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="food">Daily food budget per person (USD, optional)</Label>
          <Input id="food" type="number" min={0} placeholder={`auto (~$${Math.round(dest[tier] * 0.3)})`} value={foodPerDay ?? ""} onChange={(e) => setFoodPerDay(e.target.value === "" ? null : Number(e.target.value))} />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total trip cost" value={`$${Math.round(result.total).toLocaleString()}`} accent />
          <Stat label="Per person" value={`$${Math.round(result.perPerson).toLocaleString()}`} />
          <Stat label="Daily / person" value={`$${Math.round(result.dailyPerPerson).toLocaleString()}`} />
        </div>
        <div className="mt-6 space-y-2">
          {result.breakdown.map((row) => {
            const pct = result.total > 0 ? (row.value / result.total) * 100 : 0;
            return (
              <div key={row.label}>
                <div className="flex justify-between text-sm">
                  <span>{row.label}</span>
                  <span className="text-muted-foreground">${Math.round(row.value).toLocaleString()} · {pct.toFixed(0)}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-secondary/40 p-6">
        <h3 className="text-sm font-semibold">Money-saving tips</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {SAVING_TIPS.map((t) => <li key={t} className="flex gap-2"><span className="text-primary">•</span>{t}</li>)}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">Costs are averages sourced from public travel data. Actual prices vary by season, availability and personal choices. All calculations run in your browser.</p>

      <div className="hidden">
        <Button>hidden</Button>
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