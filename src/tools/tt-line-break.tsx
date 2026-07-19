import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Uses invisible braille-blank char that TikTok/Instagram preserve on paste.
const BLANK = "\u2800";

export default function TtLineBreak() {
  const [text, setText] = useState("");
  const insert = () => {
    // Ensure each blank line has invisible char so social platforms keep it
    const out = text.split(/\n/).map((l) => (l.trim() === "" ? BLANK : l)).join("\n");
    setText(out);
    toast.success("Line breaks preserved");
  };
  const remove = () => {
    setText(text.replace(/\u2800/g, "").replace(/\n{2,}/g, "\n\n"));
    toast.success("Cleaned");
  };
  const copy = () => { navigator.clipboard.writeText(text); toast.success("Copied — paste into TikTok"); };
  return (
    <div className="space-y-3">
      <Label>Caption</Label>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[220px] font-mono text-sm" placeholder={"Line 1\n\nLine 2 (blank line above will be preserved)"} />
      <div className="flex flex-wrap gap-2">
        <Button onClick={insert}>Preserve blank lines</Button>
        <Button variant="outline" onClick={remove}>Remove invisible chars</Button>
        <Button variant="secondary" onClick={copy}>Copy</Button>
      </div>
      <p className="text-xs text-muted-foreground">Uses invisible braille-blank characters (U+2800) that TikTok, Instagram and Threads keep on paste.</p>
    </div>
  );
}