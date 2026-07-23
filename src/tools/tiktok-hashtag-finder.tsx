import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const TRENDING = ["fyp","foryou","viral","tiktokshop","tiktokmademebuyit","trending","tiktokfinds","musthave"];
const BRANDED = ["tiktokpartner","creatorprogram","affiliate","liveshopping"];

function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, ""); }

export default function Tool() {
  const [kw, setKw] = useState("skincare, glow, aesthetic");
  const [count, setCount] = useState(20);

  const groups = useMemo(() => {
    const words = kw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    const niche = words.flatMap((w) => [slug(w), slug(w) + "tok", slug(w) + "review", "best" + slug(w), slug(w) + "haul"]).filter(Boolean);
    const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
    return {
      trending: uniq(TRENDING).slice(0, Math.min(count, 8)),
      niche: uniq(niche).slice(0, count),
      branded: uniq(BRANDED).slice(0, 4),
    };
  }, [kw, count]);

  const all = [...groups.trending, ...groups.niche, ...groups.branded].map((h) => `#${h}`).join(" ");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <div><Label>Keywords (comma separated)</Label><Input value={kw} onChange={(e) => setKw(e.target.value)} className="mt-1"/></div>
        <div><Label>Count</Label><Input type="number" min={5} max={30} value={count} onChange={(e) => setCount(+e.target.value || 10)} className="mt-1"/></div>
      </div>
      <Group name="🔥 Trending" tags={groups.trending}/>
      <Group name="🎯 Niche" tags={groups.niche}/>
      <Group name="🏷️ Branded / Community" tags={groups.branded}/>
      <div className="flex gap-2">
        <Button onClick={() => { navigator.clipboard.writeText(all); toast.success("Copied all"); }}>Copy all hashtags</Button>
      </div>
    </div>
  );
}

function Group({ name, tags }: { name: string; tags: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <h3 className="mb-2 text-sm font-semibold">{name} ({tags.length})</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <button key={t} onClick={() => { navigator.clipboard.writeText(`#${t}`); toast.success("Copied"); }} className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-primary hover:text-primary-foreground">#{t}</button>
        ))}
      </div>
    </div>
  );
}