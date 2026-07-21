import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Stat, round } from "./_edu";

const STOP = new Set([
  "the","a","an","and","or","but","of","to","in","on","for","with","as","by","at","from","is","are","was","were","be","been","being","this","that","these","those","it","its","i","you","he","she","we","they","them","his","her","our","their","my","your","not","no","if","so","do","does","did","have","has","had","will","would","can","could","should","about","into","than","then","also","just","which","who","whom","what","when","where","why","how"
]);

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}

function tierFor(words: number) {
  if (words < 500) return { label: "Short (below high-school essay)", color: "text-muted-foreground" };
  if (words <= 1000) return { label: "High-school essay range (500–1,000)", color: "text-sky-600" };
  if (words <= 5000) return { label: "College essay range (1,500–5,000)", color: "text-emerald-600" };
  if (words <= 20000) return { label: "Graduate paper range (5,000–20,000)", color: "text-amber-600" };
  return { label: "Thesis / dissertation range", color: "text-orange-600" };
}

export default function EssayWordCount() {
  const [text, setText] = useState("");

  const r = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const readingMin = Math.max(1, Math.ceil(wordCount / 225));

    const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
    // Flesch Reading Ease
    const flesch = wordCount && sentences
      ? 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount)
      : 0;
    // Flesch-Kincaid Grade Level
    const fkgl = wordCount && sentences
      ? 0.39 * (wordCount / sentences) + 11.8 * (syllables / wordCount) - 15.59
      : 0;

    // keyword density (exclude stopwords)
    const freq = new Map<string, number>();
    for (const raw of words) {
      const w = raw.toLowerCase().replace(/[^a-z0-9']/g, "");
      if (!w || STOP.has(w) || w.length < 3) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
    const top = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([w, c]) => ({ w, c, pct: (c / Math.max(1, wordCount)) * 100 }));

    return { chars, charsNoSpace, wordCount, sentences, paragraphs, readingMin, flesch, fkgl, top };
  }, [text]);

  const tier = tierFor(r.wordCount);
  const readingLabel =
    r.flesch >= 90 ? "Very easy (5th grade)" :
    r.flesch >= 80 ? "Easy (6th grade)" :
    r.flesch >= 70 ? "Fairly easy (7th grade)" :
    r.flesch >= 60 ? "Standard (8–9th grade)" :
    r.flesch >= 50 ? "Fairly difficult (10–12th grade)" :
    r.flesch >= 30 ? "Difficult (college)" :
    "Very difficult (college graduate)";

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your essay here…"
        className="min-h-64"
      />

      <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Words" value={r.wordCount} highlight />
        <Stat label="Characters" value={r.chars} hint={`${r.charsNoSpace} without spaces`} />
        <Stat label="Sentences" value={r.sentences} />
        <Stat label="Paragraphs" value={r.paragraphs} />
        <Stat label="Reading time" value={`${r.readingMin} min`} hint="~225 wpm" />
      </div>

      <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-3">
        <Stat label="Flesch Reading Ease" value={round(r.flesch, 1)} hint={readingLabel} />
        <Stat label="Flesch-Kincaid Grade" value={round(r.fkgl, 1)} hint="US school grade level" />
        <Stat label="Length tier" value={<span className={tier.color}>{tier.label}</span>} />
      </div>

      {r.top.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-3 text-sm font-semibold">Top keywords (density)</h3>
          <div className="space-y-2">
            {r.top.map((k) => (
              <div key={k.w}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{k.w}</span>
                  <span className="text-muted-foreground">{k.c}× · {round(k.pct, 2)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, k.pct * 10)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}