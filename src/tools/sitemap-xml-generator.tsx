import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function SitemapXmlGeneratorTool() {
  const [urls, setUrls] = useState("https://example.com/\nhttps://example.com/about\nhttps://example.com/blog");
  const [priority, setPriority] = useState("0.8");
  const [changefreq, setChangefreq] = useState("weekly");
  const [lastmod, setLastmod] = useState("");

  const { xml, errors } = useMemo(() => {
    const list = urls.split("\n").map(l => l.trim()).filter(Boolean);
    const errs: string[] = [];
    const seen = new Set<string>();
    list.forEach(u => {
      if (!/^https?:\/\//i.test(u)) errs.push(`Invalid URL (needs http/https): ${u}`);
      if (seen.has(u)) errs.push(`Duplicate: ${u}`);
      seen.add(u);
    });
    const body = list.map(u => {
      const parts = [`    <loc>${u.replace(/&/g, "&amp;")}</loc>`];
      if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
      if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
      if (priority) parts.push(`    <priority>${priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    }).join("\n");
    return { xml: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, errors: errs };
  }, [urls, priority, changefreq, lastmod]);

  const download = () => {
    const blob = new Blob([xml], { type: "application/xml" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sitemap.xml"; a.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>URLs (one per line)</Label>
        <Textarea rows={8} className="mt-1 font-mono text-sm" value={urls} onChange={(e) => setUrls(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Priority</Label><Input className="mt-1" value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="0.0–1.0" /></div>
        <div>
          <Label>Change frequency</Label>
          <select className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={changefreq} onChange={(e) => setChangefreq(e.target.value)}>
            <option value="">(none)</option>
            {["always","hourly","daily","weekly","monthly","yearly","never"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><Label>Last modified</Label><Input type="date" className="mt-1" value={lastmod} onChange={(e) => setLastmod(e.target.value)} /></div>
      </div>
      {errors.length > 0 && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {errors.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}
      <div><Label>Output</Label><Textarea rows={12} className="mt-1 font-mono text-xs" value={xml} readOnly /></div>
      <div className="flex gap-2">
        <Button onClick={() => { navigator.clipboard.writeText(xml); toast.success("Copied"); }}>Copy</Button>
        <Button variant="outline" onClick={download}>Download sitemap.xml</Button>
      </div>
    </div>
  );
}