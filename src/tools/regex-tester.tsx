import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, Sparkles, Trash2, Search, CheckCircle2 } from "lucide-react";

const PRESETS = [
  { name: "Email", regex: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "gi" },
  { name: "URL", regex: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)", flags: "gi" },
  { name: "Phone (US/VN)", regex: "(?:\\+?\\d{1,3}[- ]?)?\\(?\\d{3}\\)?[- ]?\\d{3}[- ]?\\d{4}", flags: "g" },
  { name: "Hex Color", regex: "#(?:[0-9a-fA-F]{3}){1,2}\\b", flags: "gi" },
  { name: "IPv4", regex: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
];

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    const res = document.execCommand("copy");
    document.body.removeChild(textArea);
    return res;
  } catch {
    return false;
  }
}

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState(
    "Contact our support team at hello@nexatools.cloud or billing@example.org for assistance. Visit https://nexatools.cloud today!"
  );
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!pattern) return { ok: true as const, matches: [] };
    try {
      const activeFlags = flags.includes("g") ? flags : flags + "g";
      const matches = [...text.matchAll(new RegExp(pattern, activeFlags))];
      return { ok: true as const, matches };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [pattern, flags, text]);

  const handleCopyMatches = async () => {
    if (!result.ok || result.matches.length === 0) {
      toast.error("No matches to copy");
      return;
    }
    const all = result.matches.map((m) => m[0]).join("\n");
    const ok = await copyToClipboard(all);
    if (ok) {
      setCopied(true);
      toast.success(`Copied ${result.matches.length} matches!`);
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-5">
      {/* Pattern Bar */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Search className="h-4 w-4 text-brand" />
            Regular Expression Pattern & Flags
          </Label>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Presets:</span>
            {PRESETS.map((p) => (
              <Button
                key={p.name}
                size="xs"
                variant="outline"
                onClick={() => {
                  setPattern(p.regex);
                  setFlags(p.flags);
                  toast.info(`Applied ${p.name} preset`);
                }}
                className="text-xs h-7"
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2 font-mono text-sm border border-border">
          <span className="text-muted-foreground font-bold px-1">/</span>
          <Input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern…"
            className="flex-1 font-mono text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <span className="text-muted-foreground font-bold px-1">/</span>
          <Input
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="flags"
            className="w-20 font-mono text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-brand font-bold"
          />
        </div>
      </div>

      {/* Test String Editor */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <Label htmlFor="test-text" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Test String
          </Label>
          {text && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setText("")}
              className="text-xs text-muted-foreground hover:text-destructive h-7"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>

        <Textarea
          id="test-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste test string here to check regex matches against…"
          className="min-h-[160px] font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Result Section */}
      {!result.ok ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          <strong>Invalid Regular Expression:</strong> {result.error}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Match Results ({result.matches.length})
            </span>
            <Button
              size="sm"
              variant={copied ? "default" : "secondary"}
              onClick={handleCopyMatches}
              disabled={result.matches.length === 0}
              className="text-xs"
            >
              {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy All Matches"}
            </Button>
          </div>

          {result.matches.length > 0 ? (
            <ul className="divide-y divide-border rounded-xl border border-border bg-muted/20 text-xs font-mono max-h-72 overflow-y-auto">
              {result.matches.map((m, i) => (
                <li key={i} className="flex items-center justify-between p-3 hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-semibold">#{i + 1}</span>
                    <span className="font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                      {m[0]}
                    </span>
                    {m.length > 1 && (
                      <span className="text-muted-foreground text-[11px]">
                        Groups: {JSON.stringify(m.slice(1))}
                      </span>
                    )}
                  </div>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      void copyToClipboard(m[0]);
                      toast.success(`Copied match #${i + 1}`);
                    }}
                    className="h-6 text-[11px]"
                  >
                    Copy
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No matches found in the test string.
            </div>
          )}
        </div>
      )}
    </div>
  );
}