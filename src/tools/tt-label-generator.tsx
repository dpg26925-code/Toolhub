import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TtLabelGenerator() {
  const [title, setTitle] = useState("Product Name");
  const [sku, setSku] = useState("TT-SKN-BLK-M-001");
  const [price, setPrice] = useState("$29.99");
  const [note, setNote] = useState("Handle with care");
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Product title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
        <div><Label>SKU</Label><Input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1" /></div>
        <div><Label>Price</Label><Input value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" /></div>
        <div><Label>Note</Label><Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1" /></div>
      </div>
      <div className="flex justify-center bg-secondary/40 p-6 rounded-xl">
        <div id="tt-label" className="w-[380px] rounded-lg border-2 border-black bg-white p-5 text-black shadow-md">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Shipping label</div>
          <div className="mt-1 text-xl font-bold leading-tight">{title}</div>
          <div className="mt-3 font-mono text-sm">{sku}</div>
          <div className="mt-4 flex items-end justify-between">
            <div><div className="text-xs text-neutral-500">Price</div><div className="text-2xl font-bold">{price}</div></div>
            <div className="max-w-[45%] text-right text-xs text-neutral-600">{note}</div>
          </div>
        </div>
      </div>
      <Button variant="outline" onClick={() => window.print()}>Print label</Button>
    </div>
  );
}