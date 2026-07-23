import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Rule = { agent: string; allow: string; disallow: string; crawlDelay: string };
const PRESETS: Record<string, Rule[]> = {
  custom: [{ agent: "*", allow: "/", disallow: "", crawlDelay: "" }],
  wordpress: [{ agent: "*", allow: "/wp-content/uploads/", disallow: "/wp-admin/\n/wp-includes/\n/?s=\n/search/", crawlDelay: "" }],
  shopify: [{ agent: "*", allow: "", disallow: "/admin\n/cart\n/orders\n/checkouts/\n/checkout\n/carts\n/account\n/collections/*sort_by*\n/*/collections/*sort_by*\n/*?*oseid=*\n/*preview_theme_id*", crawlDelay: "" }],
  blockAll: [{ agent: "*", allow: "", disallow: "/", crawlDelay: "" }],
};

export default function RobotsTxtGeneratorTool() {
  const [rules, setRules] = useState<Rule[]>(PRESETS.custom);
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");

  const output = useMemo(() => {
    const blocks = rules.map(r => {
      const lines = [`User-agent: ${r.agent || "*"}`];
      r.allow.split("\n").filter(Boolean).forEach(p => lines.push(`Allow: ${p.trim()}`));
      r.disallow.split("\n").filter(Boolean).forEach(p => lines.push(`Disallow: ${p.trim()}`));
      if (r.crawlDelay) lines.push(`Crawl-delay: ${r.crawlDelay}`);
      return lines.join("\n");
    });
    if (sitemap.trim()) blocks.push(`Sitemap: ${sitemap.trim()}`);
    return blocks.join("\n\n") + "\n";
  }, [rules, sitemap]);

  const update = (i: number, patch: Partial<Rule>) => setRules(rs => rs.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "robots.txt"; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(PRESETS).map(k => (
          <Button key={k} type="button" variant="outline" size="sm" onClick={() => setRules(JSON.parse(JSON.stringify(PRESETS[k])))}>{k}</Button>
        ))}
      </div>
      {rules.map((r, i) => (
        <div key={i} className="rounded-md border p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>User-agent</Label><Input className="mt-1" value={r.agent} onChange={e => update(i, { agent: e.target.value })} /></div>
            <div><Label>Crawl-delay (optional)</Label><Input className="mt-1" value={r.crawlDelay} onChange={e => update(i, { crawlDelay: e.target.value })} placeholder="e.g. 10" /></div>
          </div>
          <div><Label>Allow (one path per line)</Label><Textarea rows={3} className="mt-1 font-mono text-sm" value={r.allow} onChange={e => update(i, { allow: e.target.value })} /></div>
          <div><Label>Disallow (one path per line)</Label><Textarea rows={3} className="mt-1 font-mono text-sm" value={r.disallow} onChange={e => update(i, { disallow: e.target.value })} /></div>
          {rules.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => setRules(rs => rs.filter((_, idx) => idx !== i))}>Remove agent</Button>}
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => setRules(rs => [...rs, { agent: "Googlebot", allow: "", disallow: "", crawlDelay: "" }])}>+ Add user-agent block</Button>
      <div><Label>Sitemap URL</Label><Input className="mt-1" value={sitemap} onChange={e => setSitemap(e.target.value)} /></div>
      <div><Label>Output</Label><Textarea rows={10} className="mt-1 font-mono text-sm" value={output} readOnly /></div>
      <div className="flex gap-2">
        <Button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>Copy</Button>
        <Button variant="outline" onClick={download}>Download robots.txt</Button>
      </div>
    </div>
  );
}