import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TtHashtagDedupe() {
  const [text, setText] = useState("");
  const out = useMemo(() => {
    const tags = (text.match(/#[\p{L}\p{N}_]+/gu) || []).map((t) => t.toLowerCase());
    return Array.from(new Set(tags)).join(" ");
  }, [text]);
  const removed = (text.match(/#[\p{L}\p{N}_]+/gu) || []).length - (out ? out.split(" ").length : 0);
  return (
    <div className="space-y-3">
      <Label>Hashtags</Label>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[140px]" />
      <Label>De-duplicated</Label>
      <Textarea readOnly value={out} className="min-h-[100px] bg-secondary/40" />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{removed} duplicate{removed === 1 ? "" : "s"} removed</span>
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }}>Copy</Button>
      </div>
    </div>
  );
}