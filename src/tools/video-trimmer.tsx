import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getFFmpeg, readFileAsUint8, humanSize } from "./_ffmpeg";

export default function VideoTrimmerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [size, setSize] = useState(0);

  const run = async () => {
    if (!file || end <= start) return;
    setBusy(true); setProgress(0); setUrl(null);
    try {
      const ff = await getFFmpeg(undefined, setProgress);
      const ext = file.name.split(".").pop() || "mp4";
      await ff.writeFile(`in.${ext}`, await readFileAsUint8(file));
      const out = `out.${ext}`;
      await ff.exec([
        "-ss", String(start), "-to", String(end),
        "-i", `in.${ext}`,
        "-c", "copy", out,
      ]);
      const data = await ff.readFile(out);
      const blob = new Blob([data as unknown as BlobPart], { type: file.type || "video/mp4" });
      setUrl(URL.createObjectURL(blob));
      setSize(blob.size);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Trim failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="video/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUrl(null); }} />
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Start (seconds)</Label><Input type="number" min={0} step={0.1} value={start} onChange={(e) => setStart(+e.target.value)} className="mt-1" /></div>
        <div><Label>End (seconds)</Label><Input type="number" min={0} step={0.1} value={end} onChange={(e) => setEnd(+e.target.value)} className="mt-1" /></div>
      </div>
      <Button onClick={run} disabled={!file || busy || end <= start}>{busy ? `Trimming… ${Math.round(progress * 100)}%` : "Trim video"}</Button>
      {url && (
        <div className="space-y-2 rounded-xl border border-border bg-background p-4">
          <video src={url} controls className="max-h-96 w-full rounded" />
          <p className="text-sm text-muted-foreground">Size: {humanSize(size)}</p>
          <Button variant="outline" asChild><a href={url} download={`trimmed-${file?.name ?? "video.mp4"}`}>Download</a></Button>
        </div>
      )}
    </div>
  );
}