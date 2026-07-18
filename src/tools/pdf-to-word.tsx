import { useState } from "react";
import { Document, Packer, Paragraph } from "docx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractPdfText } from "./pdf-text";

export default function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const text = await extractPdfText(await file.arrayBuffer());
      const paragraphs = text.split(/\n{1,}/).map((line) => new Paragraph({ text: line || " " }));
      const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
      const blob = await Packer.toBlob(doc);
      setUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUrl(null); }} />
      <p className="text-xs text-muted-foreground">
        This extracts the text content of your PDF into an editable .docx. Complex layouts, tables and images are not preserved.
      </p>
      <div className="flex gap-3">
        <Button onClick={convert} disabled={!file || busy}>
          {busy ? "Converting…" : "Convert to Word"}
        </Button>
        {url && (
          <Button asChild variant="outline">
            <a href={url} download="converted.docx">Download .docx</a>
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}