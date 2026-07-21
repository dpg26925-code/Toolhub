import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Item = { desc: string; qty: number; price: number; tax: number };

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "VND", symbol: "₫" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
  { code: "JPY", symbol: "¥" },
];

const TERMS = [
  { value: "on-receipt", label: "Due on receipt" },
  { value: "net-7", label: "Net 7" },
  { value: "net-14", label: "Net 14" },
  { value: "net-30", label: "Net 30" },
  { value: "net-60", label: "Net 60" },
];

const STORAGE_KEY = "nexatools:invoice-draft";

function fmt(code: string, n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code, maximumFractionDigits: code === "VND" || code === "JPY" ? 0 : 2 }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

export default function InvoiceGenerator() {
  const [biz, setBiz] = useState({ name: "Your Company", address: "123 Main St\nCity, Country", email: "hello@company.com", phone: "", taxId: "" });
  const [client, setClient] = useState({ name: "Client Name", address: "Client Address", email: "" });
  const [num, setNum] = useState("INV-0001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [due, setDue] = useState("");
  const [terms, setTerms] = useState("net-30");
  const [currency, setCurrency] = useState("USD");
  const [disc, setDisc] = useState(0);
  const [notes, setNotes] = useState("Thank you for your business.");
  const [items, setItems] = useState<Item[]>([{ desc: "Consulting service", qty: 10, price: 100, tax: 0 }]);
  const [logo, setLogo] = useState<string | null>(null); // dataURL
  const loaded = useRef(false);

  // Load draft
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        d.biz && setBiz(d.biz);
        d.client && setClient(d.client);
        d.num && setNum(d.num);
        d.date && setDate(d.date);
        d.due && setDue(d.due);
        d.terms && setTerms(d.terms);
        d.currency && setCurrency(d.currency);
        typeof d.disc === "number" && setDisc(d.disc);
        d.notes && setNotes(d.notes);
        Array.isArray(d.items) && setItems(d.items);
        d.logo && setLogo(d.logo);
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-recalc due date from terms
  useEffect(() => {
    if (terms === "on-receipt") { setDue(date); return; }
    const days = { "net-7": 7, "net-14": 14, "net-30": 30, "net-60": 60 }[terms] ?? 0;
    if (days && date) {
      const d = new Date(date); d.setDate(d.getDate() + days);
      setDue(d.toISOString().slice(0, 10));
    }
  }, [terms, date]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const discAmt = (subtotal * disc) / 100;
  const taxAmt = items.reduce((s, i) => {
    const lineTotal = i.qty * i.price;
    const lineAfterDisc = subtotal > 0 ? lineTotal * (1 - disc / 100) : lineTotal;
    return s + (lineAfterDisc * (i.tax || 0)) / 100;
  }, 0);
  const total = subtotal - discAmt + taxAmt;

  const setItem = (i: number, p: Partial<Item>) => setItems(items.map((it, k) => k === i ? { ...it, ...p } : it));

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ biz, client, num, date, due, terms, currency, disc, notes, items, logo }));
    toast.success("Draft saved");
  };
  const clearDraft = () => { localStorage.removeItem(STORAGE_KEY); toast.success("Draft cleared"); };

  const onLogo = async (file: File | null) => {
    if (!file) { setLogo(null); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  async function generate() {
    if (!biz.name.trim()) { toast.error("Business name is required"); return; }
    if (!client.name.trim()) { toast.error("Client name is required"); return; }
    if (items.length === 0) { toast.error("Add at least one line item"); return; }
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    let y = 800;

    // Logo
    if (logo) {
      try {
        const bytes = Uint8Array.from(atob(logo.split(",")[1]), (c) => c.charCodeAt(0));
        const img = logo.startsWith("data:image/png") ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        const scale = Math.min(80 / img.height, 160 / img.width);
        page.drawImage(img, { x: 40, y: y - img.height * scale + 20, width: img.width * scale, height: img.height * scale });
      } catch { /* ignore */ }
    }

    page.drawText("INVOICE", { x: 400, y, size: 28, font: bold, color: rgb(0.1, 0.15, 0.35) });
    page.drawText(`# ${num}`, { x: 400, y: y - 22, size: 12, font });
    y -= 40;
    biz.name.split("\n").forEach((l) => { page.drawText(l, { x: 40, y, size: 12, font: bold }); y -= 15; });
    biz.address.split("\n").forEach((l) => { page.drawText(l, { x: 40, y, size: 10, font }); y -= 12; });
    if (biz.email) { page.drawText(biz.email, { x: 40, y, size: 10, font }); y -= 12; }
    if (biz.phone) { page.drawText(biz.phone, { x: 40, y, size: 10, font }); y -= 12; }
    if (biz.taxId) { page.drawText(`Tax ID: ${biz.taxId}`, { x: 40, y, size: 10, font }); y -= 12; }
    y -= 10;

    page.drawText("Bill To:", { x: 40, y, size: 10, font: bold }); y -= 14;
    page.drawText(client.name, { x: 40, y, size: 11, font }); y -= 13;
    client.address.split("\n").forEach((l) => { page.drawText(l, { x: 40, y, size: 10, font }); y -= 12; });
    if (client.email) { page.drawText(client.email, { x: 40, y, size: 10, font }); y -= 12; }

    page.drawText(`Date: ${date}`, { x: 400, y: 670, size: 10, font });
    if (due) page.drawText(`Due: ${due}`, { x: 400, y: 655, size: 10, font });
    page.drawText(`Terms: ${TERMS.find((t) => t.value === terms)?.label ?? terms}`, { x: 400, y: 640, size: 10, font });

    y = 600;
    page.drawRectangle({ x: 40, y: y - 4, width: 515, height: 20, color: rgb(0.94, 0.95, 0.98) });
    page.drawText("Description", { x: 45, y, size: 10, font: bold });
    page.drawText("Qty", { x: 320, y, size: 10, font: bold });
    page.drawText("Price", { x: 370, y, size: 10, font: bold });
    page.drawText("Tax%", { x: 445, y, size: 10, font: bold });
    page.drawText("Amount", { x: 490, y, size: 10, font: bold });
    y -= 22;
    for (const it of items) {
      page.drawText(it.desc.slice(0, 42), { x: 45, y, size: 10, font });
      page.drawText(`${it.qty}`, { x: 320, y, size: 10, font });
      page.drawText(fmt(currency, it.price), { x: 370, y, size: 9, font });
      page.drawText(`${it.tax || 0}%`, { x: 445, y, size: 10, font });
      page.drawText(fmt(currency, it.qty * it.price), { x: 490, y, size: 9, font });
      y -= 18;
    }
    y -= 10;
    const line = (label: string, val: number, b = false) => {
      const f = b ? bold : font;
      page.drawText(label, { x: 400, y, size: b ? 12 : 10, font: f });
      page.drawText(fmt(currency, val), { x: 490, y, size: b ? 12 : 10, font: f });
      y -= b ? 18 : 14;
    };
    line("Subtotal", subtotal);
    if (disc) line(`Discount ${disc}%`, -discAmt);
    if (taxAmt) line("Tax", taxAmt);
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
          <Input type="email" value={biz.email} onChange={(e) => setBiz({ ...biz, email: e.target.value })} placeholder="Email" />
          <Input value={biz.phone} onChange={(e) => setBiz({ ...biz, phone: e.target.value })} placeholder="Phone (optional)" />
          <Input value={biz.taxId} onChange={(e) => setBiz({ ...biz, taxId: e.target.value })} placeholder="Tax ID / VAT number (optional)" />
          <div>
            <Label className="text-xs">Logo (PNG/JPG, ≤ 2 MB)</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input type="file" accept="image/png,image/jpeg" onChange={(e) => onLogo(e.target.files?.[0] ?? null)} />
              {logo && <img src={logo} alt="logo preview" className="h-10 rounded border" />}
              {logo && <Button size="sm" variant="ghost" onClick={() => setLogo(null)}>Remove</Button>}
            </div>
          </div>
        </fieldset>
        <fieldset className="rounded-xl border border-border p-3 space-y-2">
          <legend className="px-1 text-xs font-semibold uppercase text-muted-foreground">Bill to</legend>
          <Input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Client name" />
          <Textarea value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} rows={2} placeholder="Client address" />
          <Input type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} placeholder="Client email (optional)" />
        </fieldset>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        <div><Label>Invoice #</Label><Input value={num} onChange={(e) => setNum(e.target.value)} className="mt-1" /></div>
        <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Terms</Label>
          <Select value={terms} onValueChange={setTerms}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{TERMS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Due date</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Line items</Label>
        {items.map((it, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_70px_100px_70px_110px_auto]">
            <Input value={it.desc} onChange={(e) => setItem(i, { desc: e.target.value })} placeholder="Description" />
            <Input type="number" value={it.qty} onChange={(e) => setItem(i, { qty: +e.target.value })} />
            <Input type="number" step="0.01" value={it.price} onChange={(e) => setItem(i, { price: +e.target.value })} />
            <Input type="number" step="0.01" value={it.tax} onChange={(e) => setItem(i, { tax: +e.target.value })} placeholder="Tax %" title="Tax %" />
            <div className="flex items-center px-2 text-sm tabular-nums">{fmt(currency, it.qty * it.price)}</div>
            <Button variant="ghost" size="sm" onClick={() => setItems(items.filter((_, k) => k !== i))}>✕</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setItems([...items, { desc: "", qty: 1, price: 0, tax: 0 }])}>+ Add item</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Discount %</Label><Input type="number" step="0.01" value={disc} onChange={(e) => setDisc(+e.target.value)} className="mt-1" /></div>
      </div>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes / terms" />
      <div className="rounded-xl border border-border bg-secondary/40 p-4 text-right space-y-1 text-sm">
        <div>Subtotal: {fmt(currency, subtotal)}</div>
        {disc > 0 && <div>Discount: −{fmt(currency, discAmt)}</div>}
        {taxAmt > 0 && <div>Tax: {fmt(currency, taxAmt)}</div>}
        <div className="text-lg font-semibold text-primary">Total: {fmt(currency, total)}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={generate}>Download PDF invoice</Button>
        <Button variant="outline" onClick={saveDraft}>Save draft</Button>
        <Button variant="ghost" onClick={clearDraft}>Clear draft</Button>
      </div>
    </div>
  );
}