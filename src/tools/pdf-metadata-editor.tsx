import { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Meta = { title: string; author: string; subject: string; keywords: string; creator: string; producer: string };
const empty: Meta = { title: "", author: "", subject: "", keywords: "", creator: "", producer: "" };

export default function PdfMetadataEditorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<Meta>(empty);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!file) return;
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      setMeta({
        title: doc.getTitle() ?? "",
        author: doc.getAuthor() ?? "",
        subject: doc.getSubject() ?? "",
        keywords: (doc.getKeywords() ?? "").toString(),
        creator: doc.getCreator() ?? "",
        producer: doc.getProducer() ?? "",
      });
    })();
  }, [file]);

  const save = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      doc.setTitle(meta.title); doc.setAuthor(meta.author); doc.setSubject(meta.subject);
      doc.setKeywords(meta.keywords ? meta.keywords.split(",").map((s) => s.trim()) : []);
      doc.setCreator(meta.creator); doc.setProducer(meta.producer);
      const bytes = await doc.save();
      setUrl(URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })));
    } finally { setBusy(false); }
  };

  const field = (k: keyof Meta, label: string) => (
    <div><Label>{label}</Label><Input value={meta[k]} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} className="mt-1"/></div>
  );

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUrl(null); }} />
      {file && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {field("title", "Title")}{field("author", "Author")}{field("subject", "Subject")}
            {field("keywords", "Keywords (comma-separated)")}{field("creator", "Creator")}{field("producer", "Producer")}
          </div>
          <div className="flex gap-3">
            <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save metadata"}</Button>
            {url && <Button asChild variant="outline"><a href={url} download="updated.pdf">Download updated.pdf</a></Button>}
          </div>
        </>
      )}
    </div>
  );
}