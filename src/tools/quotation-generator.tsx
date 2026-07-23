import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildBusinessDoc, downloadPdf, DocItem } from "@/lib/_pdf-doc";
import { toast } from "sonner";

export default function Tool() {
  const [fromName, setFromName] = useState("Your Company Ltd.");
  const [fromAddr, setFromAddr] = useState("123 Main St, City, Country");
  const [fromEmail, setFromEmail] = useState("sales@yourco.com");
  const [toName, setToName] = useState("Client Inc.");
  const [toAddr, setToAddr] = useState("456 Client Ave.");
  const [ref, setRef] = useState(`QUO-${Date.now().toString().slice(-6)}`);
  const [validity, setValidity] = useState("30 days");
  const [tax, setTax] = useState(10);
  const [notes, setNotes] = useState("Delivery within 15 days after PO confirmation.");
  const [items, setItems] = useState<DocItem[]>([{ description: "Consulting services", qty: 10, price: 100 }, { description: "Setup fee", qty: 1, price: 500 }]);
  const [busy, setBusy] = useState(false);

  const upd = (i: number, k: keyof DocItem, v: string | number) => setItems((r) => r.map((x, j) => j === i ? { ...x, [k]: k === "description" ? String(v) : +v || 0 } : x));
  const add = () => setItems((r) => [...r, { description: "", qty: 1, price: 0 }]);
  const del = (i: number) => setItems((r) => r.filter((_, j) => j !== i));

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const grand = total * (1 + tax / 100);

  const generate = async () => {
    setBusy(true);
    try {
      const bytes = await buildBusinessDoc({
        title: "Quotation", ref: `#${ref}`, date: new Date().toLocaleDateString(), validity,
        from: { name: fromName, address: fromAddr, email: fromEmail }, to: { name: toName, address: toAddr },
        items, taxRate: tax, notes,
      });
      downloadPdf(bytes, `quotation-${ref}.pdf`); toast.success("PDF generated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <fieldset className="rounded-lg border p-3 space-y-2"><legend className="px-1 text-sm font-semibold">From</legend>
          <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Company name"/>
          <Input value={fromAddr} onChange={(e) => setFromAddr(e.target.value)} placeholder="Address"/>
          <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="Email"/>
        </fieldset>
        <fieldset className="rounded-lg border p-3 space-y-2"><legend className="px-1 text-sm font-semibold">To</legend>
          <Input value={toName} onChange={(e) => setToName(e.target.value)} placeholder="Client name"/>
          <Input value={toAddr} onChange={(e) => setToAddr(e.target.value)} placeholder="Address"/>
        </fieldset>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Reference</Label><Input value={ref} onChange={(e) => setRef(e.target.value)} className="mt-1"/></div>
        <div><Label>Validity</Label><Input value={validity} onChange={(e) => setValidity(e.target.value)} className="mt-1"/></div>
        <div><Label>Tax (%)</Label><Input type="number" value={tax} onChange={(e) => setTax(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm font-semibold">Line items</div>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_100px_40px] gap-2">
            <Input value={it.description} onChange={(e) => upd(i, "description", e.target.value)} placeholder="Description"/>
            <Input type="number" value={it.qty} onChange={(e) => upd(i, "qty", e.target.value)} placeholder="Qty"/>
            <Input type="number" step="0.01" value={it.price} onChange={(e) => upd(i, "price", e.target.value)} placeholder="Price"/>
            <Button size="sm" variant="ghost" onClick={() => del(i)}>✕</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={add}>+ Add line</Button>
      </div>
      <div><Label>Notes</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1"/></div>
      <div className="rounded-lg border bg-muted/30 p-3 text-sm">Subtotal ${total.toFixed(2)} + tax ${((grand - total)).toFixed(2)} = <strong>${grand.toFixed(2)}</strong></div>
      <Button onClick={generate} disabled={busy}>{busy ? "Generating…" : "Generate PDF"}</Button>
    </div>
  );
}