import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Item = { desc: string; qty: number; price: number };

export default function InvoiceGenerator() {
  const [biz, setBiz] = useState({ name: "Your Company", address: "123 Main St\nCity, Country", email: "hello@company.com" });
  const [client, setClient] = useState({ name: "Client Name", address: "Client Address" });
  const [num, setNum] = useState("INV-0001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [due, setDue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tax, setTax] = useState(0);
  const [disc, setDisc] = useState(0);
  const [notes, setNotes] = useState("Thank you for your business.");
  const [items, setItems] = useState<Item[]>([{ desc: "Consulting service", qty: 10, price: 100 }]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const discAmt = (subtotal * disc) / 100;
  const taxable = subtotal - discAmt;
  const taxAmt = (taxable * tax) / 100;
  const total = taxable + taxAmt;

  const setItem = (i: number, p: Partial<Item>) => setItems(items.map((it, k) => k === i ? { ...it, ...p } : it));

  async function generate() {
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    let y = 800;
    page.drawText("INVOICE", { x: 40, y, size: 28, font: bold, color: rgb(0.1, 0.15, 0.35) });
    page.drawText(`# ${num}`, { x: 450, y: y + 5, size: 12, font });
    y -= 40;
    biz.name.split("\n").forEach((l) => { page.drawText(l, { x: 40, y, size: 12, font: bold }); y -= 15; });
    biz.address.split("\n").forEach((l) => { page.drawText(l, { x: 40, y, size: 10, font }); y -= 12; });
    page.drawText(biz.email, { x: 40, y, size: 10, font }); y -= 25;

    page.drawText("Bill To:", { x: 40, y, size: 10, font: bold }); y -= 14;
    page.drawText(client.name, { x: 40, y, size: 11, font }); y -= 13;
    client.address.split("\n").forEach((l) => { page.drawText(l, { x: 40, y, size: 10, font }); y -= 12; });

    page.drawText(`Date: ${date}`, { x: 400, y: 665, size: 10, font });
    if (due) page.drawText(`Due: ${due}`, { x: 400, y: 650, size: 10, font });

    y = 600;
    page.drawRectangle({ x: 40, y: y - 4, width: 515, height: 20, color: rgb(0.94, 0.95, 0.98) });
    page.drawText("Description", { x: 45, y, size: 10, font: bold });
    page.drawText("Qty", { x: 340, y, size: 10, font: bold });
    page.drawText("Price", { x: 400, y, size: 10, font: bold });
    page.drawText("Amount", { x: 490, y, size: 10, font: bold });
    y -= 22;
    for (const it of items) {
      page.drawText(it.desc.slice(0, 45), { x: 45, y, size: 10, font });
      page.drawText(`${it.qty}`, { x: 340, y, size: 10, font });
      page.drawText(`${currency} ${it.price.toFixed(2)}`, { x: 400, y, size: 10, font });
      page.drawText(`${currency} ${(it.qty * it.price).toFixed(2)}`, { x: 490, y, size: 10, font });
      y -= 18;
    }
    y -= 10;
    const line = (label: string, val: number, b = false) => {
      const f = b ? bold : font;
      page.drawText(label, { x: 400, y, size: b ? 12 : 10, font: f });
      page.drawText(`${currency} ${val.toFixed(2)}`, { x: 490, y, size: b ? 12 : 10, font: f });
      y -= b ? 18 : 14;
    };
    line("Subtotal", subtotal);
    if (disc) line(`Discount ${disc}%`, -discAmt);
    if (tax) line(`Tax ${tax}%`, taxAmt);
    line("Total", total, true);

    if (notes) { y -= 15; page.drawText("Notes:", { x: 40, y, size: 10, font: bold }); y -= 13; notes.split("\n").forEach((l) => { page.drawText(l, { x: 40, y, size: 9, font }); y -= 11; }); }

    const bytes = await doc.save();
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${num}.pdf`; a.click();
    toast.success("Invoice downloaded");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="rounded-xl border border-border p-3 space-y-2">
          <legend className="px-1 text-xs font-semibold uppercase text-muted-foreground">From</legend>
          <Input value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} placeholder="Company name" />
          <Textarea value={biz.address} onChange={(e) => setBiz({ ...biz, address: e.target.value })} rows={2} placeholder="Address" />
          <Input value={biz.email} onChange={(e) => setBiz({ ...biz, email: e.target.value })} placeholder="Email" />
        </fieldset>
        <fieldset className="rounded-xl border border-border p-3 space-y-2">
          <legend className="px-1 text-xs font-semibold uppercase text-muted-foreground">Bill to</legend>
          <Input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Client name" />
          <Textarea value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} rows={2} placeholder="Client address" />
        </fieldset>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Invoice #</Label><Input value={num} onChange={(e) => setNum(e.target.value)} className="mt-1" /></div>
        <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" /></div>
        <div><Label>Due date</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="mt-1" /></div>
        <div><Label>Currency</Label><Input value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1" /></div>
      </div>
      <div className="space-y-2">
        <Label>Line items</Label>
        {items.map((it, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_80px_100px_100px_auto]">
            <Input value={it.desc} onChange={(e) => setItem(i, { desc: e.target.value })} placeholder="Description" />
            <Input type="number" value={it.qty} onChange={(e) => setItem(i, { qty: +e.target.value })} />
            <Input type="number" step="0.01" value={it.price} onChange={(e) => setItem(i, { price: +e.target.value })} />
            <div className="flex items-center px-2 text-sm">{(it.qty * it.price).toFixed(2)}</div>
            <Button variant="ghost" size="sm" onClick={() => setItems(items.filter((_, k) => k !== i))}>✕</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setItems([...items, { desc: "", qty: 1, price: 0 }])}>+ Add item</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Tax %</Label><Input type="number" step="0.01" value={tax} onChange={(e) => setTax(+e.target.value)} className="mt-1" /></div>
        <div><Label>Discount %</Label><Input type="number" step="0.01" value={disc} onChange={(e) => setDisc(+e.target.value)} className="mt-1" /></div>
      </div>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes / terms" />
      <div className="rounded-xl border border-border bg-secondary/40 p-4 text-right space-y-1 text-sm">
        <div>Subtotal: {currency} {subtotal.toFixed(2)}</div>
        {disc > 0 && <div>Discount: −{currency} {discAmt.toFixed(2)}</div>}
        {tax > 0 && <div>Tax: {currency} {taxAmt.toFixed(2)}</div>}
        <div className="text-lg font-semibold text-primary">Total: {currency} {total.toFixed(2)}</div>
      </div>
      <Button onClick={generate}>Download PDF invoice</Button>
    </div>
  );
}