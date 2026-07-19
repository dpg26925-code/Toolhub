import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getFFmpeg, readFileAsUint8, humanSize } from "./_ffmpeg";

export default function VideoCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [crf, setCrf] = useState("28");
  const [preset, setPreset] = useState("veryfast");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState(0);

  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setUrl(null);
    try {
      const ff = await getFFmpeg(undefined, setProgress);
      await ff.writeFile("in", await readFileAsUint8(file));
      await ff.exec([
        "-i", "in",
        "-c:v", "libx264", "-preset", preset, "-crf", crf,
        "-c:a", "aac", "-b:a", "128k",
        "out.mp4",
      ]);
      const data = await ff.readFile("out.mp4");
      const blob = new Blob([data as unknown as BlobPart], { type: "video/mp4" });
      setUrl(URL.createObjectURL(blob));
      setOutSize(blob.size);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Compression failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="video/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUrl(null); }} />
      {file && <p className="text-sm text-muted-foreground">Input size: {humanSize(file.size)}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Quality (CRF — lower = better)</Label>
          <Select value={crf} onValueChange={setCrf}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="18">18 — High quality</SelectItem>
              <SelectItem value="23">23 — Balanced</SelectItem>
              <SelectItem value="28">28 — Recommended</SelectItem>
              <SelectItem value="32">32 — Small file</SelectItem>
              <SelectItem value="36">36 — Very small</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Speed preset</Label>
          <Select value={preset} onValueChange={setPreset}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ultrafast">Ultrafast</SelectItem>
              <SelectItem value="veryfast">Very fast</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="slow">Slow (better compression)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={run} disabled={!file || busy}>{busy ? `Compressing… ${Math.round(progress * 100)}%` : "Compress video"}</Button>
      {url && (
        <div className="space-y-2 rounded-xl border border-border bg-background p-4">
          <video src={url} controls className="max-h-96 w-full rounded" />
          <p className="text-sm text-muted-foreground">
            {file && `${humanSize(file.size)} → ${humanSize(outSize)} (${Math.round((1 - outSize / file.size) * 100)}% smaller)`}
          </p>
          <Button variant="outline" asChild><a href={url} download={`compressed-${file?.name ?? "video.mp4"}`}>Download</a></Button>
        </div>
      )}
    </div>
  );
}