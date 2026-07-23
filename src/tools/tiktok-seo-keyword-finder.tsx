import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MODS = ["review","best","cheap","viral","tutorial","2025","for beginners","dupe","under $20","must have","aesthetic","tiktok made me buy"];
const TAGS = ["fyp","tiktokshop","tiktokmademebuyit","viraltiktok","tiktokfinds","musthave","trending","tiktokviral"];

function seeded(str: string) { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; }; }

export default function Tool() {
  const [niche, setNiche] = useState("wireless earbuds");
  const [longTail, setLongTail] = useState(true);
  const [excludeBroad, setExcludeBroad] = useState(true);

  const kws = useMemo(() => {
    const rand = seeded(niche + longTail + excludeBroad);
    const n = niche.trim().toLowerCase() || "product";
    const out: { kw: string; vol: number; type: "trending" | "related" | "long-tail" }[] = [];
    MODS.forEach((m) => {
      const kw = longTail ? `${m} ${n}` : m;
      if (excludeBroad && kw.split(" ").length < 2) return;
      out.push({ kw, vol: Math.round(2000 + rand() * 40000), type: m.match(/viral|trending|2025|tiktok/) ? "trending" : m.length > 8 ? "long-tail" : "related" });
    });
    TAGS.forEach((t) => out.push({ kw: `#${t}`, vol: Math.round(50000 + rand() * 500000), type: "trending" }));
    return out.sort((a, b) => b.vol - a.vol);
  }, [niche, longTail, excludeBroad]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Demo mode — Volumes are simulated estimates. Use TikTok Creative Center or Ads Manager for real numbers.</div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Label>Product / niche</Label><Input value={niche} onChange={(e) => setNiche(e.target.value)} className="mt-1"/></div>
        <div className="flex flex-col justify-end gap-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={longTail} onChange={(e) => setLongTail(e.target.checked)}/> Long-tail focus</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={excludeBroad} onChange={(e) => setExcludeBroad(e.target.checked)}/> Exclude broad terms</label>
        </div>
      </div>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-2 text-left">Keyword</th><th className="p-2 text-left">Type</th><th className="p-2 text-right">Est. Volume</th><th className="p-2"/></tr></thead>
          <tbody>
            {kws.map((k, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 font-mono">{k.kw}</td>
                <td className="p-2 capitalize text-muted-foreground">{k.type}</td>
                <td className="p-2 text-right">{k.vol.toLocaleString()}</td>
                <td className="p-2"><Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(k.kw); toast.success("Copied"); }}>Copy</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" onClick={() => { navigator.clipboard.writeText(kws.map((k) => k.kw).join("\n")); toast.success("All keywords copied"); }}>Copy all</Button>
    </div>
  );
}