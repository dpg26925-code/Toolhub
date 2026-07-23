import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CHEATSHEET: [string, string][] = [
  ["\\d", "digit"], ["\\D", "non-digit"], ["\\w", "word char"], ["\\W", "non-word char"],
  ["\\s", "whitespace"], ["\\S", "non-whitespace"], ["^", "start of line"], ["$", "end of line"],
  ["a|b", "a or b"], ["(...)", "capture group"], ["(?:...)", "non-capture"], ["a?", "0 or 1"],
  ["a*", "0 or more"], ["a+", "1 or more"], ["a{n,m}", "n to m"], ["[abc]", "any of"], ["[^abc]", "none of"],
];
const PRESETS = [
  { name: "Email", pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.-]+" },
  { name: "URL", pattern: "https?:\\/\\/[^\\s]+" },
  { name: "Phone (intl)", pattern: "\\+?\\d{1,3}[\\s-]?\\(?\\d{1,4}\\)?[\\s-]?\\d{3,4}[\\s-]?\\d{3,4}" },
  { name: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { name: "Hex color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b" },
  { name: "Date YYYY-MM-DD", pattern: "\\d{4}-\\d{2}-\\d{2}" },
];

export default function RegexTesterAdvancedTool() {
  const [pattern, setPattern] = useState("[\\w.+-]+@[\\w-]+\\.[\\w.-]+");
  const [flags, setFlags] = useState({ i: true, m: false, g: true, s: false, u: false });
  const [text, setText] = useState("Contact us at hello@nexatools.cloud or sales@example.com. Also: bad-email@.");

  const flagStr = (Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join("") + "");

  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flagStr);
      const matches: { match: string; index: number; groups: string[] }[] = [];
      if (flags.g) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        const m = re.exec(text);
        if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
      // build highlighted
      let highlighted = "";
      let cursor = 0;
      for (const m of matches) {
        highlighted += text.slice(cursor, m.index);
        highlighted += `<mark class="bg-yellow-500/30 rounded px-0.5">${m.match.replace(/</g, "&lt;")}</mark>`;
        cursor = m.index + m.match.length;
      }
      highlighted += text.slice(cursor).replace(/</g, "&lt;");
      return { matches, highlighted, error: null as string | null };
    } catch (e) {
      return { matches: [], highlighted: text.replace(/</g, "&lt;"), error: e instanceof Error ? e.message : "Invalid" };
    }
  }, [pattern, flagStr, text, flags.g]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Pattern</Label>
        <div className="mt-1 flex items-center gap-1 rounded-md border">
          <span className="pl-3 font-mono text-muted-foreground">/</span>
          <Input value={pattern} onChange={(e) => setPattern(e.target.value)} className="rounded-none border-0 font-mono focus-visible:ring-0"/>
          <span className="pr-3 font-mono text-muted-foreground">/{flagStr}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          {(["g","i","m","s","u"] as const).map((f) => (
            <label key={f} className="flex items-center gap-1"><input type="checkbox" checked={flags[f]} onChange={(e) => setFlags({ ...flags, [f]: e.target.checked })}/><code>{f}</code></label>
          ))}
        </div>
      </div>
      <div>
        <Label>Presets</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {PRESETS.map((p) => <Button key={p.name} size="sm" variant="outline" onClick={() => setPattern(p.pattern)}>{p.name}</Button>)}
        </div>
      </div>
      <div><Label>Test text</Label><Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} className="mt-1 font-mono text-sm"/></div>
      {result.error ? <p className="text-sm text-destructive">{result.error}</p> : (
        <>
          <div className="rounded-lg border p-3 text-sm">
            <div className="mb-1 text-xs text-muted-foreground">{result.matches.length} match{result.matches.length === 1 ? "" : "es"}</div>
            <div className="whitespace-pre-wrap font-mono text-sm" dangerouslySetInnerHTML={{ __html: result.highlighted }} />
          </div>
          {result.matches.length > 0 && (
            <div className="rounded-lg border p-3 text-xs">
              <div className="mb-1 font-semibold">Matches</div>
              <ul className="space-y-1">{result.matches.map((m, i) => (
                <li key={i} className="font-mono">#{i + 1} · idx {m.index} · "{m.match}"{m.groups.length ? ` · groups: [${m.groups.map((g) => `"${g}"`).join(", ")}]` : ""}</li>
              ))}</ul>
            </div>
          )}
        </>
      )}
      <details className="rounded-lg border p-3 text-xs">
        <summary className="cursor-pointer font-semibold">Quick reference</summary>
        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          {CHEATSHEET.map(([k, v]) => <div key={k} className="flex gap-2"><code className="rounded bg-muted px-1">{k}</code> <span className="text-muted-foreground">{v}</span></div>)}
        </div>
      </details>
    </div>
  );
}