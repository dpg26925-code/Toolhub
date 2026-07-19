import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TtCaptionFormatter() {
  const [text, setText] = useState("");
  const formatted = useMemo(() => {
    const raw = text.replace(/\r\n/g, "\n").trim();
    if (!raw) return "";
    // Extract hashtags to end, dedupe
    const tagMatches = raw.match(/#[\p{L}\p{N}_]+/gu) || [];
    const tags = Array.from(new Set(tagMatches.map((t) => t.toLowerCase())));
    const body = raw.replace(/#[\p{L}\p{N}_]+/gu, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    return tags.length ? `${body}\n\u2800\n${tags.join(" ")}` : body;
  }, [text]);
  return (
    <div className="space-y-4">
      <div>
        <Label>Raw caption</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 min-h-[160px]" />
      </div>
      <div>
        <Label>Formatted (hashtags grouped, spacing cleaned)</Label>
        <Textarea readOnly value={formatted} className="mt-1 min-h-[160px] bg-secondary/40" />
        <Button className="mt-2" onClick={() => { navigator.clipboard.writeText(formatted); toast.success("Copied"); }} disabled={!formatted}>Copy formatted</Button>
      </div>
    </div>
  );
}