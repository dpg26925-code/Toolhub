import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PREFIXES = ["Nova", "Zen", "Peak", "Bright", "Pulse", "Loop", "Nimbus", "Vertex", "Echo", "Arc", "Flux", "Halo", "Orbit", "Sky", "Volt", "Amber", "Iron", "North", "Quill", "Lume"];
const SUFFIXES = ["Labs", "Studio", "Works", "House", "Kit", "Co", "Hub", "Forge", "Bay", "Field", "Foundry", "Craft", "Wave", "Stack", "Base", "Grid"];
const STYLES: Record<string, (kw: string) => string[]> = {
  modern: (kw) => Array.from({ length: 10 }, () => `${pick(PREFIXES)}${kw}`),
  suffix: (kw) => Array.from({ length: 10 }, () => `${kw} ${pick(SUFFIXES)}`),
  portmanteau: (kw) => Array.from({ length: 10 }, () => `${kw.slice(0, 3)}${pick(PREFIXES).slice(0, 4)}`.toLowerCase().replace(/^./, (c) => c.toUpperCase())),
  descriptive: (kw) => Array.from({ length: 10 }, () => `The ${pick(PREFIXES)} ${kw}`),
};
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export default function Tool() {
  const [kw, setKw] = useState("Coffee");
  const [style, setStyle] = useState("modern");
  const [names, setNames] = useState<string[]>([]);
  const gen = () => setNames(STYLES[style](kw));
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Label>Keyword / niche</Label><Input value={kw} onChange={(e) => setKw(e.target.value)} className="mt-1"/></div>
        <div><Label>Style</Label><Select value={style} onValueChange={setStyle}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{Object.keys(STYLES).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <Button onClick={gen} disabled={!kw.trim()}>Generate 10 names</Button>
      {names.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{names.map((n, i) => <div key={i} className="rounded-lg border bg-muted/30 p-3 font-semibold">{n}</div>)}</div>}
    </div>
  );
}