import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [url, setUrl] = useState("https://example.com/page");
  const tag = useMemo(() => `<link rel="canonical" href="${url}" />`, [url]);
  return (
    <div className="space-y-3">
      <div><Label>Canonical URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1"/></div>
      <div className="rounded-lg border bg-muted p-3 font-mono text-sm">{tag}</div>
      <Button variant="outline" onClick={() => navigator.clipboard.writeText(tag)}>Copy</Button>
      <div className="rounded-lg border p-3 text-xs">Place in the <code>&lt;head&gt;</code> of your page. Use absolute URLs with https and consistent trailing-slash policy across your site.</div>
    </div>
  );
}