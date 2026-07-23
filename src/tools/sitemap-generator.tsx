import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [base, setBase] = useState("https://example.com");
  const [paths, setPaths] = useState("/\n/about\n/blog\n/contact");
  const [priority, setPriority] = useState(0.8);
  const [freq, setFreq] = useState("weekly");

  const xml = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const list = paths.split("\n").filter(Boolean).map((p) => p.startsWith("/") ? p.trim() : "/" + p.trim());
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${list.map((p) => `  <url>\n    <loc>${base}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`).join("\n")}\n</urlset>`;
  }, [base, paths, priority, freq]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-3"><Label>Base URL</Label><Input value={base} onChange={(e) => setBase(e.target.value)} className="mt-1"/></div>
        <div><Label>Change frequency</Label><Input value={freq} onChange={(e) => setFreq(e.target.value)} className="mt-1"/></div>
        <div><Label>Priority</Label><Input type="number" step="0.1" min="0" max="1" value={priority} onChange={(e) => setPriority(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div><Label>Paths (one per line)</Label><Textarea value={paths} onChange={(e) => setPaths(e.target.value)} className="mt-1 min-h-[140px] font-mono text-sm"/></div>
      <Textarea readOnly value={xml} className="min-h-[240px] font-mono text-xs"/>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigator.clipboard.writeText(xml)}>Copy</Button>
        <Button variant="outline" onClick={() => { const url = URL.createObjectURL(new Blob([xml], { type: "application/xml" })); const a = document.createElement("a"); a.href = url; a.download = "sitemap.xml"; a.click(); URL.revokeObjectURL(url); }}>Download</Button>
      </div>
    </div>
  );
}