import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

async function rasterize(svg: string, scale: number, format: "png" | "jpeg"): Promise<string> {
  const parser = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = parser.documentElement;
  const vb = root.getAttribute("viewBox")?.split(/[\s,]+/).map(Number);
  const w = parseFloat(root.getAttribute("width") || "") || (vb ? vb[2] : 512);
  const h = parseFloat(root.getAttribute("height") || "") || (vb ? vb[3] : 512);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((r, rej) => { img.onload = () => r(); img.onerror = () => rej(new Error("Invalid SVG")); img.src = url; });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale); canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d")!;
    if (format === "jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(`image/${format}`, 0.95);
  } finally { URL.revokeObjectURL(url); }
}

export default function SvgToPngTool() {
  const [svg, setSvg] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="#7c3aed"/></svg>`);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [out, setOut] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (f: File | null) => {
    if (!f) return; setSvg(await f.text());
  };
  const run = async () => {
    setBusy(true);
    try { setOut(await rasterize(svg, scale, format)); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="paste">
        <TabsList><TabsTrigger value="paste">Paste SVG</TabsTrigger><TabsTrigger value="upload">Upload .svg</TabsTrigger></TabsList>
        <TabsContent value="paste"><Textarea value={svg} onChange={(e) => setSvg(e.target.value)} className="min-h-[160px] font-mono text-xs"/></TabsContent>
        <TabsContent value="upload"><Input type="file" accept="image/svg+xml,.svg" onChange={(e) => onFile(e.target.files?.[0] ?? null)}/></TabsContent>
      </Tabs>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Scale (×)</Label><Input type="number" min={1} max={8} step={0.5} value={scale} onChange={(e) => setScale(+e.target.value || 1)} className="mt-1"/></div>
        <div><Label>Format</Label><select value={format} onChange={(e) => setFormat(e.target.value as "png"|"jpeg")} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="png">PNG (transparent)</option><option value="jpeg">JPG (white bg)</option></select></div>
      </div>
      <Button onClick={run} disabled={busy}>{busy ? "Rendering…" : "Rasterize"}</Button>
      {out && (
        <div className="space-y-2 rounded-xl border p-4">
          <img src={out} alt="Rasterized" className="max-h-96 rounded"/>
          <Button asChild variant="outline"><a href={out} download={`image.${format === "jpeg" ? "jpg" : "png"}`}>Download</a></Button>
        </div>
      )}
    </div>
  );
}