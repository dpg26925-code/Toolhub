import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [rows, setRows] = useState("en-us https://example.com/en/\nen-gb https://example.com/uk/\nde-de https://example.com/de/\nfr-fr https://example.com/fr/\nx-default https://example.com/");
  const tags = useMemo(() => rows.split("\n").filter(Boolean).map((line) => {
    const [lang, href] = line.split(/\s+/);
    return `<link rel="alternate" hreflang="${lang}" href="${href}" />`;
  }).join("\n"), [rows]);
  return (
    <div className="space-y-3">
      <div><Label>Language pairs (lang URL per line)</Label><Textarea value={rows} onChange={(e) => setRows(e.target.value)} className="mt-1 min-h-[140px] font-mono text-sm"/></div>
      <Textarea readOnly value={tags} className="min-h-[160px] font-mono text-xs"/>
      <Button variant="outline" onClick={() => navigator.clipboard.writeText(tags)}>Copy tags</Button>
    </div>
  );
}