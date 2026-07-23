import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PdfSignTool() {
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [scale, setScale] = useState(150);
  const [sigUrl, setSigUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#111";
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * canvasRef.current!.width, y: ((e.clientY - r.top) / r.height) * canvasRef.current!.height };
  };
  const down = (e: React.PointerEvent) => { drawing.current = true; const p = pos(e); const ctx = canvasRef.current!.getContext("2d")!; ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const move = (e: React.PointerEvent) => { if (!drawing.current) return; const p = pos(e); const ctx = canvasRef.current!.getContext("2d")!; ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const up = () => { drawing.current = false; };
  const clearSig = () => {
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); setSigUrl(null);
  };
  const useDrawn = () => setSigUrl(canvasRef.current!.toDataURL("image/png"));
  const uploadSig = (f: File | null) => { if (!f) return; setSigUrl(URL.createObjectURL(f)); };

  const sign = async () => {
    if (!file || !sigUrl) return;
    setBusy(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfBytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(pdfBytes);
      let pngBytes: ArrayBuffer;
      if (sigUrl.startsWith("data:")) {
        const b = await (await fetch(sigUrl)).arrayBuffer();
        pngBytes = b;
      } else {
        pngBytes = await (await fetch(sigUrl)).arrayBuffer();
      }
      const png = await doc.embedPng(pngBytes);
      const pages = doc.getPages();
      const p = pages[Math.max(0, Math.min(page - 1, pages.length - 1))];
      const { width, height } = p.getSize();
      const w = scale;
      const h = (png.height / png.width) * w;
      p.drawImage(png, { x: (x / 100) * width, y: (1 - y / 100) * height - h, width: w, height: h });
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `signed-${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Signed PDF downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div><Label>PDF file</Label><Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1" /></div>
      <div className="rounded-xl border p-3 space-y-2">
        <div className="text-sm font-semibold">Draw your signature</div>
        <canvas ref={canvasRef} width={600} height={200} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} className="w-full rounded border touch-none bg-white" />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={useDrawn}>Use drawing</Button>
          <Button size="sm" variant="outline" onClick={clearSig}>Clear</Button>
          <label className="text-sm cursor-pointer rounded-md border px-3 py-1.5">
            Upload PNG…
            <input type="file" accept="image/png" className="hidden" onChange={(e) => uploadSig(e.target.files?.[0] ?? null)} />
          </label>
          {sigUrl && <img src={sigUrl} alt="signature" className="h-10 rounded border bg-white" />}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div><Label>Page #</Label><Input type="number" min={1} value={page} onChange={(e) => setPage(+e.target.value)} className="mt-1"/></div>
        <div><Label>X (%)</Label><Input type="number" min={0} max={100} value={x} onChange={(e) => setX(+e.target.value)} className="mt-1"/></div>
        <div><Label>Y (%)</Label><Input type="number" min={0} max={100} value={y} onChange={(e) => setY(+e.target.value)} className="mt-1"/></div>
        <div><Label>Width (pt)</Label><Input type="number" min={40} value={scale} onChange={(e) => setScale(+e.target.value)} className="mt-1"/></div>
      </div>
      <Button onClick={sign} disabled={!file || !sigUrl || busy}>{busy ? "Signing…" : "Sign & download PDF"}</Button>
    </div>
  );
}