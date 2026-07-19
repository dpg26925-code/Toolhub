import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download, ImageUp, RefreshCw } from "lucide-react";

const PRESETS: { label: string; w: number; h: number }[] = [
  { label: "Custom", w: 0, h: 0 },
  { label: "Instagram Square 1080×1080", w: 1080, h: 1080 },
  { label: "Instagram Story 1080×1920", w: 1080, h: 1920 },
  { label: "Twitter/X 1200×675", w: 1200, h: 675 },
  { label: "Facebook Cover 820×312", w: 820, h: 312 },
  { label: "YouTube Thumbnail 1280×720", w: 1280, h: 720 },
  { label: "HD 1920×1080", w: 1920, h: 1080 },
];

const MAX = 10 * 1024 * 1024;

export default function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [keepRatio, setKeepRatio] = useState(true);
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [output, setOutput] = useState<string>("");
  const [outputSize, setOutputSize] = useState(0);
  const [resizing, setResizing] = useState(false);
  const [preset, setPreset] = useState("Custom");
  const lastEdit = useRef<"w" | "h">("w");

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    const img = new Image();
    img.onload = () => {
      setNatural({ w: img.width, h: img.height });
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = u;
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX) return toast.error("Max file size is 10MB");
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image");
    setFile(f);
    setOutput("");
    setOutputSize(0);
  };

  const changeW = (v: number) => {
    lastEdit.current = "w";
    setWidth(v);
    if (keepRatio && natural) setHeight(Math.round((v * natural.h) / natural.w));
  };
  const changeH = (v: number) => {
    lastEdit.current = "h";
    setHeight(v);
    if (keepRatio && natural) setWidth(Math.round((v * natural.w) / natural.h));
  };

  const applyPreset = (label: string) => {
    setPreset(label);
    const p = PRESETS.find((p) => p.label === label);
    if (!p || p.w === 0) return;
    setKeepRatio(false);
    setWidth(p.w);
    setHeight(p.h);
  };

  const resize = async () => {
    if (!url) return;
    if (width < 1 || height < 1) return toast.error("Width and height must be at least 1px");
    setResizing(true);
    const img = new Image();
    img.src = url;
    await new Promise((r) => (img.onload = r));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setResizing(false);
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL(format, 0.92);
    setOutput(dataUrl);
    const base64 = dataUrl.split(",")[1] ?? "";
    setOutputSize(Math.round((base64.length * 3) / 4));
    setResizing(false);
  };

  const ext = format === "image/jpeg" ? "jpg" : format.split("/")[1];
  const formatBytes = (n: number) => `${(n / 1024).toFixed(n > 1024 * 1024 ? 1 : 0)} ${n > 1024 * 1024 ? "MB" : "KB"}`;

  return (
    <div className="space-y-6">
      <div>
        <Label>Upload image (max 10MB)</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0])}
          className="mt-1"
        />
      </div>
      {!url && (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
          <ImageUp className="mb-3 size-8 text-primary" />
          Choose an image to unlock resize controls, preview, and download.
        </div>
      )}
      {url && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Preset</Label>
              <Select value={preset} onValueChange={applyPreset}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESETS.map((p) => (
                    <SelectItem key={p.label} value={p.label}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Width</Label>
              <Input
                type="number"
                value={width}
                onChange={(e) => changeW(Number(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Height</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => changeH(Number(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/png">PNG</SelectItem>
                  <SelectItem value="image/jpeg">JPG</SelectItem>
                  <SelectItem value="image/webp">WEBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="ratio"
              checked={keepRatio}
              onCheckedChange={(v) => setKeepRatio(Boolean(v))}
            />
            <Label htmlFor="ratio">Keep aspect ratio</Label>
            {natural && (
              <span className="text-xs text-muted-foreground">
                Original: {natural.w}×{natural.h}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={resize} disabled={resizing}>
              <RefreshCw className={resizing ? "animate-spin" : ""} />
              {resizing ? "Resizing…" : "Resize"}
            </Button>
            {output && (
              <Button variant="outline" asChild>
                <a href={output} download={`resized.${ext}`}>
                  <Download />
                  Download {ext.toUpperCase()}
                </a>
              </Button>
            )}
          </div>
          {output && (
            <div className="grid gap-3 rounded-xl border border-border bg-background p-4 text-sm sm:grid-cols-3">
              <div><span className="text-muted-foreground">Original</span><div className="font-semibold">{natural?.w}×{natural?.h}</div></div>
              <div><span className="text-muted-foreground">Resized</span><div className="font-semibold">{width}×{height}</div></div>
              <div><span className="text-muted-foreground">Output size</span><div className="font-semibold">{formatBytes(outputSize)}</div></div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 text-xs text-muted-foreground">Original</div>
              <img src={url} alt="Original" className="mx-auto max-h-64 object-contain" />
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 text-xs text-muted-foreground">Preview</div>
              {output ? (
                <img src={output} alt="Resized" className="mx-auto max-h-64 object-contain" />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  Click Resize to preview
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}