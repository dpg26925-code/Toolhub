import { useState } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Item = { file: File; url: string };

export default function PdfMergeImagesTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [size, setSize] = useState<"A4" | "Letter" | "Fit">("A4");
  const [orient, setOrient] = useState<"portrait" | "landscape">("portrait");
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const add = (list: FileList | null) => {
    if (!list) return;
    setItems([...items, ...Array.from(list).map((f) => ({ file: f, url: URL.createObjectURL(f) }))]);
    setUrl(null);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    const copy = [...items]; [copy[i], copy[j]] = [copy[j], copy[i]]; setItems(copy);
  };
  const remove = (i: number) => setItems(items.filter((_, j) => j !== i));

  const build = async () => {
    if (!items.length) return;
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      for (const it of items) {
        const bytes = new Uint8Array(await it.file.arrayBuffer());
        const img = /png$/i.test(it.file.type) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        let pw: number, ph: number;
        if (size === "Fit") { pw = img.width; ph = img.height; }
        else {
          const [w, h] = size === "A4" ? PageSizes.A4 : PageSizes.Letter;
          pw = orient === "portrait" ? w : h; ph = orient === "portrait" ? h : w;
        }
        const page = doc.addPage([pw, ph]);
        const scale = Math.min(pw / img.width, ph / img.height);
        const dw = img.width * scale, dh = img.height * scale;
        page.drawImage(img, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
      }
      const data = await doc.save();
      setUrl(URL.createObjectURL(new Blob([data as BlobPart], { type: "application/pdf" })));
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/png,image/jpeg" multiple onChange={(e) => add(e.target.files)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Page size</Label><select value={size} onChange={(e) => setSize(e.target.value as "A4"|"Letter"|"Fit")} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option>A4</option><option>Letter</option><option value="Fit">Fit to image</option></select></div>
        {size !== "Fit" && <div><Label>Orientation</Label><select value={orient} onChange={(e) => setOrient(e.target.value as "portrait"|"landscape")} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div>}
      </div>
      {items.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border p-2">
              <img src={it.url} alt="" className="h-14 w-14 rounded object-cover"/>
              <div className="min-w-0 flex-1"><div className="truncate text-sm">{i + 1}. {it.file.name}</div><div className="text-xs text-muted-foreground">{(it.file.size/1024).toFixed(0)} KB</div></div>
              <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => move(i, -1)}>↑</Button><Button size="sm" variant="ghost" onClick={() => move(i, 1)}>↓</Button><Button size="sm" variant="ghost" onClick={() => remove(i)}>×</Button></div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-3">
        <Button onClick={build} disabled={!items.length || busy}>{busy ? "Building…" : "Build PDF"}</Button>
        {url && <Button asChild variant="outline"><a href={url} download="images.pdf">Download PDF</a></Button>}
      </div>
    </div>
  );
}