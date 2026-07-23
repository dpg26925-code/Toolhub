import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Tool() {
  const [brand, setBrand] = useState("Sony");
  const [name, setName] = useState("Wireless Earbuds");
  const [cat, setCat] = useState("Electronics");
  const [feats, setFeats] = useState("Bluetooth 5.3, IPX5, 30h battery");

  const suggestion = useMemo(() => {
    const parts = [brand, name, cat, ...feats.split(",").map((f) => f.trim()).filter(Boolean)];
    let out = parts.filter(Boolean).join(" ").trim();
    if (out.length > 60) out = out.slice(0, 60).replace(/\s+\S*$/, "");
    return out;
  }, [brand, name, cat, feats]);

  const score = useMemo(() => {
    let s = 0;
    if (suggestion.length >= 40 && suggestion.length <= 60) s += 30;
    else if (suggestion.length >= 25) s += 20; else s += 10;
    if (brand && suggestion.startsWith(brand)) s += 20;
    if (name && suggestion.includes(name)) s += 20;
    const kws = feats.split(",").map((f) => f.trim()).filter(Boolean);
    if (kws.length >= 2) s += 20; else if (kws.length === 1) s += 10;
    if (!/[!@#$%^&*()]/.test(suggestion)) s += 10;
    return Math.min(100, s);
  }, [suggestion, brand, name, feats]);

  const grade = score >= 80 ? "Great" : score >= 60 ? "Good" : score >= 40 ? "OK" : "Poor";
  const color = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-blue-500" : score >= 40 ? "text-amber-500" : "text-destructive";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Brand</Label><Input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1"/></div>
        <div><Label>Product name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1"/></div>
        <div><Label>Category / type</Label><Input value={cat} onChange={(e) => setCat(e.target.value)} className="mt-1"/></div>
        <div><Label>Key features (comma)</Label><Input value={feats} onChange={(e) => setFeats(e.target.value)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="text-xs text-muted-foreground">Optimized title ({suggestion.length}/60)</div>
        <div className="mt-1 text-lg font-medium">{suggestion || "—"}</div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }}/></div>
          <div className={`text-sm font-semibold ${color}`}>{score}/100 · {grade}</div>
        </div>
      </div>
      <Button onClick={() => { navigator.clipboard.writeText(suggestion); toast.success("Copied"); }}>Copy title</Button>
    </div>
  );
}