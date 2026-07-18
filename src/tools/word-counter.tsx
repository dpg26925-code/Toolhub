import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function WordCounterTool() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g)?.length ?? 1) : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const readingMinutes = words / 200;
    return { words, chars, charsNoSpace, sentences, paragraphs, readingMinutes };
  }, [text]);

  const Stat = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing or paste your text…"
        className="min-h-[240px] font-mono text-sm"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Words" value={stats.words} />
        <Stat label="Characters" value={stats.chars} />
        <Stat label="No spaces" value={stats.charsNoSpace} />
        <Stat label="Sentences" value={stats.sentences} />
        <Stat label="Paragraphs" value={stats.paragraphs} />
        <Stat
          label="Reading time"
          value={
            stats.readingMinutes < 1
              ? `${Math.ceil(stats.readingMinutes * 60)}s`
              : `${Math.ceil(stats.readingMinutes)}m`
          }
        />
      </div>
    </div>
  );
}