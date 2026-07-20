import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OgPreviewTool() {
  const [title, setTitle] = useState("Nexatools — 130+ free tools");
  const [description, setDescription] = useState("PDF, image, video, AI writing and dev utilities. 100% in-browser, no signup.");
  const [url, setUrl] = useState("nexatools.app");
  const [image, setImage] = useState("");
  const [site, setSite] = useState("@nexatools");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1"/></div>
        <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-[80px]"/></div>
        <div><Label>Display URL / domain</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1"/></div>
        <div><Label>Image URL (1200×630 recommended)</Label><Input value={image} onChange={(e) => setImage(e.target.value)} className="mt-1"/></div>
        <div><Label>Twitter site handle</Label><Input value={site} onChange={(e) => setSite(e.target.value)} className="mt-1"/></div>
      </div>
      <div className="space-y-6">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Facebook / LinkedIn</div>
          <div className="overflow-hidden rounded-lg border">
            {image ? <img src={image} alt="" className="aspect-[1.91/1] w-full object-cover bg-muted"/> : <div className="aspect-[1.91/1] w-full bg-muted"/>}
            <div className="border-t bg-muted/40 p-3">
              <div className="text-[11px] uppercase text-muted-foreground">{url}</div>
              <div className="mt-0.5 line-clamp-1 font-semibold">{title}</div>
              <div className="line-clamp-2 text-sm text-muted-foreground">{description}</div>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Twitter / X (summary_large_image)</div>
          <div className="overflow-hidden rounded-2xl border">
            {image ? <img src={image} alt="" className="aspect-[1.91/1] w-full object-cover bg-muted"/> : <div className="aspect-[1.91/1] w-full bg-muted"/>}
            <div className="p-3">
              <div className="text-xs text-muted-foreground">{url}</div>
              <div className="mt-0.5 line-clamp-1 font-semibold">{title}</div>
              <div className="line-clamp-2 text-sm text-muted-foreground">{description}</div>
              {site && <div className="mt-1 text-xs text-muted-foreground">{site}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}