import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Copy, FileText, ScanText } from "lucide-react";
import { toast } from "sonner";

export default function OcrTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onFile = (f: File | null) => {
    setFile(f);
    setText("");
    setError(null);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      setText(data.text);
      await worker.terminate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "OCR failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("OCR text copied");
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {!preview && (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
          <FileText className="mb-3 size-8 text-primary" />
          Upload a screenshot or photo with text to extract editable OCR output.
        </div>
      )}
      {preview && <img src={preview} alt="Uploaded image preview" className="max-h-64 rounded-lg border border-border" />}
      <Button onClick={run} disabled={!file || busy}>
        <ScanText />
        {busy ? `Reading… ${progress}%` : "Extract text"}
      </Button>
      {busy && <Progress value={progress} />}
      {text && (
        <div>
          <Textarea readOnly value={text} className="min-h-[240px] font-mono text-sm" />
          <Button className="mt-2" variant="outline" onClick={copy}>
            <Copy />
            Copy text
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}