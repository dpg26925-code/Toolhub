import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RemoveBackgroundTool() {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = (f: File | null) => {
    setFile(f);
    setResult(null);
    setError(null);
    setOriginal(f ? URL.createObjectURL(f) : null);
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(file);
      setResult(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Background removal failed");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setOriginal(null);
    setResult(null);
    setError(null);
  };

  const checker = {
    backgroundImage:
      "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, transparent 0% 50%) 50% / 20px 20px",
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <p className="text-xs text-muted-foreground">
        Runs a neural network entirely in your browser — the first run downloads the model (~40 MB) and may take a moment.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={run} disabled={!file || busy}>
          {busy ? "Removing background…" : "Remove background"}
        </Button>
        {(file || result) && (
          <Button variant="outline" onClick={reset} disabled={busy}>
            Try another image
          </Button>
        )}
      </div>
      {original && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <figure className="space-y-2">
            <figcaption className="text-xs font-medium text-muted-foreground">Original</figcaption>
            <div className="overflow-hidden rounded-xl border border-border">
              <img src={original} alt="original" className="block w-full" />
            </div>
          </figure>
          <figure className="space-y-2">
            <figcaption className="text-xs font-medium text-muted-foreground">
              {result ? "Background removed" : busy ? "Processing…" : "Result will appear here"}
            </figcaption>
            <div className="overflow-hidden rounded-xl border border-border" style={checker}>
              {result ? (
                <img src={result} alt="result" className="block w-full" />
              ) : (
                <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">
                  {busy ? "Removing background…" : "—"}
                </div>
              )}
            </div>
          </figure>
        </div>
      )}
      {result && (
        <Button asChild variant="outline">
          <a href={result} download="no-background.png">Download PNG</a>
        </Button>
      )}
      {error && (
        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button size="sm" variant="outline" onClick={run} disabled={!file || busy}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}