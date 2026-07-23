// Shared minimal PDF document helper for business documents.
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";

export type DocItem = { description: string; qty: number; price: number };
export type DocOptions = {
  title: string;
  from: { name: string; address?: string; email?: string; phone?: string };
  to: { name: string; address?: string; email?: string };
  ref?: string;
  date?: string;
  validity?: string;
  items: DocItem[];
  taxRate?: number;
  currency?: string;
  notes?: string;
  terms?: string;
};

export async function buildBusinessDoc(opts: DocOptions): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595, 842]);
  let y = 800;

  const currency = opts.currency ?? "$";
  const money = (n: number) => `${currency}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const draw = (text: string, x: number, yy: number, size = 10, f: PDFFont = font, color = rgb(0.1, 0.1, 0.1)) => {
    page.drawText(text, { x, y: yy, size, font: f, color });
  };

  const nl = (px = 14) => {
    y -= px;
    if (y < 60) { page = pdf.addPage([595, 842]); y = 800; }
  };

  draw(opts.title.toUpperCase(), 40, y, 22, bold, rgb(0.15, 0.2, 0.55));
  if (opts.ref) draw(opts.ref, 400, y, 12, bold);
  nl(30);
  if (opts.date) { draw(`Date: ${opts.date}`, 400, y, 10); }
  if (opts.validity) { draw(`Valid until: ${opts.validity}`, 400, y - 14, 10); }

  draw("From:", 40, y, 10, bold);
  draw(opts.from.name, 40, y - 14);
  if (opts.from.address) draw(opts.from.address, 40, y - 28);
  if (opts.from.email) draw(opts.from.email, 40, y - 42);
  if (opts.from.phone) draw(opts.from.phone, 40, y - 56);
  nl(70);

  draw("To:", 40, y, 10, bold);
  draw(opts.to.name, 40, y - 14);
  if (opts.to.address) draw(opts.to.address, 40, y - 28);
  if (opts.to.email) draw(opts.to.email, 40, y - 42);
  nl(60);

  // Items table
  draw("Description", 40, y, 10, bold);
  draw("Qty", 340, y, 10, bold);
  draw("Price", 400, y, 10, bold);
  draw("Total", 490, y, 10, bold);
  nl(6);
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
  nl(14);

  let subtotal = 0;
  for (const it of opts.items) {
    const total = it.qty * it.price;
    subtotal += total;
    draw(it.description.slice(0, 60), 40, y);
    draw(String(it.qty), 340, y);
    draw(money(it.price), 400, y);
    draw(money(total), 490, y);
    nl();
  }
  nl(6);
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
  nl(14);

  const tax = subtotal * (opts.taxRate ?? 0) / 100;
  const grand = subtotal + tax;
  draw("Subtotal:", 400, y); draw(money(subtotal), 490, y); nl();
  if (opts.taxRate) { draw(`Tax (${opts.taxRate}%):`, 400, y); draw(money(tax), 490, y); nl(); }
  draw("TOTAL:", 400, y, 12, bold); draw(money(grand), 490, y, 12, bold); nl(20);

  if (opts.notes) { draw("Notes:", 40, y, 10, bold); nl(); for (const line of opts.notes.split("\n")) { draw(line, 40, y, 9); nl(12); } }
  if (opts.terms) { nl(10); draw("Terms & Conditions:", 40, y, 10, bold); nl(); for (const line of opts.terms.split("\n")) { draw(line, 40, y, 9); nl(12); } }

  return await pdf.save();
}

export function downloadPdf(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}