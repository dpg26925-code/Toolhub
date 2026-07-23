import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function syllables(w: string) {
  w = w.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = w.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

export default function Tool() {
  const [text, setText] = useState("");
  const r = useMemo(() => {
    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length || 1;
    const syl = words.reduce((s, w) => s + syllables(w), 0);
    const flesch = 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syl / (words.length || 1));
    const grade = 0.39 * (words.length / sentences) + 11.8 * (syl / (words.length || 1)) - 15.59;
    const level = flesch > 90 ? "Very easy" : flesch > 80 ? "Easy" : flesch > 70 ? "Fairly easy" : flesch > 60 ? "Standard" : flesch > 50 ? "Fairly difficult" : flesch > 30 ? "Difficult" : "Very difficult";
    return { words: words.length, sentences, syl, flesch, grade, level };
  }, [text]);
  return (
    <div className="space-y-4">
      <div><Label>Content</Label><Textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 min-h-[200px]"/></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Words" value={r.words.toString()}/>
        <Stat label="Sentences" value={r.sentences.toString()}/>
        <Stat label="Syllables" value={r.syl.toString()}/>
        <Stat label="Flesch reading ease" value={r.flesch.toFixed(1)} highlight/>
        <Stat label="Grade level" value={r.grade.toFixed(1)}/>
        <Stat label="Reading level" value={r.level}/>
      </div>
    </div>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</div></div>;
}