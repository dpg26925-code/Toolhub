import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Item = { desc: string; qty: number; price: number };

export default function ReceiptGenerator() {
  const [merchant, setMerchant] = useState({ name: "Coffee Shop", address: "123 Main St", phone: "+1 555-0100" });
  const [customer, setCustomer] = useState("Walk-in");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [payment, setPayment] = useState("Cash");
  const [tax, setTax] = useState(8);
  const [disc, setDisc] = useState(0);
  const [currency, setCurrency] = useState("$");
  const [items, setItems] = useState<Item[]>([{ desc: "Latte", qty: 2, price: 4.5 }, { desc: "Muffin", qty: 1, price: 3.5 }]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const discAmt = (subtotal * disc) / 100;
  const taxAmt = ((subtotal - discAmt) * tax) / 100;
  const total = subtotal - discAmt + taxAmt;
  const setItem = (i: number, p: Partial<Item>) => setItems(items.map((it, k) => k === i ? { ...it, ...p } : it));

  async function generate() {
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const page = doc.addPage([280, 500]);
    const font = await doc.embedFont(StandardFonts.Courier);
    const bold = await doc.embedFont(StandardFonts.CourierBold);
    let y = 470;
    const center = (txt: string, size: number, f = font) => {
      const w = f.widthOfTextAtSize(txt, size);
      page.drawText(txt, { x: (280 - w) / 2, y, size, font: f });
      y -= size + 4;
    };
    center(merchant.name, 14, bold);
    center(merchant.address, 9);
    center(merchant.phone, 9);
    y -= 6;
    page.drawLine({ start: { x: 20, y }, end: { x: 260, y }, thickness: 0.5, color: rgb(0, 0, 0) });
    y -= 12;
    page.drawText(`Date: ${date.replace("T", " ")}`, { x: 20, y, size: 9, font }); y -= 12;
    page.drawText(`Customer: ${customer}`, { x: 20, y, size: 9, font }); y -= 12;
    page.drawText(`Payment: ${payment}`, { x: 20, y, size: 9, font }); y -= 14;
    page.drawLine({ start: { x: 20, y }, end: { x: 260, y }, thickness: 0.5, color: rgb(0, 0, 0) }); y -= 12;
    for (const it of items) {
      page.drawText(`${it.qty} x ${it.desc.slice(0, 22)}`, { x: 20, y, size: 9, font });
      page.drawText(`${currency}${(it.qty * it.price).toFixed(2)}`, { x: 210, y, size: 9, font });
      y -= 12;
    }
    y -= 4;
    page.drawLine({ start: { x: 20, y }, end: { x: 260, y }, thickness: 0.5, color: rgb(0, 0, 0) }); y -= 12;
    const row = (l: string, v: number, b = false) => {
      const f = b ? bold : font;
      page.drawText(l, { x: 20, y, size: b ? 11 : 9, font: f });
      page.drawText(`${currency}${v.toFixed(2)}`, { x: 210, y, size: b ? 11 : 9, font: f });
      y -= b ? 14 : 12;
    };
    row("Subtotal", subtotal);
    if (disc) row(`Discount ${disc}%`, -discAmt);
    if (tax) row(`Tax ${tax}%`, taxAmt);
    row("TOTAL", total, true);
    y -= 10;
    center("Thank you!", 10, bold);

    const bytes = await doc.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `receipt-${Date.now()}.pdf`; a.click();
    toast.success("Receipt downloaded");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input value={merchant.name} onChange={(e) => setMerchant({ ...merchant, name: e.target.value })} placeholder="Merchant name" />
        <Input value={merchant.phone} onChange={(e) => setMerchant({ ...merchant, phone: e.target.value })} placeholder="Phone" />
        <Textarea value={merchant.address} onChange={(e) => setMerchant({ ...merchant, address: e.target.value })} rows={1} className="sm:col-span-2" placeholder="Address" />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Customer</Label><Input value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1" /></div>
        <div><Label>Date/time</Label><Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" /></div>
        <div><Label>Payment</Label>
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>Cash</option><option>Card</option><option>Bank Transfer</option><option>Mobile Pay</option>
          </select>
        </div>
        <div><Label>Currency</Label><Input value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1" /></div>
      </div>
      <div className="space-y-2">
        <Label>Items</Label>
        {items.map((it, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_80px_100px_auto]">
            <Input value={it.desc} onChange={(e) => setItem(i, { desc: e.target.value })} />
            <Input type="number" value={it.qty} onChange={(e) => setItem(i, { qty: +e.target.value })} />
            <Input type="number" step="0.01" value={it.price} onChange={(e) => setItem(i, { price: +e.target.value })} />
            <Button variant="ghost" size="sm" onClick={() => setItems(items.filter((_, k) => k !== i))}>✕</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setItems([...items, { desc: "", qty: 1, price: 0 }])}>+ Add item</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Tax %</Label><Input type="number" step="0.01" value={tax} onChange={(e) => setTax(+e.target.value)} className="mt-1" /></div>
        <div><Label>Discount %</Label><Input type="number" step="0.01" value={disc} onChange={(e) => setDisc(+e.target.value)} className="mt-1" /></div>
      </div>
      <div className="rounded-xl border border-border bg-secondary/40 p-4 text-right text-sm">
        <div>Subtotal: {currency}{subtotal.toFixed(2)}</div>
        {tax > 0 && <div>Tax: {currency}{taxAmt.toFixed(2)}</div>}
        <div className="text-lg font-semibold text-primary">Total: {currency}{total.toFixed(2)}</div>
      </div>
      <Button onClick={generate}>Download PDF receipt</Button>
    </div>
  );
}