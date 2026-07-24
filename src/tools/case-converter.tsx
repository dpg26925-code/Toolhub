import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const splitWords = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const cases: { label: string; fn: (s: string) => string }[] = [
  { label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { label: "lowercase", fn: (s) => s.toLowerCase() },
  {
    label: "Title Case",
    fn: (s) => splitWords(s).map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join(" "),
  },
  {
    label: "Sentence case",
    fn: (s) => {
      const lower = s.toLowerCase();
      return lower.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase());
    },
  },
  {
    label: "camelCase",
    fn: (s) =>
      splitWords(s)
        .map((w, i) =>
          i === 0 ? w.toLowerCase() : w[0]?.toUpperCase() + w.slice(1).toLowerCase(),
        )
        .join(""),
  },
  {
    label: "PascalCase",
    fn: (s) => splitWords(s).map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join(""),
  },
  { label: "snake_case", fn: (s) => splitWords(s).map((w) => w.toLowerCase()).join("_") },
  { label: "kebab-case", fn: (s) => splitWords(s).map((w) => w.toLowerCase()).join("-") },
  { label: "CONSTANT_CASE", fn: (s) => splitWords(s).map((w) => w.toUpperCase()).join("_") },
];

export default function CaseConverterTool() {
  const [text, setText] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (key: string, v: string) => {
    if (!v) {
      toast.error("Type some text first");
      return;
    }
    await navigator.clipboard.writeText(v);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
  };

  const copyAll = async () => {
    if (!text) {
      toast.error("Type some text first");
      return;
    }
    const all = cases.map((c) => `${c.label}: ${c.fn(text)}`).join("\n");
    await copy("__all", all);
  };

  return (
    <div className="space-y-6">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste any text…"
        className="min-h-[160px]"
      />
      <div className="flex justify-end">
        <Button size="sm" variant="secondary" onClick={copyAll}>
          {copiedKey === "__all" ? "Copied!" : "Copy all"}
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cases.map((c) => {
          const value = text ? c.fn(text) : "";
          return (
            <div key={c.label} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </div>
                <Button size="sm" variant="ghost" onClick={() => copy(c.label, value)}>
                  {copiedKey === c.label ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="mt-2 min-h-[1.5rem] break-words font-mono text-sm">
                {value || <span className="text-muted-foreground">—</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}