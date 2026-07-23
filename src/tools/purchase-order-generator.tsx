import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildBusinessDoc, downloadPdf, DocItem } from "@/lib/_pdf-doc";
import { toast } from "sonner";

export default function Tool() {
  const [buyer, setBuyer] = useState("Your Company Ltd.");
  const [buyerAddr, setBuyerAddr] = useState("123 Main St");
  const [seller, setSeller] = useState("Supplier Co.");
  const [sellerAddr, setSellerAddr] = useState("456 Factory Rd");
  const [poNum, setPoNum] = useState(`PO-${Date.now().toString().slice(-6)}`);
  const [delivery, setDelivery] = useState("2026-09-30");
  const [terms, setTerms] = useState("Net 30 days. Delivery FOB. Quality inspection before shipment.");
  const [items, setItems] = useState<DocItem[]>([{ description: "Widget A - SKU 001", qty: 500, price: 4.5 }]);
  const [busy, setBusy] = useState(false);

  const upd = (i: number, k: keyof DocItem, v: string | number) => setItems((r) => r.map((x, j) => j === i ? { ...x, [k]: k === "description" ? String(v) : +v || 0 } : x));
  const add = () => setItems((r) => [...r, { description: "", qty: 1, price: 0 }]);
  const del = (i: number) => setItems((r) => r.filter((_, j) => j !== i));

  const generate = async () => {
    setBusy(true);
    try {
      const bytes = await buildBusinessDoc({
        title: "Purchase Order", ref: `#${poNum}`, date: new Date().toLocaleDateString(),
        from: { name: buyer, address: buyerAddr }, to: { name: seller, address: sellerAddr },
        items, notes: `Delivery date: ${delivery}`, terms,
      });
      downloadPdf(bytes, `${poNum}.pdf`); toast.success("PDF generated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <fieldset className="rounded-lg border p-3 space-y-2"><legend className="px-1 text-sm font-semibold">Buyer</legend>
          <Input value={buyer} onChange={(e) => setBuyer(e.target.value)}/>
          <Input value={buyerAddr} onChange={(e) => setBuyerAddr(e.target.value)}/>
        </fieldset>
        <fieldset className="rounded-lg border p-3 space-y-2"><legend className="px-1 text-sm font-semibold">Seller</legend>
          <Input value={seller} onChange={(e) => setSeller(e.target.value)}/>
          <Input value={sellerAddr} onChange={(e) => setSellerAddr(e.target.value)}/>
        </fieldset>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>PO Number</Label><Input value={poNum} onChange={(e) => setPoNum(e.target.value)} className="mt-1"/></div>
        <div><Label>Delivery date</Label><Input type="date" value={delivery} onChange={(e) => setDelivery(e.target.value)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm font-semibold">Items</div>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_100px_40px] gap-2">
            <Input value={it.description} onChange={(e) => upd(i, "description", e.target.value)}/>
            <Input type="number" value={it.qty} onChange={(e) => upd(i, "qty", e.target.value)}/>
            <Input type="number" step="0.01" value={it.price} onChange={(e) => upd(i, "price", e.target.value)}/>
            <Button size="sm" variant="ghost" onClick={() => del(i)}>✕</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={add}>+ Add item</Button>
      </div>
      <div><Label>Terms</Label><Textarea rows={3} value={terms} onChange={(e) => setTerms(e.target.value)} className="mt-1"/></div>
      <Button onClick={generate} disabled={busy}>{busy ? "Generating…" : "Generate PO PDF"}</Button>
    </div>
  );
}