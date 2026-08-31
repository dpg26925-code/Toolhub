import { useEffect, useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FileUp,
  Download,
  FileCheck,
  Zap,
  ShieldCheck,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    url: string;
    original: number;
    compressed: number;
    originalMB: string;
    compressedMB: string;
    savedPercent: number;
    filename: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result?.url]);

  const handleFileChange = (newFile: File | null) => {
    if (!newFile) return;

    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    setResult(null);
    setError(null);
    setProgress(0);

    if (
      newFile.type !== "application/pdf" &&
      !newFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      setError("This file is not a valid PDF");
      toast.error("This file is not a valid PDF");
      return;
    }

    if (newFile.size > 50 * 1024 * 1024) {
      setFile(newFile);
      setError("File too large. Max 50MB.");
      toast.error("File too large. Max 50MB.");
      return;
    }

    setFile(newFile);
  };

  const handleCompress = async () => {
    if (!file) {
      toast.error("Please select a PDF file first");
      return;
    }

    if (
      typeof window === "undefined" ||
      !window.Blob ||
      !window.URL ||
      typeof ArrayBuffer === "undefined"
    ) {
      setError("Your browser doesn't support this operation");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File too large. Max 50MB.");
      setResult(null);
      return;
    }

    setBusy(true);
    setError(null);
    setProgress(25);

    try {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
        setResult(null);
      }

      const arrayBuffer = await file.arrayBuffer();
      setProgress(50);

      let pdfDoc: PDFDocument;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
          updateMetadata: false,
        });
      } catch {
        throw new Error("This file is not a valid PDF");
      }

      setProgress(75);

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const outLength = compressedBytes.byteLength;
      const originalLength = file.size;
      const savedBytes = Math.max(0, originalLength - outLength);
      const savedPercent =
        originalLength > 0 ? Math.round((savedBytes / originalLength) * 100) : 0;

      const blob = new Blob([compressedBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const outputFilename = `${baseName}-compressed.pdf`;

      const originalMB = (originalLength / (1024 * 1024)).toFixed(2);
      const compressedMB = (outLength / (1024 * 1024)).toFixed(2);

      setResult({
        url,
        original: originalLength,
        compressed: outLength,
        originalMB,
        compressedMB,
        savedPercent,
        filename: outputFilename,
      });

      setProgress(100);
      toast.success("PDF compressed successfully!");
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : "";
      if (
        /valid pdf/i.test(msg) ||
        /parse|encrypt|corrupt|header|trailer/i.test(msg)
      ) {
        setError("This file is not a valid PDF");
      } else if (/browser/i.test(msg)) {
        setError("Your browser doesn't support this operation");
      } else {
        setError(msg || "This file is not a valid PDF");
      }
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    if (!result?.url) {
      toast.error("Please compress a PDF first");
      return;
    }
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloaded ${result.filename}`);
  };

  const handleReset = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      {/* Left Column: Upload & Action */}
      <div className="space-y-5">
        {/* Upload Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) handleFileChange(dropped);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-brand bg-brand/5 shadow-inner"
              : file
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-border bg-card hover:border-brand/50 hover:bg-muted/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null;
              handleFileChange(selected);
            }}
          />

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand group-hover:scale-105 transition-transform">
            {file ? (
              <FileCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FileUp className="h-7 w-7" />
            )}
          </div>

          <h3 className="text-base font-semibold text-foreground">
            {file ? file.name : "Choose a PDF or drag & drop here"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {file
              ? `${formatBytes(file.size)} · Ready to compress`
              : "Supports standard documents up to 50MB — 100% private in browser"}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button size="sm" variant="secondary" className="pointer-events-none">
              {file ? "Change File" : "Select PDF File"}
            </Button>
            {!file && (
              <Button
                size="sm"
                variant="outline"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    toast.info("Generating sample PDF document…");
                    const doc = await PDFDocument.create();
                    for (let p = 1; p <= 3; p++) {
                      const page = doc.addPage([595.28, 841.89]);
                      page.drawText(`Nexatools Sample Document - Page ${p}`, {
                        x: 50,
                        y: 780,
                        size: 20,
                      });
                      page.drawText(
                        "This sample PDF demonstrates client-side compression and object stream optimization.",
                        { x: 50, y: 740, size: 12 }
                      );
                      page.drawText(
                        "Nexatools runs 100% locally in your browser memory for fast, secure file operations.",
                        { x: 50, y: 710, size: 12 }
                      );
                    }
                    const pdfBytes = await doc.save();
                    const sampleFile = new File([new Uint8Array(pdfBytes)], "sample-document.pdf", {
                      type: "application/pdf",
                    });
                    handleFileChange(sampleFile);
                  } catch {
                    toast.error("Failed to generate sample PDF");
                  }
                }}
                className="text-xs"
              >
                <Zap className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                Test with Sample PDF
              </Button>
            )}
          </div>
        </div>

        {/* Compression Action Box */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-foreground">
              PDF Compression Engine
            </Label>
            <span className="text-xs text-muted-foreground">pdf-lib object streams</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCompress}
              disabled={!file || busy}
              className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
              size="lg"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Compress PDF
                </>
              )}
            </Button>
            {file && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={busy}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        {busy && (
          <div className="space-y-2 rounded-xl border border-brand/20 bg-brand/5 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-brand">
              <span>Compressing PDF in memory…</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Error: </strong>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Output & Action */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Compression Summary
          </h3>

          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Original Size</span>
                  <span className="font-medium text-foreground">
                    {result.originalMB} MB ({formatBytes(result.original)})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Compressed Size</span>
                  <span className="font-semibold text-foreground">
                    {result.compressedMB} MB ({formatBytes(result.compressed)})
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs">
                  <span className="text-muted-foreground">Result</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Original: {result.originalMB} MB → Compressed: {result.compressedMB} MB ({result.savedPercent}% smaller)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleDownload}
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Compressed PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
              <p>No file compressed yet.</p>
              <p className="text-[11px] text-muted-foreground/70">
                Select a PDF file and click &quot;Compress PDF&quot; to optimize size and download.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">🔒 100% Client-Side Privacy</p>
          <p className="leading-relaxed">
            Your PDF is never uploaded to any remote server. All compression and stream optimization
            are processed entirely in your browser memory.
          </p>
        </div>
      </div>
    </div>
  );
}