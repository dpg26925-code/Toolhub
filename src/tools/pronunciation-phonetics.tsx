import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

const IPA_MAP: Record<string, [string, string]> = {
  hello: ["həˈloʊ", "həˈləʊ"], world: ["wɜːrld", "wɜːld"], the: ["ðə", "ðə"], water: ["ˈwɔːtər", "ˈwɔːtə"],
  computer: ["kəmˈpjuːtər", "kəmˈpjuːtə"], science: ["ˈsaɪəns", "ˈsaɪəns"], love: ["lʌv", "lʌv"], time: ["taɪm", "taɪm"],
  house: ["haʊs", "haʊs"], book: ["bʊk", "bʊk"], school: ["skuːl", "skuːl"], phone: ["foʊn", "fəʊn"],
  music: ["ˈmjuːzɪk", "ˈmjuːzɪk"], happy: ["ˈhæpi", "ˈhæpi"], friend: ["frɛnd", "frɛnd"],
};

function syllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  word = word.replace(/e$/, "");
  const m = word.match(/[aeiouy]+/g);
  return m ? m.length : 1;
}

export default function PronunciationPhonetics() {
  const [text, setText] = useState("Hello world");
  const [dialect, setDialect] = useState<"us" | "uk">("us");
  const words = text.split(/\s+/).filter(Boolean);
  const rows = words.map(w => {
    const key = w.toLowerCase().replace(/[^a-z]/g, "");
    const ipa = IPA_MAP[key];
    return { word: w, ipa: ipa ? ipa[dialect === "us" ? 0 : 1] : "—", syl: syllables(w) };
  });
  const totalSyl = rows.reduce((s, r) => s + r.syl, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={`rounded-md border px-3 py-1 text-sm ${dialect === "us" ? "bg-primary text-primary-foreground" : ""}`} onClick={() => setDialect("us")}>American</button>
        <button className={`rounded-md border px-3 py-1 text-sm ${dialect === "uk" ? "bg-primary text-primary-foreground" : ""}`} onClick={() => setDialect("uk")}>British</button>
      </div>
      <Textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Type English words..." />
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50"><th className="p-2 text-left">Word</th><th className="p-2 text-left">IPA</th><th className="p-2 text-left">Syllables</th></tr></thead>
          <tbody>
            {rows.map((r, i) => <tr key={i} className="border-b"><td className="p-2">{r.word}</td><td className="p-2 font-mono">/{r.ipa}/</td><td className="p-2">{r.syl}</td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-muted-foreground">Total syllables: <span className="font-bold text-foreground">{totalSyl}</span></div>
      <p className="text-xs text-muted-foreground">Educational tool. Uses a small built-in dictionary; unknown words show —. For full IPA use a specialized dictionary.</p>
    </div>
  );
}
