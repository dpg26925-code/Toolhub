import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

function syllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

export default function ReadabilityScore() {
  const [text, setText] = useState("");
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
  const wordCount = words.length || 1;
  const syllCount = words.reduce((s, w) => s + syllables(w), 0);
  const complexWords = words.filter(w => syllables(w) >= 3).length;
  const letters = text.replace(/[^a-zA-Z]/g, "").length;

  const fk = 0.39 * (wordCount / sentences) + 11.8 * (syllCount / wordCount) - 15.59;
  const gunning = 0.4 * ((wordCount / sentences) + 100 * (complexWords / wordCount));
  const smog = 1.043 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291;
  const coleman = 0.0588 * (letters / wordCount * 100) - 0.296 * (sentences / wordCount * 100) - 15.8;

  const audience = (g: number) => g < 6 ? "Elementary (ages 6-10)" : g < 9 ? "Middle school (ages 11-13)" : g < 13 ? "High school (ages 14-17)" : g < 16 ? "College (ages 18-21)" : "Graduate";

  const Row = ({ l, v }: { l: string; v: number }) => (
    <div className="rounded-lg border p-4">
      <div className="text-xs text-muted-foreground">{l}</div>
      <div className="text-2xl font-bold">{Number.isFinite(v) ? v.toFixed(1) : "—"}</div>
      <div className="text-xs text-muted-foreground">{Number.isFinite(v) ? audience(v) : ""}</div>
      <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (v / 20) * 100)}%` }} /></div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Textarea rows={10} placeholder="Paste your text..." value={text} onChange={e => setText(e.target.value)} />
      {text.trim() && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Row l="Flesch-Kincaid Grade" v={fk} />
            <Row l="Gunning Fog Index" v={gunning} />
            <Row l="SMOG Index" v={smog} />
            <Row l="Coleman-Liau" v={coleman} />
          </div>
          <div className="rounded-lg border p-4 text-sm space-y-1">
            <div className="font-medium">Recommendations</div>
            {fk > 12 && <div>• Shorten long sentences — aim for 15-20 words.</div>}
            {complexWords / wordCount > 0.15 && <div>• Reduce complex words (3+ syllables) — try simpler alternatives.</div>}
            {wordCount / sentences > 25 && <div>• Break up long sentences.</div>}
            {fk <= 8 && <div>• Reading level is easy — good for general audiences.</div>}
          </div>
        </>
      )}
    </div>
  );
}
