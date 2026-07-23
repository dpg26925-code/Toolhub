import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

function isCJK(ch: string) { const c = ch.codePointAt(0)!; return (c >= 0x3040 && c <= 0x30ff) || (c >= 0x3400 && c <= 0x9fff) || (c >= 0xac00 && c <= 0xd7af) || (c >= 0xf900 && c <= 0xfaff); }

export default function CharacterCounterLang() {
  const [text, setText] = useState("");
  const chars = [...text];
  const cjkCount = chars.filter(isCJK).length;
  const withoutSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length + cjkCount : 0;
  const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;

  const Stat = ({ l, v }: { l: string; v: number }) => (
    <div className="rounded-lg border p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-bold">{v.toLocaleString()}</div></div>
  );

  return (
    <div className="space-y-4">
      <Textarea rows={10} placeholder="Paste text in any language..." value={text} onChange={e => setText(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat l="Characters" v={chars.length} />
        <Stat l="No spaces" v={withoutSpaces} />
        <Stat l="Words" v={words} />
        <Stat l="Sentences" v={sentences} />
        <Stat l="Paragraphs" v={paragraphs} />
        <Stat l="CJK chars" v={cjkCount} />
      </div>
      <p className="text-xs text-muted-foreground">Supports English, Vietnamese, Chinese, Japanese, Korean. CJK characters are counted as individual words per convention.</p>
    </div>
  );
}
