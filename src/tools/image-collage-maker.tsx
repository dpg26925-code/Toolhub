import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Item = { id: string; file: File; url: string };

export default function ImageCollageMakerTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [cols, setCols] = useState(3);
  const [gap, setGap] = useState(8);
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState("1200");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<string | null>(null);

  const add = (fs: FileList | null) => {
    if (!fs) return;
    const next = Array.from(fs).slice(0, 9 - items.length).map((f) => ({ id: Math.random().toString(36).slice(2), file: f, url: URL.createObjectURL(f) }));
    setItems([...items, ...next]);
  };
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    const nx = idx + dir;
    if (nx < 0 || nx >= items.length) return;
    const copy = [...items];
    [copy[idx], copy[nx]] = [copy[nx], copy[idx]];
    setItems(copy);
  };

  const build = async () => {
    if (!items.length) return;
    setBusy(true); setOut(null);
    try {
      const bmps = await Promise.all(items.map((i) => createImageBitmap(i.file)));
      const total = +size;
      const c = Math.min(cols, items.length);
      const rows = Math.ceil(items.length / c);
      const cellW = Math.floor((total - gap * (c + 1)) / c);
      const cellH = cellW; // square cells
      const canvas = document.createElement("canvas");
      canvas.width = total;
      canvas.height = cellH * rows + gap * (rows + 1);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      bmps.forEach((bmp, i) => {
        const row = Math.floor(i / c);
        const col = i % c;
        const x = gap + col * (cellW + gap);
        const y = gap + row * (cellH + gap);
        // cover-fit
        const ratio = Math.max(cellW / bmp.width, cellH / bmp.height);
        const drawW = bmp.width * ratio;
        const drawH = bmp.height * ratio;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cellW, cellH);
        ctx.clip();
        ctx.drawImage(bmp, x + (cellW - drawW) / 2, y + (cellH - drawH) / 2, drawW, drawH);
        ctx.restore();
      });
      const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
      setOut(URL.createObjectURL(blob));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" multiple onChange={(e) => add(e.target.files)} disabled={items.length >= 9} />
      <p className="text-xs text-muted-foreground">{items.length}/9 images</p>
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {items.map((i, idx) => (
            <div key={i.id} className="relative rounded border overflow-hidden">
              <img src={i.url} alt="" className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1">
                <button className="text-white text-xs px-1" onClick={() => move(i.id, -1)} disabled={idx === 0}>◀</button>
                <button className="text-white text-xs px-1" onClick={() => remove(i.id)}>✕</button>
                <button className="text-white text-xs px-1" onClick={() => move(i.id, 1)} disabled={idx === items.length - 1}>▶</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label>Columns</Label>
          <Select value={String(cols)} onValueChange={(v) => setCols(+v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Gap (px)</Label><Input type="number" min={0} value={gap} onChange={(e) => setGap(+e.target.value)} className="mt-1"/></div>
        <div><Label>Background</Label><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-1 h-10 w-full rounded border" /></div>
        <div>
          <Label>Output width</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="800">800</SelectItem><SelectItem value="1200">1200</SelectItem><SelectItem value="1920">1920</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={build} disabled={!items.length || busy}>{busy ? "Building…" : "Create collage"}</Button>
      {out && (
        <div className="rounded-xl border p-3 space-y-2">
          <img src={out} alt="Collage" className="w-full rounded" />
          <Button asChild variant="outline"><a href={out} download="collage.png">Download PNG</a></Button>
        </div>
      )}
    </div>
  );
}