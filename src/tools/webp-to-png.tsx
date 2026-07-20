import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

type Row = { name: string; url: string };

export default function WebpToPngTool() {
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [quality, setQuality] = useState(0.92);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const run = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true); setRows([]);
    try {
      const out: Row[] = [];
      for (const f of Array.from(files)) {
        const img = await createImageBitmap(f);
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, `image/${format}`, format === "png" ? undefined : quality));
        if (!blob) throw new Error("Encoding failed");
        out.push({ name: f.name.replace(/\.webp$/i, "") + "." + (format === "jpeg" ? "jpg" : "png"), url: URL.createObjectURL(blob) });
      }
      setRows(out);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/webp,.webp" multiple onChange={(e) => run(e.target.files)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Output format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as "png" | "jpeg")}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="png">PNG</SelectItem><SelectItem value="jpeg">JPG</SelectItem></SelectContent></Select>
        </div>
        {format === "jpeg" && (
          <div><Label>Quality: {Math.round(quality * 100)}%</Label><Slider className="mt-3" value={[quality * 100]} min={40} max={100} step={5} onValueChange={([v]) => setQuality(v / 100)} /></div>
        )}
      </div>
      {busy && <p className="text-sm text-muted-foreground">Converting…</p>}
      {rows.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r, i) => (
            <div key={i} className="rounded-lg border p-3">
              <img src={r.url} alt={r.name} className="mb-2 max-h-56 w-full rounded object-contain"/>
              <Button asChild variant="outline" size="sm"><a href={r.url} download={r.name}>Download {r.name}</a></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}