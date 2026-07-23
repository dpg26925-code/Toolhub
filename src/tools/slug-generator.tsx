import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SlugGeneratorTool() {
  const [text, setText] = useState("My Blog Post Title!");
  const [separator, setSeparator] = useState("-");
  const [maxLen, setMaxLen] = useState(80);
  const [lower, setLower] = useState(true);
  const [stripSpecial, setStripSpecial] = useState(true);

  const slug = useMemo(() => {
    let s = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    if (lower) s = s.toLowerCase();
    if (stripSpecial) s = s.replace(/[^a-zA-Z0-9\s-_]/g, "");
    s = s.trim().replace(/[\s_-]+/g, separator);
    s = s.replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "");
    if (maxLen > 0 && s.length > maxLen) s = s.slice(0, maxLen).replace(new RegExp(`${separator}[^${separator}]*$`), "");
    return s;
  }, [text, separator, maxLen, lower, stripSpecial]);

  return (
    <div className="space-y-6">
      <div>
        <Label>Text / Title</Label>
        <Textarea className="mt-1" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Separator</Label>
          <div className="mt-1 flex gap-2">
            <Button type="button" variant={separator === "-" ? "default" : "outline"} size="sm" onClick={() => setSeparator("-")}>hyphen (-)</Button>
            <Button type="button" variant={separator === "_" ? "default" : "outline"} size="sm" onClick={() => setSeparator("_")}>underscore (_)</Button>
          </div>
        </div>
        <div>
          <Label>Max length</Label>
          <Input type="number" min={0} value={maxLen} onChange={(e) => setMaxLen(Number(e.target.value))} className="mt-1" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between"><Label>Lowercase</Label><Switch checked={lower} onCheckedChange={setLower} /></div>
          <div className="flex items-center justify-between"><Label>Strip special chars</Label><Switch checked={stripSpecial} onCheckedChange={setStripSpecial} /></div>
        </div>
      </div>
      <div>
        <Label>Slug preview</Label>
        <div className="mt-1 rounded-md border bg-muted/40 px-3 py-3 font-mono text-sm break-all">{slug || <span className="text-muted-foreground">(empty)</span>}</div>
      </div>
      <Button onClick={() => { navigator.clipboard.writeText(slug); toast.success("Copied"); }} disabled={!slug}>Copy slug</Button>
    </div>
  );
}