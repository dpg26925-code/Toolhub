import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getFFmpeg, readFileAsUint8, humanSize } from "./_ffmpeg";

export default function VideoToMp3Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState("192k");
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
      await ff.exec(["-i", "in", "-vn", "-c:a", "libmp3lame", "-b:a", bitrate, "out.mp3"]);
      const data = await ff.readFile("out.mp3");
      const blob = new Blob([data as Uint8Array], { type: "audio/mpeg" });
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
      <div>
        <Label>Bitrate</Label>
        <Select value={bitrate} onValueChange={setBitrate}>
          <SelectTrigger className="mt-1 max-w-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="96k">96 kbps (smallest)</SelectItem>
            <SelectItem value="128k">128 kbps</SelectItem>
            <SelectItem value="192k">192 kbps (recommended)</SelectItem>
            <SelectItem value="256k">256 kbps</SelectItem>
            <SelectItem value="320k">320 kbps (best)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={run} disabled={!file || busy}>{busy ? `Converting… ${Math.round(progress * 100)}%` : "Convert to MP3"}</Button>
      {url && (
        <div className="space-y-2 rounded-xl border border-border bg-background p-4">
          <audio src={url} controls className="w-full" />
          <p className="text-sm text-muted-foreground">Size: {humanSize(size)}</p>
          <Button variant="outline" asChild><a href={url} download="audio.mp3">Download MP3</a></Button>
        </div>
      )}
    </div>
  );
}