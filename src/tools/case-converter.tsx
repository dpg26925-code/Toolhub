import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, Trash2, FileText, Download, Sparkles } from "lucide-react";

const SAMPLE_TEXT = `user_account_id
first_name
order_total_usd
is_active_subscriber
get_latest_notifications`;

const splitWords = (s: string): string[] => {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_\-./\\]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

interface CaseDefinition {
  id: string;
  label: string;
  description: string;
  convertSingle: (s: string) => string;
}

const CASE_DEFINITIONS: CaseDefinition[] = [
  {
    id: "uppercase",
    label: "UPPERCASE",
    description: "ALL CAPITAL LETTERS",
    convertSingle: (s) => s.toUpperCase(),
  },
  {
    id: "lowercase",
    label: "lowercase",
    description: "all small letters",
    convertSingle: (s) => s.toLowerCase(),
  },
  {
    id: "title",
    label: "Title Case",
    description: "Capitalize The First Letter Of Each Word",
    convertSingle: (s) => {
      const words = splitWords(s);
      if (words.length === 0) return s;
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    },
  },
  {
    id: "sentence",
    label: "Sentence case",
    description: "Capitalize the first letter of each sentence",
    convertSingle: (s) => {
      const lower = s.toLowerCase();
      return lower.replace(/(^\s*[\p{L}])|([.!?]\s+[\p{L}])/gu, (m) => m.toUpperCase());
    },
  },
  {
    id: "camel",
    label: "camelCase",
    description: "standardJavaScriptVariableFormat",
    convertSingle: (s) => {
      const words = splitWords(s);
      if (words.length === 0) return s;
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join("");
    },
  },
  {
    id: "pascal",
    label: "PascalCase",
    description: "StandardClassAndComponentFormat",
    convertSingle: (s) => {
      const words = splitWords(s);
      if (words.length === 0) return s;
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    },
  },
  {
    id: "snake",
    label: "snake_case",
    description: "python_and_database_column_format",
    convertSingle: (s) => {
      const words = splitWords(s);
      if (words.length === 0) return s;
      return words.map((w) => w.toLowerCase()).join("_");
    },
  },
  {
    id: "kebab",
    label: "kebab-case",
    description: "css-class-and-url-slug-format",
    convertSingle: (s) => {
      const words = splitWords(s);
      if (words.length === 0) return s;
      return words.map((w) => w.toLowerCase()).join("-");
    },
  },
  {
    id: "constant",
    label: "CONSTANT_CASE",
    description: "SCREAMING_SNAKE_CASE_FOR_CONSTANTS",
    convertSingle: (s) => {
      const words = splitWords(s);
      if (words.length === 0) return s;
      return words.map((w) => w.toUpperCase()).join("_");
    },
  },
  {
    id: "dot",
    label: "dot.case",
    description: "property.and.config.format",
    convertSingle: (s) => {
      const words = splitWords(s);
      if (words.length === 0) return s;
      return words.map((w) => w.toLowerCase()).join(".");
    },
  },
  {
    id: "path",
    label: "path/case",
    description: "folder/file/path/format",
    convertSingle: (s) => {
      const words = splitWords(s);
      if (words.length === 0) return s;
      return words.map((w) => w.toLowerCase()).join("/");
    },
  },
  {
    id: "train",
    label: "Train-Case",
    description: "Http-Header-Case-Format",
    convertSingle: (s) => {
      const words = splitWords(s);
      if (words.length === 0) return s;
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("-");
    },
  },
  {
    id: "alternating",
    label: "aLtErNaTiNg cAsE",
    description: "sPoNgEbOb mEmE cAsE",
    convertSingle: (s) => {
      let isUpper = false;
      return s
        .split("")
        .map((char) => {
          if (/\p{L}/u.test(char)) {
            const out = isUpper ? char.toUpperCase() : char.toLowerCase();
            isUpper = !isUpper;
            return out;
          }
          return char;
        })
        .join("");
    },
  },
  {
    id: "inverse",
    label: "InVeRsE cAsE",
    description: "iNVERTS THE CASE OF EACH LETTER",
    convertSingle: (s) => {
      return s
        .split("")
        .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
        .join("");
    },
  },
];

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export default function CaseConverterTool() {
  const [text, setText] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lineByLine, setLineByLine] = useState(true);

  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    return { chars, words, lines };
  }, [text]);

  const computedOutputs = useMemo(() => {
    if (!text) return {};
    const res: Record<string, string> = {};
    const isMultiLine = lineByLine && text.includes("\n");

    for (const def of CASE_DEFINITIONS) {
      if (isMultiLine) {
        const lines = text.split(/\r\n|\r|\n/);
        res[def.id] = lines.map((l) => (l.trim() ? def.convertSingle(l) : l)).join("\n");
      } else {
        res[def.id] = def.convertSingle(text);
      }
    }
    return res;
  }, [text, lineByLine]);

  const handleCopy = async (key: string, value: string) => {
    if (!value) {
      toast.error("Enter some text first");
      return;
    }
    const success = await copyToClipboard(value);
    if (success) {
      setCopiedKey(key);
      toast.success(`Copied ${key} to clipboard`);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleCopyAll = async () => {
    if (!text) {
      toast.error("Enter some text first");
      return;
    }
    const all = CASE_DEFINITIONS.map(
      (c) => `=== ${c.label} ===\n${computedOutputs[c.id] || ""}\n`
    ).join("\n");
    const success = await copyToClipboard(all);
    if (success) {
      setCopiedKey("__all");
      toast.success("Copied all case styles to clipboard");
      setTimeout(() => setCopiedKey((k) => (k === "__all" ? null : k)), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    if (!text) {
      toast.error("Enter some text first");
      return;
    }
    const all = CASE_DEFINITIONS.map(
      (c) => `=== ${c.label} ===\n${computedOutputs[c.id] || ""}\n`
    ).join("\n");
    const blob = new Blob([all], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-cases.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded converted-cases.txt");
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    toast.info("Sample variables loaded");
  };

  const handleClear = () => {
    setText("");
    toast.info("Text cleared");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <Label htmlFor="case-input" className="text-sm font-semibold text-foreground">
            Input text or code variables
          </Label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="line-by-line"
                checked={lineByLine}
                onCheckedChange={setLineByLine}
              />
              <Label htmlFor="line-by-line" className="cursor-pointer text-xs text-muted-foreground">
                Line-by-line mode
              </Label>
            </div>
            <Button size="xs" variant="outline" onClick={handleLoadSample} className="h-7 text-xs">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-brand" />
              Sample
            </Button>
            {text && (
              <Button size="xs" variant="ghost" onClick={handleClear} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <Textarea
          id="case-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text, variable names, sentences or paragraphs here…"
          className="min-h-[140px] font-mono text-sm leading-relaxed"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span><strong>{stats.chars}</strong> characters</span>
            <span><strong>{stats.words}</strong> words</span>
            <span><strong>{stats.lines}</strong> lines</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="xs" variant="secondary" onClick={handleCopyAll} disabled={!text}>
              {copiedKey === "__all" ? (
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="mr-1.5 h-3.5 w-3.5" />
              )}
              {copiedKey === "__all" ? "Copied All!" : "Copy All Cases"}
            </Button>
            <Button size="xs" variant="outline" onClick={handleDownload} disabled={!text}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download .txt
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        {CASE_DEFINITIONS.map((c) => {
          const value = computedOutputs[c.id] || "";
          const isCopied = copiedKey === c.label;

          return (
            <div
              key={c.id}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                      {c.label}
                    </span>
                    <span className="ml-2 hidden text-[11px] text-muted-foreground sm:inline">
                      {c.description}
                    </span>
                  </div>
                  <Button
                    size="xs"
                    variant={isCopied ? "default" : "secondary"}
                    onClick={() => handleCopy(c.label, value)}
                    disabled={!value}
                    className="h-7 shrink-0 text-xs"
                  >
                    {isCopied ? (
                      <>
                        <Check className="mr-1 h-3 w-3 text-emerald-300" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-2.5 max-h-32 overflow-y-auto rounded-lg bg-muted/40 p-2.5 font-mono text-xs leading-relaxed text-foreground select-all">
                  {value ? (
                    <pre className="whitespace-pre-wrap font-inherit">{value}</pre>
                  ) : (
                    <span className="text-muted-foreground/60 italic">—</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}