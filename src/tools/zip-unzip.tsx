import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { humanSize } from "./_ffmpeg";

type Entry = { name: string; size: number; blob: Blob; url: string };

export default function ZipUnzipTool() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);

  const onFile = async (f: File | null) => {
    if (!f) return;
    setBusy(true); setEntries([]);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(await f.arrayBuffer());
      const out: Entry[] = [];
      for (const [name, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue;
        const blob = await entry.async("blob");
        out.push({ name, size: blob.size, blob, url: URL.createObjectURL(blob) });
      }
      setEntries(out);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed. Password-protected ZIPs aren't supported here.");
    } finally { setBusy(false); }
  };

  const downloadAll = async () => {
    const JSZip = (await import("jszip")).default;
    const z = new JSZip();
    entries.forEach((e) => z.file(e.name, e.blob));
    const blob = await z.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "extracted.zip"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept=".zip,application/zip" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={busy} />
      {busy && <p className="text-sm text-muted-foreground">Reading archive…</p>}
      {entries.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{entries.length} files · {humanSize(entries.reduce((s, e) => s + e.size, 0))}</p>
            <Button variant="outline" onClick={downloadAll}>Repack & download</Button>
          </div>
          <div className="rounded-lg border max-h-96 overflow-auto divide-y">
            {entries.map((e) => (
              <div key={e.name} className="flex items-center justify-between gap-2 p-2 text-sm">
                <span className="truncate font-mono">{e.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{humanSize(e.size)}</span>
                <a href={e.url} download={e.name.split("/").pop()} className="text-xs underline shrink-0">Download</a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}