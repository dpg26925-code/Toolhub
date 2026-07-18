import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

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

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {preview && <img src={preview} alt="preview" className="max-h-64 rounded-lg border border-border" />}
      <Button onClick={run} disabled={!file || busy}>
        {busy ? `Reading… ${progress}%` : "Extract text"}
      </Button>
      {busy && <Progress value={progress} />}
      {text && (
        <div>
          <Textarea readOnly value={text} className="min-h-[240px] font-mono text-sm" />
          <Button className="mt-2" variant="outline" onClick={() => navigator.clipboard.writeText(text)}>
            Copy text
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}