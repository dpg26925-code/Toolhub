import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SMALL = new Set(["a","an","the","and","or","but","for","nor","of","in","on","at","to","by","with","from","as","is","if","vs"]);

function titleCase(s: string) {
  const words = s.trim().split(/\s+/);
  return words.map((w, i) => {
    const lower = w.toLowerCase();
    if (i !== 0 && i !== words.length - 1 && SMALL.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(" ");
}

export default function YtTitleFormatterTool() {
  const [title, setTitle] = useState("how to build a saas platform in 2026");
  const [keywords, setKeywords] = useState("saas, indie hackers, tutorial");
  const [channel, setChannel] = useState("Nexatools");

  const formatted = useMemo(() => titleCase(title).slice(0, 70), [title]);
  const kwArr = keywords.split(",").map((k) => k.trim()).filter(Boolean);

  const description = useMemo(() => {
    return [
      `${formatted}`,
      "",
      `In this video, we cover ${formatted.toLowerCase()}. Learn the essentials, common mistakes, and practical tips you can apply today.`,
      "",
      "🔔 Subscribe for more: https://youtube.com",
      "",
      "⏱️ Chapters",
      "0:00 Intro",
      "1:00 Main content",
      "",
      `🏷️ Tags: ${kwArr.join(", ")}`,
      "",
      `— ${channel}`,
    ].join("\n");
  }, [formatted, kwArr, channel]);

  const tags = useMemo(() => kwArr.join(", "), [kwArr]);

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success("Copied"); };

  return (
    <div className="space-y-4">
      <div><Label>Raw title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Keywords (comma-separated)</Label><Input value={keywords} onChange={(e) => setKeywords(e.target.value)} className="mt-1" /></div>
        <div><Label>Channel name</Label><Input value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-1" /></div>
      </div>
      <div className="space-y-2">
        <Label>SEO title <span className="text-xs text-muted-foreground">({formatted.length}/70)</span></Label>
        <div className="flex gap-2">
          <Input readOnly value={formatted} />
          <Button variant="ghost" onClick={() => copy(formatted)}>Copy</Button>
        </div>
      </div>
      <div>
        <Label>Tags</Label>
        <div className="flex gap-2 mt-1">
          <Input readOnly value={tags} />
          <Button variant="ghost" onClick={() => copy(tags)}>Copy</Button>
        </div>
      </div>
      <div>
        <Label>Description template</Label>
        <Textarea readOnly value={description} className="mt-1 min-h-[260px] font-mono text-xs" />
        <Button className="mt-2" onClick={() => copy(description)}>Copy description</Button>
      </div>
    </div>
  );
}