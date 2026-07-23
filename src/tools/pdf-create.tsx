import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Size = "A4" | "Letter" | "Legal";
type Template = "blank" | "lined" | "grid";
const SIZES: Record<Size, [number, number]> = { A4: [595, 842], Letter: [612, 792], Legal: [612, 1008] };

export default function PdfCreateTool() {
  const [size, setSize] = useState<Size>("A4");
  const [template, setTemplate] = useState<Template>("blank");
  const [title, setTitle] = useState("Untitled Document");
  const [text, setText] = useState("Start typing your content here…");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      const [w, h] = SIZES[size];
      const page = doc.addPage([w, h]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);

      if (template === "lined") {
        for (let y = 60; y < h - 60; y += 24) {
          page.drawLine({ start: { x: 40, y }, end: { x: w - 40, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.9) });
        }
      } else if (template === "grid") {
        for (let x = 40; x < w - 40; x += 20) page.drawLine({ start: { x, y: 40 }, end: { x, y: h - 40 }, thickness: 0.3, color: rgb(0.9, 0.9, 0.92) });
        for (let y = 40; y < h - 40; y += 20) page.drawLine({ start: { x: 40, y }, end: { x: w - 40, y }, thickness: 0.3, color: rgb(0.9, 0.9, 0.92) });
      }

      doc.setTitle(title);
      page.drawText(title, { x: 40, y: h - 60, size: 20, font: bold });

      const maxWidth = w - 80;
      const fontSize = 12;
      const lineHeight = 18;
      let y = h - 100;
      for (const rawLine of text.split("\n")) {
        const words = rawLine.split(" ");
        let line = "";
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
            page.drawText(line, { x: 40, y, size: fontSize, font });
            y -= lineHeight;
            line = word;
            if (y < 60) break;
          } else line = test;
        }
        if (y < 60) break;
        page.drawText(line, { x: 40, y, size: fontSize, font });
        y -= lineHeight;
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${title || "document"}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Page size</Label>
          <Select value={size} onValueChange={(v) => setSize(v as Size)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="A4">A4</SelectItem><SelectItem value="Letter">Letter</SelectItem><SelectItem value="Legal">Legal</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <Label>Template</Label>
          <Select value={template} onValueChange={(v) => setTemplate(v as Template)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="blank">Blank</SelectItem><SelectItem value="lined">Lined paper</SelectItem><SelectItem value="grid">Grid paper</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1"/></div>
      </div>
      <div>
        <Label>Body text</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} className="mt-1 font-mono text-sm" />
      </div>
      <Button onClick={create} disabled={busy}>{busy ? "Creating…" : "Create PDF"}</Button>
    </div>
  );
}