import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const FORMATS = ["CODE128", "CODE39", "EAN13", "EAN8", "UPC", "ITF14"];

export default function TtBarcode() {
  const [value, setValue] = useState("123456789012");
  const [format, setFormat] = useState("CODE128");
  const [err, setErr] = useState("");
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      JsBarcode(ref.current, value || " ", { format, displayValue: true, height: 90, margin: 12 });
      setErr("");
    } catch (e) { setErr((e as Error).message); }
  }, [value, format]);
  const download = () => {
    if (!ref.current) return;
    const s = new XMLSerializer().serializeToString(ref.current);
    const blob = new Blob([s], { type: "image/svg+xml" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `barcode-${value}.svg`; a.click();
  };
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Value</Label><Input value={value} onChange={(e) => setValue(e.target.value)} className="mt-1" /></div>
        <div><Label>Format</Label><select value={format} onChange={(e) => setFormat(e.target.value)} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm">{FORMATS.map((f) => <option key={f}>{f}</option>)}</select></div>
      </div>
      <div className="rounded-xl border bg-white p-6 flex justify-center overflow-auto">
        <svg ref={ref} />
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button variant="outline" onClick={download}>Download SVG</Button>
    </div>
  );
}