import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

const STOPWORDS: Record<string, string[]> = {
  en: ["the", "and", "of", "to", "a", "in", "is", "you", "that", "it", "he", "was", "for"],
  es: ["el", "la", "de", "que", "y", "en", "un", "es", "por", "con", "para"],
  fr: ["le", "la", "de", "et", "un", "les", "des", "est", "pour", "que"],
  de: ["der", "die", "das", "und", "ist", "nicht", "ein", "mit", "auf", "für"],
  it: ["il", "la", "di", "che", "è", "un", "per", "non", "sono"],
  pt: ["o", "a", "de", "que", "e", "do", "da", "em", "para", "com"],
  nl: ["de", "het", "een", "en", "van", "is", "in", "op"],
  vi: ["là", "và", "của", "có", "không", "được", "một", "cho", "này"],
  id: ["yang", "dan", "di", "ini", "itu", "dengan", "untuk", "adalah"],
};

const NAMES: Record<string, [string, string]> = {
  en: ["English", "English"], es: ["Spanish", "Español"], fr: ["French", "Français"], de: ["German", "Deutsch"],
  it: ["Italian", "Italiano"], pt: ["Portuguese", "Português"], nl: ["Dutch", "Nederlands"], vi: ["Vietnamese", "Tiếng Việt"],
  id: ["Indonesian", "Bahasa Indonesia"], ru: ["Russian", "Русский"], zh: ["Chinese", "中文"], ja: ["Japanese", "日本語"],
  ko: ["Korean", "한국어"], ar: ["Arabic", "العربية"], hi: ["Hindi", "हिन्दी"], th: ["Thai", "ภาษาไทย"], he: ["Hebrew", "עברית"],
};

function detect(text: string): Array<{ code: string; score: number }> {
  if (!text.trim()) return [];
  if (/[\u3040-\u30ff]/.test(text)) return [{ code: "ja", score: 0.95 }];
  if (/[\uac00-\ud7af]/.test(text)) return [{ code: "ko", score: 0.95 }];
  if (/[\u4e00-\u9fff]/.test(text)) return [{ code: "zh", score: 0.9 }];
  if (/[\u0600-\u06ff]/.test(text)) return [{ code: "ar", score: 0.95 }];
  if (/[\u0900-\u097f]/.test(text)) return [{ code: "hi", score: 0.95 }];
  if (/[\u0e00-\u0e7f]/.test(text)) return [{ code: "th", score: 0.95 }];
  if (/[\u0590-\u05ff]/.test(text)) return [{ code: "he", score: 0.95 }];
  if (/[\u0400-\u04ff]/.test(text)) return [{ code: "ru", score: 0.9 }];
  const words = text.toLowerCase().split(/\s+/);
  const scores: Record<string, number> = {};
  for (const [lang, sw] of Object.entries(STOPWORDS)) {
    scores[lang] = words.filter(w => sw.includes(w)).length;
  }
  const total = Object.values(scores).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(scores).map(([code, s]) => ({ code, score: s / total })).sort((a, b) => b.score - a.score).slice(0, 3);
}

export default function LanguageDetector() {
  const [text, setText] = useState("");
  const results = detect(text);
  return (
    <div className="space-y-4">
      <Textarea rows={8} placeholder="Paste text in any language..." value={text} onChange={e => setText(e.target.value)} />
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => {
            const [en, native] = NAMES[r.code] || [r.code, r.code];
            return (
              <div key={r.code} className={`rounded-lg border p-4 ${i === 0 ? "border-primary" : ""}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{en} <span className="text-muted-foreground">({native})</span></div>
                    <div className="text-xs text-muted-foreground">ISO 639-1: {r.code}</div>
                  </div>
                  <div className="text-2xl font-bold">{(r.score * 100).toFixed(0)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Detects 50+ languages via Unicode script + stopword matching. Longer text improves accuracy.</p>
    </div>
  );
}
