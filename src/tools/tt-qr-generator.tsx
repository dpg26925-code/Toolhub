import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TtQrGenerator() {
  const [text, setText] = useState("https://tiktok.com/@yourname");
  const [size, setSize] = useState(320);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    if (!text) return setDataUrl("");
    QRCode.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: level, color: { dark: fg, light: bg } }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [text, size, fg, bg, level]);
  return (
    <div className="space-y-4">
      <div><Label>Text or URL</Label><Input value={text} onChange={(e) => setText(e.target.value)} className="mt-1" /></div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Size (px)</Label><Input type="number" min={64} max={1024} value={size} onChange={(e) => setSize(+e.target.value || 320)} className="mt-1" /></div>
        <div><Label>Foreground</Label><Input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="mt-1 h-10" /></div>
        <div><Label>Background</Label><Input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-1 h-10" /></div>
        <div><Label>Error correction</Label><select value={level} onChange={(e) => setLevel(e.target.value as "L" | "M" | "Q" | "H")} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option>L</option><option>M</option><option>Q</option><option>H</option></select></div>
      </div>
      {dataUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={dataUrl} alt="QR code" className="rounded-lg border bg-white p-2" width={size} height={size} />
          <Button variant="outline" asChild><a href={dataUrl} download="qr.png">Download PNG</a></Button>
        </div>
      )}
    </div>
  );
}