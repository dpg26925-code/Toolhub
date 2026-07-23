import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getFFmpeg, readFileAsUint8, humanSize } from "./_ffmpeg";

type Fmt = "mp4" | "webm" | "mov" | "mkv";

export default function Mp4ConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Fmt>("mp4");
  const [scale, setScale] = useState("source");
  const [crf, setCrf] = useState("23");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [size, setSize] = useState(0);

  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setUrl(null);
    try {
      const ff = await getFFmpeg(undefined, setProgress);
      await ff.writeFile("in", await readFileAsUint8(file));
      const args: string[] = ["-i", "in"];
      if (scale !== "source") args.push("-vf", `scale=-2:${scale}`);
      if (format === "webm") args.push("-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0", "-c:a", "libopus");
      else args.push("-c:v", "libx264", "-preset", "veryfast", "-crf", crf, "-c:a", "aac", "-b:a", "128k");
      const out = `out.${format}`;
      args.push(out);
      await ff.exec(args);
      const data = await ff.readFile(out);
      const mime = format === "webm" ? "video/webm" : format === "mov" ? "video/quicktime" : format === "mkv" ? "video/x-matroska" : "video/mp4";
      const blob = new Blob([data as unknown as BlobPart], { type: mime });
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
      {file && <p className="text-sm text-muted-foreground">Input: {file.name} · {humanSize(file.size)}</p>}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as Fmt)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mp4">MP4 (H.264)</SelectItem>
              <SelectItem value="webm">WebM (VP9)</SelectItem>
              <SelectItem value="mov">MOV</SelectItem>
              <SelectItem value="mkv">MKV</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Resolution</Label>
          <Select value={scale} onValueChange={setScale}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="source">Source</SelectItem>
              <SelectItem value="480">480p</SelectItem>
              <SelectItem value="720">720p</SelectItem>
              <SelectItem value="1080">1080p</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Quality (CRF)</Label>
          <Select value={crf} onValueChange={setCrf}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="18">18 · High</SelectItem>
              <SelectItem value="23">23 · Balanced</SelectItem>
              <SelectItem value="28">28 · Small</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={run} disabled={!file || busy}>{busy ? `Converting… ${Math.round(progress * 100)}%` : `Convert to ${format.toUpperCase()}`}</Button>
      {url && (
        <div className="space-y-2 rounded-xl border border-border bg-background p-4">
          <video src={url} controls className="max-h-96 w-full rounded" />
          <p className="text-sm text-muted-foreground">Output size: {humanSize(size)}</p>
          <Button variant="outline" asChild><a href={url} download={`converted.${format}`}>Download .{format}</a></Button>
        </div>
      )}
    </div>
  );
}