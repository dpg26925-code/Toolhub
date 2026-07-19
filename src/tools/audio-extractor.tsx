import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getFFmpeg, readFileAsUint8, humanSize } from "./_ffmpeg";

type Fmt = "mp3" | "wav" | "aac";

export default function AudioExtractorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Fmt>("mp3");
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
      const args = ["-i", "in", "-vn"];
      if (format === "mp3") args.push("-c:a", "libmp3lame", "-q:a", "2", "out.mp3");
      else if (format === "wav") args.push("-c:a", "pcm_s16le", "out.wav");
      else args.push("-c:a", "aac", "-b:a", "192k", "out.aac");
      await ff.exec(args);
      const data = await ff.readFile(`out.${format}`);
      const mime = format === "mp3" ? "audio/mpeg" : format === "wav" ? "audio/wav" : "audio/aac";
      const blob = new Blob([data as unknown as BlobPart], { type: mime });
      setUrl(URL.createObjectURL(blob));
      setSize(blob.size);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="video/*" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUrl(null); }} />
      <div>
        <Label>Output format</Label>
        <Select value={format} onValueChange={(v) => setFormat(v as Fmt)}>
          <SelectTrigger className="mt-1 max-w-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mp3">MP3</SelectItem>
            <SelectItem value="wav">WAV (lossless)</SelectItem>
            <SelectItem value="aac">AAC</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={run} disabled={!file || busy}>{busy ? `Extracting… ${Math.round(progress * 100)}%` : "Extract audio"}</Button>
      {url && (
        <div className="space-y-2 rounded-xl border border-border bg-background p-4">
          <audio src={url} controls className="w-full" />
          <p className="text-sm text-muted-foreground">Size: {humanSize(size)}</p>
          <Button variant="outline" asChild><a href={url} download={`audio.${format}`}>Download .{format}</a></Button>
        </div>
      )}
    </div>
  );
}