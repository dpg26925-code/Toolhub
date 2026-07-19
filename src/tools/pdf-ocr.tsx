import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Copy, Download, ScanText } from "lucide-react";
import { toast } from "sonner";

const LANGS: { code: string; label: string }[] = [
  { code: "eng", label: "English" },
  { code: "vie", label: "Vietnamese" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "spa", label: "Spanish" },
  { code: "jpn", label: "Japanese" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
];

export default function PdfOcrTool() {
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState("eng");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setText("");
    setProgress(0);
    setStatus("Loading PDF…");
    try {
      const pdfjs: any = await import("pdfjs-dist");
      const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(lang);

      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const total = doc.numPages;
      const parts: string[] = [];

      for (let i = 1; i <= total; i++) {
        setStatus(`Page ${i} / ${total} — rendering…`);
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        setStatus(`Page ${i} / ${total} — reading text…`);
        const { data } = await worker.recognize(canvas);
        parts.push(`--- Page ${i} ---\n${data.text.trim()}`);
        setProgress(Math.round((i / total) * 100));
        setText(parts.join("\n\n"));
      }

      await worker.terminate();
      setStatus("Done");
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

  const download = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (file?.name.replace(/\.pdf$/i, "") || "ocr") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div>
        <Label>Language</Label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>
      <Button onClick={run} disabled={!file || busy}>
        <ScanText />
        {busy ? `Working… ${progress}%` : "Extract text from PDF"}
      </Button>
      {busy && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">{status}</p>
        </div>
      )}
      {text && (
        <div>
          <Textarea readOnly value={text} className="min-h-[320px] font-mono text-sm" />
          <div className="mt-2 flex gap-2">
            <Button variant="outline" onClick={copy}><Copy /> Copy text</Button>
            <Button variant="outline" onClick={download}><Download /> Download .txt</Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}