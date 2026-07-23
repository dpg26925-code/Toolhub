import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [title, setTitle] = useState("Amazing free tool for developers");
  const [desc, setDesc] = useState("Format, validate and minify JSON in seconds. 100% free, in-browser.");
  const [img, setImg] = useState("https://picsum.photos/1200/630");
  const [url, setUrl] = useState("https://example.com/tools/json");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1"/></div>
        <div><Label>URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1"/></div>
        <div className="sm:col-span-2"><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1"/></div>
        <div className="sm:col-span-2"><Label>Image URL (1200×630 recommended)</Label><Input value={img} onChange={(e) => setImg(e.target.value)} className="mt-1"/></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Preview title="Facebook / LinkedIn" bg="#f0f2f5">
          <div className="border-b bg-white"><img src={img} alt="" className="aspect-[1.91/1] w-full object-cover"/></div>
          <div className="bg-white p-3"><div className="text-xs uppercase text-muted-foreground">{new URL(url || "http://x").hostname}</div><div className="mt-1 font-semibold">{title}</div><div className="mt-1 text-sm text-muted-foreground line-clamp-2">{desc}</div></div>
        </Preview>
        <Preview title="Twitter/X (large card)" bg="#15202b">
          <img src={img} alt="" className="aspect-[1.91/1] w-full rounded-t-lg object-cover"/>
          <div className="rounded-b-lg bg-white p-3 dark:bg-slate-800"><div className="font-semibold">{title}</div><div className="mt-1 text-sm text-muted-foreground line-clamp-2">{desc}</div><div className="mt-1 text-xs text-muted-foreground">{new URL(url || "http://x").hostname}</div></div>
        </Preview>
      </div>
      <div className="rounded-lg border p-3">
        <Textarea readOnly className="min-h-[160px] font-mono text-xs" value={`<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${desc}" />\n<meta property="og:image" content="${img}" />\n<meta property="og:url" content="${url}" />\n<meta property="og:type" content="website" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${desc}" />\n<meta name="twitter:image" content="${img}" />`}/>
      </div>
    </div>
  );
}
function Preview({ title, bg, children }: { title: string; bg: string; children: React.ReactNode }) {
  return <div><div className="mb-2 text-xs text-muted-foreground">{title}</div><div className="overflow-hidden rounded-lg border" style={{ background: bg }}>{children}</div></div>;
}