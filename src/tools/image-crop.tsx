import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MAX = 10 * 1024 * 1024;

type Rect = { x: number; y: number; w: number; h: number };

export default function ImageCropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [output, setOutput] = useState<string>("");
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/png");
  const imgRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    setOutput("");
    setRect(null);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const onFile = (f?: File) => {
    if (!f) return;
    if (f.size > MAX) return toast.error("Max file size is 10MB");
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image");
    setFile(f);
  };

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    // default crop = center 60%
    const w = Math.round(img.naturalWidth * 0.6);
    const h = Math.round(img.naturalHeight * 0.6);
    setRect({ x: (img.naturalWidth - w) / 2, y: (img.naturalHeight - h) / 2, w, h });
  };

  const scaleFromDisplay = (clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img || !natural) return { x: 0, y: 0 };
    const b = img.getBoundingClientRect();
    const sx = natural.w / b.width;
    const sy = natural.h / b.height;
    return { x: (clientX - b.left) * sx, y: (clientY - b.top) * sy };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = scaleFromDisplay(e.clientX, e.clientY);
    setRect({ x: dragStart.current.x, y: dragStart.current.y, w: 0, h: 0 });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current || !natural) return;
    const p = scaleFromDisplay(e.clientX, e.clientY);
    const x = Math.max(0, Math.min(dragStart.current.x, p.x));
    const y = Math.max(0, Math.min(dragStart.current.y, p.y));
    const w = Math.min(natural.w - x, Math.abs(p.x - dragStart.current.x));
    const h = Math.min(natural.h - y, Math.abs(p.y - dragStart.current.y));
    setRect({ x, y, w, h });
  };
  const onMouseUp = () => { dragStart.current = null; };

  const displayRect = (() => {
    const img = imgRef.current;
    if (!img || !natural || !rect) return null;
    const b = img.getBoundingClientRect();
    const sx = b.width / natural.w;
    const sy = b.height / natural.h;
    return { left: rect.x * sx, top: rect.y * sy, width: rect.w * sx, height: rect.h * sy };
  })();

  const doCrop = async () => {
    if (!url || !rect || rect.w < 1 || rect.h < 1) return toast.error("Draw a crop region first");
    const img = new Image();
    img.src = url;
    await new Promise((r) => (img.onload = r));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.w);
    canvas.height = Math.round(rect.h);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    setOutput(canvas.toDataURL(format, 0.95));
  };

  const ext = format === "image/jpeg" ? "jpg" : "png";

  return (
    <div className="space-y-6">
      <div>
        <Label>Upload image (max 10MB)</Label>
        <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="mt-1" />
      </div>
      {url && (
        <>
          <div
            className="relative inline-block max-w-full select-none rounded-xl border border-border bg-background p-2"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <img ref={imgRef} src={url} onLoad={onImgLoad} alt="Source" className="max-h-[500px] max-w-full cursor-crosshair" draggable={false} />
            {displayRect && (
              <div
                className="pointer-events-none absolute border-2 border-primary bg-primary/10"
                style={{ left: displayRect.left + 8, top: displayRect.top + 8, width: displayRect.width, height: displayRect.height }}
              />
            )}
          </div>
          {rect && (
            <div className="text-xs text-muted-foreground">
              Crop: {Math.round(rect.w)}×{Math.round(rect.h)} at ({Math.round(rect.x)}, {Math.round(rect.y)})
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={doCrop} disabled={!rect || rect.w < 1}>Crop</Button>
            <Button variant="outline" onClick={() => setFormat(format === "image/png" ? "image/jpeg" : "image/png")}>
              Format: {ext.toUpperCase()}
            </Button>
            {output && (
              <Button variant="outline" asChild>
                <a href={output} download={`cropped.${ext}`}>Download</a>
              </Button>
            )}
          </div>
          {output && (
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 text-xs text-muted-foreground">Cropped result</div>
              <img src={output} alt="Cropped" className="mx-auto max-h-96" />
            </div>
          )}
        </>
      )}
    </div>
  );
}