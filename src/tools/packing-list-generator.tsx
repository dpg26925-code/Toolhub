import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type DestType = "beach" | "city" | "hiking" | "business" | "ski";
type Season = "summer" | "shoulder" | "winter";

type Item = { label: string; qty?: (days: number, pax: number) => number };
type Section = { name: string; items: Item[] };

const BASE: Section[] = [
  { name: "Documents", items: [
    { label: "Passport / ID" },
    { label: "Printed itinerary & bookings" },
    { label: "Travel insurance card" },
    { label: "Emergency contacts" },
    { label: "Driver's license (if renting)" },
  ]},
  { name: "Electronics", items: [
    { label: "Phone + charger" },
    { label: "Power bank" },
    { label: "Universal adapter" },
    { label: "Headphones" },
  ]},
  { name: "Toiletries", items: [
    { label: "Toothbrush & toothpaste" },
    { label: "Deodorant" },
    { label: "Shampoo (travel size)" },
    { label: "Sunscreen SPF 30+" },
  ]},
  { name: "Medications", items: [
    { label: "Prescription meds + copies" },
    { label: "Pain relievers" },
    { label: "Band-aids & antiseptic" },
    { label: "Motion sickness tablets" },
  ]},
  { name: "Clothing", items: [
    { label: "Underwear", qty: (d) => Math.min(d + 1, 10) },
    { label: "Socks", qty: (d) => Math.min(d + 1, 10) },
    { label: "T-shirts", qty: (d) => Math.min(Math.ceil(d / 2) + 1, 8) },
    { label: "Pants / shorts", qty: (d) => Math.min(Math.ceil(d / 3) + 1, 5) },
    { label: "Sleepwear" },
  ]},
];

const EXTRAS: Record<DestType, Section[]> = {
  beach: [{ name: "Beach", items: [
    { label: "Swimsuit" }, { label: "Beach towel" }, { label: "Flip-flops" },
    { label: "Sun hat" }, { label: "Sunglasses" }, { label: "After-sun lotion" },
    { label: "Dry bag" },
  ]}],
  city: [{ name: "City", items: [
    { label: "Comfortable walking shoes" }, { label: "Day backpack" },
    { label: "Foldable umbrella" }, { label: "One smart outfit" },
  ]}],
  hiking: [{ name: "Hiking", items: [
    { label: "Hiking boots" }, { label: "Trail map / offline GPS" },
    { label: "Water bottle 1L+" }, { label: "Trail snacks" },
    { label: "Rain jacket" }, { label: "Headlamp" }, { label: "First-aid kit" },
  ]}],
  business: [{ name: "Business", items: [
    { label: "Business attire", qty: (d) => Math.min(d, 5) },
    { label: "Dress shoes" }, { label: "Laptop + charger" },
    { label: "Notebook & pen" }, { label: "Business cards" },
  ]}],
  ski: [{ name: "Ski / snow", items: [
    { label: "Ski jacket & pants" }, { label: "Thermal base layers" },
    { label: "Ski gloves" }, { label: "Ski goggles" },
    { label: "Wool socks", qty: (d) => Math.min(d + 1, 8) },
    { label: "Balaclava / neck warmer" },
  ]}],
};

const SEASON_EXTRAS: Record<Season, Item[]> = {
  summer: [{ label: "Insect repellent" }, { label: "Cooling towel" }],
  shoulder: [{ label: "Light jacket" }, { label: "Layering shirt" }],
  winter: [{ label: "Warm coat" }, { label: "Beanie" }, { label: "Warm gloves" }, { label: "Scarf" }],
};

const STORAGE_KEY = "nexatools_packing_list_v1";

export default function PackingListGenerator() {
  const [destType, setDestType] = useState<DestType>("city");
  const [season, setSeason] = useState<Season>("summer");
  const [days, setDays] = useState(7);
  const [pax, setPax] = useState(1);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const sections = useMemo<Section[]>(() => {
    const seasonal: Section[] = SEASON_EXTRAS[season].length ? [{ name: "Season", items: SEASON_EXTRAS[season] }] : [];
    return [...BASE, ...seasonal, ...EXTRAS[destType]];
  }, [destType, season]);

  const allItems = useMemo(
    () => sections.flatMap((s) => s.items.map((i) => ({ ...i, section: s.name, id: `${s.name}::${i.label}` }))),
    [sections],
  );

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setChecked(JSON.parse(raw)); } catch { /* empty */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); } catch { /* empty */ }
  }, [checked]);

  const total = allItems.length;
  const doneCount = allItems.filter((i) => checked[i.id]).length;
  const pct = total > 0 ? (doneCount / total) * 100 : 0;

  const exportText = () => {
    const txt = sections.map((s) => {
      const rows = s.items.map((i) => {
        const id = `${s.name}::${i.label}`;
        const mark = checked[id] ? "[x]" : "[ ]";
        const qty = i.qty ? ` ×${i.qty(days, pax)}` : "";
        return `  ${mark} ${i.label}${qty}`;
      }).join("\n");
      return `${s.name}\n${rows}`;
    }).join("\n\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `packing-list-${destType}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Destination type</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={destType} onChange={(e) => setDestType(e.target.value as DestType)}>
            <option value="beach">Beach</option><option value="city">City</option>
            <option value="hiking">Hiking</option><option value="business">Business</option>
            <option value="ski">Ski / snow</option>
          </select>
        </div>
        <div>
          <Label>Season</Label>
          <select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={season} onChange={(e) => setSeason(e.target.value as Season)}>
            <option value="summer">Summer</option><option value="shoulder">Spring / Autumn</option><option value="winter">Winter</option>
          </select>
        </div>
        <div>
          <Label htmlFor="days">Days</Label>
          <Input id="days" type="number" min={1} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <div>
          <Label htmlFor="pax">Travelers</Label>
          <Input id="pax" type="number" min={1} value={pax} onChange={(e) => setPax(Math.max(1, Number(e.target.value) || 1))} />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span><span className="font-semibold">{doneCount}/{total}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <div key={s.name} className="rounded-xl border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold">{s.name}</h3>
            <ul className="space-y-1.5">
              {s.items.map((i) => {
                const id = `${s.name}::${i.label}`;
                const q = i.qty ? i.qty(days, pax) : null;
                const on = !!checked[id];
                return (
                  <li key={id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary/50">
                      <input type="checkbox" checked={on} onChange={(e) => setChecked((c) => ({ ...c, [id]: e.target.checked }))} />
                      <span className={`text-sm ${on ? "text-muted-foreground line-through" : ""}`}>{i.label}{q ? ` ×${q}` : ""}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={exportText}>Download .txt</Button>
        <Button variant="outline" onClick={() => setChecked({})}>Reset checks</Button>
      </div>
      <p className="text-xs text-muted-foreground">Your checklist saves automatically to this browser.</p>
    </div>
  );
}