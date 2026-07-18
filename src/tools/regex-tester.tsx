import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("Contact us at hello@nexatools.cloud or team@example.org.");

  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      const matches = [...text.matchAll(new RegExp(pattern, flags.includes("g") ? flags : flags + "g"))];
      return { ok: true as const, re, matches };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [pattern, flags, text]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">/</span>
        <Input value={pattern} onChange={(e) => setPattern(e.target.value)} className="flex-1 font-mono text-xs min-w-[240px]" />
        <span className="text-sm text-muted-foreground">/</span>
        <Input value={flags} onChange={(e) => setFlags(e.target.value)} className="w-24 font-mono text-xs" />
      </div>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[180px] font-mono text-xs" />
      {!result.ok ? (
        <p className="text-sm text-destructive">Invalid regex: {result.error}</p>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground">
            {result.matches.length} match{result.matches.length === 1 ? "" : "es"}
          </p>
          <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-background text-sm">
            {result.matches.map((m, i) => (
              <li key={i} className="flex gap-3 p-3 font-mono text-xs">
                <span className="text-muted-foreground">#{i + 1}</span>
                <span className="text-primary">{m[0]}</span>
                {m.length > 1 && <span className="text-muted-foreground">groups: {JSON.stringify(m.slice(1))}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}