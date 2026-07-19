import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getFFmpeg, readFileAsUint8, downloadBlob, humanSize } from "./_ffmpeg";

export default function VideoToGifTool() {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [duration, setDuration] = useState(4);
  const [fps, setFps] = useState(12);
  const [width, setWidth] = useState(480);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [size, setSize] = useState(0);

  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setUrl(null);
    try {
      const ff = await getFFmpeg(undefined, setProgress);
      await ff.writeFile("in", await readFileAsUint8(file));
      await ff.exec([
        "-ss", String(start), "-t", String(duration),
        "-i", "in",
        "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos`,
        "-loop", "0", "out.gif",
      ]);
      const data = await ff.readFile("out.gif");
      const blob = new Blob([data as Uint8Array], { type: "image/gif" });
      setUrl(URL.createObjectURL(blob));
      setSize(blob.size);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="video/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUrl(null); }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div><Label>Start (s)</Label><Input type="number" min={0} step={0.1} value={start} onChange={(e) => setStart(+e.target.value)} className="mt-1" /></div>
        <div><Label>Duration (s)</Label><Input type="number" min={0.1} step={0.1} value={duration} onChange={(e) => setDuration(+e.target.value)} className="mt-1" /></div>
        <div><Label>FPS</Label><Input type="number" min={1} max={30} value={fps} onChange={(e) => setFps(+e.target.value)} className="mt-1" /></div>
        <div><Label>Width (px)</Label><Input type="number" min={80} max={1920} step={10} value={width} onChange={(e) => setWidth(+e.target.value)} className="mt-1" /></div>
      </div>
      <Button onClick={run} disabled={!file || busy}>{busy ? `Converting… ${Math.round(progress * 100)}%` : "Convert to GIF"}</Button>
      {busy && <p className="text-xs text-muted-foreground">First run downloads ~30 MB ffmpeg core. Cached after that.</p>}
      {url && (
        <div className="space-y-2 rounded-xl border border-border bg-background p-4">
          <img src={url} alt="GIF preview" className="max-h-96 rounded" />
          <p className="text-sm text-muted-foreground">Size: {humanSize(size)}</p>
          <Button variant="outline" onClick={() => downloadBlob(new Uint8Array([]), "", "")}><a href={url} download="clip.gif">Download GIF</a></Button>
        </div>
      )}
    </div>
  );
}