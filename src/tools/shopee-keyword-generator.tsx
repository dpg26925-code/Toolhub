import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MODIFIERS = ["murah","original","sale","promo","murah banget","terbaru","viral","best seller","import","free ongkir"];

function seed(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; }; }

export default function Tool() {
  const [kw, setKw] = useState("wireless mouse");
  const [longTail, setLongTail] = useState(true);

  const list = useMemo(() => {
    const r = seed(kw + longTail);
    return MODIFIERS.map((m) => ({ kw: longTail ? `${kw} ${m}` : m, vol: Math.round(500 + r() * 15000) }))
      .filter((k) => (longTail ? k.kw.split(" ").length >= 2 : true))
      .sort((a, b) => b.vol - a.vol);
  }, [kw, longTail]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Demo mode — Volumes are estimated. Use Shopee Seller Center → Marketing → Keyword Tool for real data.</div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div><Label>Product / niche</Label><Input value={kw} onChange={(e) => setKw(e.target.value)} className="mt-1"/></div>
        <label className="flex items-end gap-2 text-sm"><input type="checkbox" checked={longTail} onChange={(e) => setLongTail(e.target.checked)}/> Long-tail focus</label>
      </div>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-2 text-left">Keyword</th><th className="p-2 text-right">Volume</th><th className="p-2"/></tr></thead>
          <tbody>{list.map((k, i) => (
            <tr key={i} className="border-t"><td className="p-2 font-mono">{k.kw}</td><td className="p-2 text-right">{k.vol.toLocaleString()}</td>
              <td className="p-2 text-right"><Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(k.kw); toast.success("Copied"); }}>Copy</Button></td></tr>
          ))}</tbody>
        </table>
      </div>
      <Button variant="outline" onClick={() => { navigator.clipboard.writeText(list.map((k) => k.kw).join("\n")); toast.success("All copied"); }}>Copy all</Button>
    </div>
  );
}