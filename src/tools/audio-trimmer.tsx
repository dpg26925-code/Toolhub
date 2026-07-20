import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

function bufferToWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels, sr = buffer.sampleRate, len = buffer.length * numCh * 2 + 44;
  const buf = new ArrayBuffer(len); const view = new DataView(buf);
  const writeStr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF"); view.setUint32(4, len - 8, true); writeStr(8, "WAVE"); writeStr(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true); view.setUint32(28, sr * numCh * 2, true); view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true); writeStr(36, "data"); view.setUint32(40, buffer.length * numCh * 2, true);
  let off = 44;
  const chs = Array.from({ length: numCh }, (_, i) => buffer.getChannelData(i));
  for (let i = 0; i < buffer.length; i++) for (let c = 0; c < numCh; c++) {
    const s = Math.max(-1, Math.min(1, chs[c][i])); view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true); off += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}

export default function AudioTrimmerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [dur, setDur] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const onFile = (f: File | null) => {
    setFile(f); setUrl(null); setRange([0, 0]); setDur(0);
    if (!f) return;
    const el = new Audio(URL.createObjectURL(f));
    el.onloadedmetadata = () => { setDur(el.duration); setRange([0, el.duration]); };
  };

  const trim = async () => {
    if (!file || dur === 0) return;
    setBusy(true);
    try {
      const ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const src = await ac.decodeAudioData(await file.arrayBuffer());
      const [s, e] = range; const start = Math.floor(s * src.sampleRate); const end = Math.floor(e * src.sampleRate);
      const out = ac.createBuffer(src.numberOfChannels, end - start, src.sampleRate);
      for (let c = 0; c < src.numberOfChannels; c++) out.copyToChannel(src.getChannelData(c).slice(start, end), c);
      setUrl(URL.createObjectURL(bufferToWav(out)));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Trim failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="audio/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {file && <audio ref={audioRef} controls src={URL.createObjectURL(file)} className="w-full"/>}
      {dur > 0 && (
        <>
          <div><Label>Start: {range[0].toFixed(2)}s → End: {range[1].toFixed(2)}s ({(range[1]-range[0]).toFixed(2)}s)</Label>
            <Slider className="mt-3" min={0} max={dur} step={0.01} value={range} onValueChange={(v) => setRange([v[0], v[1]] as [number, number])}/>
          </div>
          <div className="flex gap-3">
            <Button onClick={trim} disabled={busy}>{busy ? "Trimming…" : "Trim to WAV"}</Button>
            {url && <Button asChild variant="outline"><a href={url} download="trimmed.wav">Download WAV</a></Button>}
          </div>
        </>
      )}
    </div>
  );
}