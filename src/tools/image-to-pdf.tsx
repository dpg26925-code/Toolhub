import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import jsPDF from "jspdf";

const MAX = 10 * 1024 * 1024;

type Item = { file: File; url: string };

export default function ImageToPdfTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [orient, setOrient] = useState<"portrait" | "landscape">("portrait");
  const [busy, setBusy] = useState(false);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const next: Item[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > MAX) {
        toast.error(`${f.name} exceeds 10MB — skipped`);
        continue;
      }
      next.push({ file: f, url: URL.createObjectURL(f) });
    }
    setItems((prev) => [...prev, ...next]);
  };

  const remove = (i: number) => {
    setItems((prev) => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const move = (i: number, dir: -1 | 1) => {
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const generate = async () => {
    if (!items.length) return;
    setBusy(true);
    try {
      const pdf = new jsPDF({ orientation: orient, unit: "pt", format: pageSize });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const img = new Image();
        img.src = item.url;
        await new Promise((r) => (img.onload = r));
        const ratio = Math.min(pageW / img.width, pageH / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;
        if (i > 0) pdf.addPage(pageSize, orient);
        const type = item.file.type === "image/png" ? "PNG" : "JPEG";
        pdf.addImage(item.url, type, x, y, w, h);
      }
      pdf.save("images.pdf");
      toast.success("PDF ready");
    } catch (e) {
      toast.error("Failed to build PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Upload images (max 10MB each)</Label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFiles(e.target.files)}
          className="mt-1"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Page size</Label>
          <Select value={pageSize} onValueChange={(v) => setPageSize(v as typeof pageSize)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="letter">Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Orientation</Label>
          <Select value={orient} onValueChange={(v) => setOrient(v as typeof orient)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Pages ({items.length})</div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-2">
                <img src={it.url} alt={it.file.name} className="mx-auto h-32 w-full object-contain" />
                <div className="mt-2 truncate text-xs text-muted-foreground" title={it.file.name}>
                  {i + 1}. {it.file.name}
                </div>
                <div className="mt-2 flex justify-between gap-1">
                  <Button size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                  >
                    ↓
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(i)}>
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Button onClick={generate} disabled={busy || !items.length}>
        {busy ? "Building…" : "Download PDF"}
      </Button>
    </div>
  );
}