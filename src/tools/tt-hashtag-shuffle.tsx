import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TtHashtagShuffle() {
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const shuffle = () => {
    const tags = text.match(/#[\p{L}\p{N}_]+/gu) || [];
    for (let i = tags.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [tags[i], tags[j]] = [tags[j], tags[i]]; }
    setOut(tags.join(" "));
  };
  return (
    <div className="space-y-3">
      <Label>Hashtags</Label>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[140px]" placeholder="#fyp #viral #trend …" />
      <Button onClick={shuffle}>Shuffle</Button>
      {out && (<>
        <Label>Shuffled</Label>
        <Textarea readOnly value={out} className="min-h-[100px] bg-secondary/40" />
        <Button variant="outline" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }}>Copy</Button>
      </>)}
      <p className="text-xs text-muted-foreground">Shuffling hashtag order between posts helps avoid the "same-caption" pattern flag.</p>
    </div>
  );
}