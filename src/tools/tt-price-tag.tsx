import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TtPriceTag() {
  const [name, setName] = useState("Signature Serum");
  const [orig, setOrig] = useState("$59");
  const [sale, setSale] = useState("$29");
  const [badge, setBadge] = useState("SALE");
  const [color, setColor] = useState("#e11d48");
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Product name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
        <div><Label>Badge</Label><Input value={badge} onChange={(e) => setBadge(e.target.value)} className="mt-1" /></div>
        <div><Label>Original price</Label><Input value={orig} onChange={(e) => setOrig(e.target.value)} className="mt-1" /></div>
        <div><Label>Sale price</Label><Input value={sale} onChange={(e) => setSale(e.target.value)} className="mt-1" /></div>
        <div><Label>Accent color</Label><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10" /></div>
      </div>
      <div className="flex justify-center bg-secondary/40 p-6 rounded-xl">
        <div className="relative w-[300px] rounded-2xl bg-white p-6 shadow-lg text-black">
          <span className="absolute -top-3 left-4 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: color }}>{badge}</span>
          <div className="text-sm text-neutral-500">{name}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black" style={{ color }}>{sale}</span>
            <span className="text-lg text-neutral-400 line-through">{orig}</span>
          </div>
        </div>
      </div>
      <Button variant="outline" onClick={() => window.print()}>Print tag</Button>
    </div>
  );
}