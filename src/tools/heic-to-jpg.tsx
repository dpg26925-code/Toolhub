import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

type Row = { name: string; url: string };

export default function HeicToJpgTool() {
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg");
  const [quality, setQuality] = useState(0.9);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const run = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true); setRows([]);
    try {
      const heic2any = (await import("heic2any")).default;
      const out: Row[] = [];
      for (const f of Array.from(files)) {
        const blob = (await heic2any({ blob: f, toType: `image/${format}`, quality })) as Blob | Blob[];
        const b = Array.isArray(blob) ? blob[0] : blob;
        out.push({ name: f.name.replace(/\.(heic|heif)$/i, "") + "." + (format === "jpeg" ? "jpg" : "png"), url: URL.createObjectURL(b) });
      }
      setRows(out);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept=".heic,.heif,image/heic,image/heif" multiple onChange={(e) => run(e.target.files)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Output format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as "jpeg" | "png")}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="jpeg">JPG</SelectItem><SelectItem value="png">PNG</SelectItem></SelectContent></Select>
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