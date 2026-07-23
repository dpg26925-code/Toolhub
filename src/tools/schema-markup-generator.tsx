import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [type, setType] = useState("Article");
  const [fields, setFields] = useState({ headline: "How to compress a PDF", author: "Jane Doe", datePublished: "2026-01-01", image: "https://example.com/img.jpg", description: "Compress PDFs in your browser." });

  const schema = useMemo(() => {
    const base: any = { "@context": "https://schema.org", "@type": type };
    if (type === "Article") Object.assign(base, { headline: fields.headline, author: { "@type": "Person", name: fields.author }, datePublished: fields.datePublished, image: fields.image, description: fields.description });
    if (type === "Product") Object.assign(base, { name: fields.headline, description: fields.description, image: fields.image, brand: { "@type": "Brand", name: fields.author } });
    if (type === "FAQPage") Object.assign(base, { mainEntity: [{ "@type": "Question", name: fields.headline, acceptedAnswer: { "@type": "Answer", text: fields.description } }] });
    if (type === "Organization") Object.assign(base, { name: fields.headline, url: fields.image, description: fields.description });
    return JSON.stringify(base, null, 2);
  }, [type, fields]);

  const wrapped = `<script type="application/ld+json">\n${schema}\n</script>`;

  return (
    <div className="space-y-3">
      <div><Label>Schema type</Label><Select value={type} onValueChange={setType}><SelectTrigger className="mt-1 max-w-xs"><SelectValue/></SelectTrigger><SelectContent>{["Article", "Product", "FAQPage", "Organization"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(fields) as (keyof typeof fields)[]).map((k) => (
          <div key={k}><Label className="capitalize">{k}</Label><Input value={fields[k]} onChange={(e) => setFields((f) => ({ ...f, [k]: e.target.value }))} className="mt-1"/></div>
        ))}
      </div>
      <Textarea readOnly value={wrapped} className="min-h-[240px] font-mono text-xs"/>
      <Button variant="outline" onClick={() => navigator.clipboard.writeText(wrapped)}>Copy</Button>
    </div>
  );
}