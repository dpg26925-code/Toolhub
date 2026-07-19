import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MAX = 5 * 1024 * 1024;

export default function ImageToBase64Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    const reader = new FileReader();
    reader.onload = () => setDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const onFile = (f?: File) => {
    if (!f) return;
    if (f.size > MAX) return toast.error("Max file size is 5MB (base64 grows ~33%)");
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image");
    setFile(f);
  };

  const rawBase64 = dataUrl.split(",")[1] ?? "";
  const cssBg = dataUrl ? `background-image: url("${dataUrl}");` : "";
  const imgTag = dataUrl ? `<img src="${dataUrl}" alt="" />` : "";

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Upload image (max 5MB)</Label>
        <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="mt-1" />
      </div>
      {url && (
        <>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="mb-2 text-xs text-muted-foreground">Preview</div>
            <img src={url} alt="Preview" className="mx-auto max-h-56" />
          </div>
          {dataUrl && (
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Label>Data URL ({(dataUrl.length / 1024).toFixed(1)} KB)</Label>
                  <Button size="sm" variant="ghost" onClick={() => copy(dataUrl, "Data URL")}>Copy</Button>
                </div>
                <Textarea readOnly value={dataUrl} className="min-h-[120px] font-mono text-xs" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Label>Raw Base64</Label>
                  <Button size="sm" variant="ghost" onClick={() => copy(rawBase64, "Base64")}>Copy</Button>
                </div>
                <Textarea readOnly value={rawBase64} className="min-h-[100px] font-mono text-xs" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Label>CSS background</Label>
                  <Button size="sm" variant="ghost" onClick={() => copy(cssBg, "CSS")}>Copy</Button>
                </div>
                <Textarea readOnly value={cssBg} className="min-h-[80px] font-mono text-xs" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Label>HTML &lt;img&gt; tag</Label>
                  <Button size="sm" variant="ghost" onClick={() => copy(imgTag, "HTML")}>Copy</Button>
                </div>
                <Textarea readOnly value={imgTag} className="min-h-[80px] font-mono text-xs" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}