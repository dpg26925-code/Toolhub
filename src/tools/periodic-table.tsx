import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ELEMENTS, CATEGORY_COLORS } from "./_science";

export default function PeriodicTable() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<number | null>(1);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return new Set<number>();
    return new Set(ELEMENTS.filter(e => e.name.toLowerCase().includes(s) || e.s.toLowerCase() === s || String(e.n) === s).map(e => e.n));
  }, [q]);
  const el = ELEMENTS.find(e => e.n === selected);

  return (
    <div className="space-y-6">
      <Input placeholder="Search by name, symbol, or atomic number..." value={q} onChange={e => setQ(e.target.value)} />
      <div className="overflow-x-auto">
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: "repeat(18, minmax(48px, 1fr))" }}>
          {ELEMENTS.map(e => (
            <button key={e.n} onClick={() => setSelected(e.n)}
              className={`aspect-square rounded p-1 text-xs text-white transition ${filtered.size && !filtered.has(e.n) ? "opacity-30" : ""} ${selected === e.n ? "ring-2 ring-primary" : ""}`}
              style={{ gridColumn: e.group, gridRow: e.period, background: CATEGORY_COLORS[e.category] || "#64748b" }}>
              <div className="text-[10px] opacity-80">{e.n}</div>
              <div className="font-bold">{e.s}</div>
            </button>
          ))}
        </div>
      </div>
      {el && (
        <div className="rounded-lg border p-6" style={{ borderColor: CATEGORY_COLORS[el.category] }}>
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded text-white" style={{ background: CATEGORY_COLORS[el.category] }}>
              <div className="text-xs">{el.n}</div>
              <div className="text-3xl font-bold">{el.s}</div>
              <div className="text-xs">{el.mass.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{el.name}</div>
              <div className="text-sm text-muted-foreground capitalize">{el.category} · {el.state}</div>
              <div className="mt-1 text-xs font-mono">{el.config}</div>
              <div className="mt-1 text-xs text-muted-foreground">Group {el.group} · Period {el.period}</div>
            </div>
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Showing common elements. For educational purposes only.</p>
    </div>
  );
}
