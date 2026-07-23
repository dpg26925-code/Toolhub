import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DESTINATIONS, haversine } from "./_travel";

type Mode = "driving" | "walking" | "cycling";

const MODE: Record<Mode, { label: string; kph: number; factor: number }> = {
  driving: { label: "Driving", kph: 80, factor: 1.3 },
  cycling: { label: "Cycling", kph: 18, factor: 1.2 },
  walking: { label: "Walking", kph: 5,  factor: 1.15 },
};

export default function DrivingDistanceCalculator() {
  const [from, setFrom] = useState(DESTINATIONS[8].city);
  const [to, setTo] = useState(DESTINATIONS[10].city);
  const [mode, setMode] = useState<Mode>("driving");
  const [route, setRoute] = useState<"fastest" | "shortest">("fastest");
  const [mpg, setMpg] = useState<number>(30);
  const [fuelPrice, setFuelPrice] = useState<number>(4);

  const a = DESTINATIONS.find((d) => d.city === from) ?? DESTINATIONS[0];
  const b = DESTINATIONS.find((d) => d.city === to) ?? DESTINATIONS[1];

  const r = useMemo(() => {
    const straight = haversine(a.lat, a.lon, b.lat, b.lon);
    const factor = MODE[mode].factor * (route === "shortest" ? 0.95 : 1);
    const km = straight * factor;
    const mi = km * 0.621371;
    const kph = MODE[mode].kph * (route === "fastest" ? 1 : 0.9);
    const hours = km / kph;
    const gallons = mi / mpg;
    const fuelCost = gallons * fuelPrice;
    return { straight, km, mi, hours, gallons, fuelCost };
  }, [a, b, mode, route, mpg, fuelPrice]);

  const fmtHours = (h: number) => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${hh}h ${String(mm).padStart(2, "0")}m`;
  };

  const pad = 2;
  const minLat = Math.min(a.lat, b.lat) - pad;
  const maxLat = Math.max(a.lat, b.lat) + pad;
  const minLon = Math.min(a.lon, b.lon) - pad;
  const maxLon = Math.max(a.lon, b.lon) + pad;
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
  const markerA = `${a.lat},${a.lon}`;
  const markerB = `${b.lat},${b.lon}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${markerA}&marker=${markerB}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Origin</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={from} onChange={(e) => setFrom(e.target.value)}>
            {DESTINATIONS.map((d) => <option key={d.city} value={d.city}>{d.city}, {d.country}</option>)}
          </select>
        </div>
        <div>
          <Label>Destination</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={to} onChange={(e) => setTo(e.target.value)}>
            {DESTINATIONS.map((d) => <option key={d.city} value={d.city}>{d.city}, {d.country}</option>)}
          </select>
        </div>
        <div>
          <Label>Mode</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            {(Object.keys(MODE) as Mode[]).map((m) => <option key={m} value={m}>{MODE[m].label}</option>)}
          </select>
        </div>
        <div>
          <Label>Route</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={route} onChange={(e) => setRoute(e.target.value as "fastest" | "shortest")}>
            <option value="fastest">Fastest</option>
            <option value="shortest">Shortest</option>
          </select>
        </div>
        {mode === "driving" && (
          <>
            <div>
              <Label htmlFor="mpg">Fuel efficiency (mpg)</Label>
              <Input id="mpg" type="number" min={1} value={mpg} onChange={(e) => setMpg(Math.max(1, Number(e.target.value) || 1))} />
            </div>
            <div>
              <Label htmlFor="fp">Fuel price ($ / gallon)</Label>
              <Input id="fp" type="number" min={0} step={0.01} value={fuelPrice} onChange={(e) => setFuelPrice(Math.max(0, Number(e.target.value) || 0))} />
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Distance" value={`${r.km.toFixed(0)} km`} sub={`${r.mi.toFixed(0)} mi`} />
        <Stat label="Estimated time" value={fmtHours(r.hours)} sub={`${MODE[mode].label} · ${route}`} accent />
        {mode === "driving"
          ? <Stat label="Fuel cost" value={`$${r.fuelCost.toFixed(2)}`} sub={`${r.gallons.toFixed(1)} gal`} />
          : <Stat label="Straight-line" value={`${r.straight.toFixed(0)} km`} sub="Great-circle" />}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <iframe
          title="Route preview"
          className="w-full"
          style={{ height: 380, border: 0 }}
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="border-t p-3 text-xs text-muted-foreground">
          Map data © OpenStreetMap contributors · Markers show origin and destination.
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Distances use the great-circle formula plus a road-network factor (driving 1.3×, cycling 1.2×, walking 1.15×). For turn-by-turn directions use a live routing service.</p>
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? "bg-primary/10 border-primary/30" : "bg-background"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}