import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [disallow, setDisallow] = useState("/admin\n/private\n/tmp");
  const [allow, setAllow] = useState("");
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");
  const [ua, setUa] = useState("*");

  const out = useMemo(() => {
    const lines = [`User-agent: ${ua}`];
    allow.split("\n").filter(Boolean).forEach((p) => lines.push(`Allow: ${p.trim()}`));
    disallow.split("\n").filter(Boolean).forEach((p) => lines.push(`Disallow: ${p.trim()}`));
    if (sitemap) lines.push("", `Sitemap: ${sitemap}`);
    return lines.join("\n");
  }, [ua, allow, disallow, sitemap]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>User-agent</Label><Input value={ua} onChange={(e) => setUa(e.target.value)} className="mt-1"/></div>
        <div><Label>Sitemap URL</Label><Input value={sitemap} onChange={(e) => setSitemap(e.target.value)} className="mt-1"/></div>
        <div><Label>Allow paths (one per line)</Label><Textarea value={allow} onChange={(e) => setAllow(e.target.value)} className="mt-1 min-h-[100px]"/></div>
        <div><Label>Disallow paths (one per line)</Label><Textarea value={disallow} onChange={(e) => setDisallow(e.target.value)} className="mt-1 min-h-[100px]"/></div>
      </div>
      <Textarea readOnly value={out} className="min-h-[160px] font-mono text-sm"/>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigator.clipboard.writeText(out)}>Copy</Button>
        <Button variant="outline" onClick={() => { const url = URL.createObjectURL(new Blob([out], { type: "text/plain" })); const a = document.createElement("a"); a.href = url; a.download = "robots.txt"; a.click(); URL.revokeObjectURL(url); }}>Download</Button>
      </div>
    </div>
  );
}