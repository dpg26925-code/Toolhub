import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MetaTagGeneratorTool() {
  const [title, setTitle] = useState("My Awesome Page");
  const [description, setDescription] = useState("A concise, keyword-rich page description under 160 characters.");
  const [url, setUrl] = useState("https://example.com/");
  const [image, setImage] = useState("https://example.com/og.jpg");
  const [author, setAuthor] = useState("");
  const [twitter, setTwitter] = useState("@handle");
  const [type, setType] = useState("website");

  const html = useMemo(() => {
    const lines = [
      `<title>${title}</title>`,
      `<meta name="description" content="${description}" />`,
      author && `<meta name="author" content="${author}" />`,
      `<link rel="canonical" href="${url}" />`,
      `<meta property="og:title" content="${title}" />`,
      `<meta property="og:description" content="${description}" />`,
      `<meta property="og:type" content="${type}" />`,
      `<meta property="og:url" content="${url}" />`,
      image && `<meta property="og:image" content="${image}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      twitter && `<meta name="twitter:site" content="${twitter}" />`,
      `<meta name="twitter:title" content="${title}" />`,
      `<meta name="twitter:description" content="${description}" />`,
      image && `<meta name="twitter:image" content="${image}" />`,
    ].filter(Boolean).join("\n");
    return lines;
  }, [title, description, url, image, author, twitter, type]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <div><Label>Page title <span className="text-xs text-muted-foreground">({title.length}/60)</span></Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1"/></div>
        <div><Label>Description <span className="text-xs text-muted-foreground">({description.length}/160)</span></Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-[80px]"/></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Canonical URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1"/></div>
          <div><Label>OG type</Label><select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option>website</option><option>article</option><option>product</option><option>video.other</option></select></div>
          <div><Label>OG image URL</Label><Input value={image} onChange={(e) => setImage(e.target.value)} className="mt-1"/></div>
          <div><Label>Author</Label><Input value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1"/></div>
          <div><Label>Twitter handle</Label><Input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="mt-1"/></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><Label>Generated HTML</Label><Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(html); toast.success("Copied"); }}>Copy</Button></div>
        <Textarea readOnly value={html} className="min-h-[380px] font-mono text-xs"/>
      </div>
    </div>
  );
}