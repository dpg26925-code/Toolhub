import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RemoveBackgroundTool() {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [slider, setSlider] = useState(50);
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

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <p className="text-xs text-muted-foreground">
        Runs a neural network entirely in your browser — the first run downloads the model (~40 MB) and may take a moment.
      </p>
      <Button onClick={run} disabled={!file || busy}>
        {busy ? "Removing background…" : "Remove background"}
      </Button>
      {original && result && (
        <div className="space-y-3">
          <div
            className="relative w-full overflow-hidden rounded-xl border border-border"
            style={{
              backgroundImage:
                "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, transparent 0% 50%) 50% / 20px 20px",
            }}
          >
            <img src={original} alt="original" className="block w-full" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${slider}%` }}>
              <img
                src={result}
                alt="result"
                className="block h-full max-w-none"
                style={{ width: `${(100 / Math.max(slider, 1)) * 100}%` }}
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={slider}
            onChange={(e) => setSlider(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <Button asChild variant="outline">
            <a href={result} download="no-background.png">Download PNG</a>
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}