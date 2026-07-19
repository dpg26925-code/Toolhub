import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";

const MAX = 10 * 1024 * 1024;

export default function ImageRotateFlipTool() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [rotation, setRotation] = useState(0); // degrees, multiples of 90
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/png");

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    setOutput("");
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const onFile = (f?: File) => {
    if (!f) return;
    if (f.size > MAX) return toast.error("Max file size is 10MB");
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image");
    setFile(f);
  };

  const apply = async () => {
    if (!url) return;
    const img = new Image();
    img.src = url;
    await new Promise((r) => (img.onload = r));
    const swap = rotation % 180 !== 0;
    const w = swap ? img.height : img.width;
    const h = swap ? img.width : img.height;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(w / 2, h / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
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
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
              <RotateCcw /> 90° left
            </Button>
            <Button variant="outline" onClick={() => setRotation((r) => (r + 90) % 360)}>
              <RotateCw /> 90° right
            </Button>
            <Button variant={flipH ? "default" : "outline"} onClick={() => setFlipH((v) => !v)}>
              <FlipHorizontal /> Flip horizontal
            </Button>
            <Button variant={flipV ? "default" : "outline"} onClick={() => setFlipV((v) => !v)}>
              <FlipVertical /> Flip vertical
            </Button>
            <Button variant="ghost" onClick={() => { setRotation(0); setFlipH(false); setFlipV(false); }}>
              Reset
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Rotation: {rotation}° {flipH ? "· flipped ↔" : ""} {flipV ? "· flipped ↕" : ""}
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="mb-2 text-xs text-muted-foreground">Preview</div>
            <img
              src={url}
              alt="Preview"
              className="mx-auto max-h-96 transition-transform"
              style={{ transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})` }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={apply}>Apply & export</Button>
            <Button variant="outline" onClick={() => setFormat(format === "image/png" ? "image/jpeg" : "image/png")}>
              Format: {ext.toUpperCase()}
            </Button>
            {output && (
              <Button variant="outline" asChild>
                <a href={output} download={`transformed.${ext}`}>Download</a>
              </Button>
            )}
          </div>
          {output && (
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 text-xs text-muted-foreground">Result</div>
              <img src={output} alt="Result" className="mx-auto max-h-96" />
            </div>
          )}
        </>
      )}
    </div>
  );
}