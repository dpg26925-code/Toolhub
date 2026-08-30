import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Trash2, Sparkles, Download, Type } from "lucide-react";

const SAMPLE_TEXT = `Nexatools is a comprehensive collection of over 390 high-performance, browser-based web tools built for developers, designers, writers, and creators. 

Everything executes locally on your device with zero data logging, ensuring total privacy and near-instant processing. Whether you need to compress PDFs, format JSON, convert cases, or calculate trading positions, Nexatools delivers a seamless, ad-friendly experience with no required logins or software installation.`;

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
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
    const res = document.execCommand("copy");
    document.body.removeChild(textArea);
    return res;
  } catch {
    return false;
  }
}

export default function WordCounterTool() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = trimmed
      ? (trimmed.match(/[^.!?]+[.!?]+(\s|$)/g)?.length ?? (trimmed ? 1 : 0))
      : 0;
    const paragraphs = trimmed
      ? text.split(/\r\n\r\n|\n\n/).filter((p) => p.trim().length > 0).length
      : 0;
    const readingSeconds = Math.ceil((words / 200) * 60);
    const speakingSeconds = Math.ceil((words / 130) * 60);

    return {
      words,
      chars,
      charsNoSpace,
      sentences,
      paragraphs,
      readingTime: readingSeconds < 60 ? `${readingSeconds}s` : `${Math.ceil(readingSeconds / 60)}m`,
      speakingTime: speakingSeconds < 60 ? `${speakingSeconds}s` : `${Math.ceil(speakingSeconds / 60)}m`,
    };
  }, [text]);

  const handleCopy = async () => {
    if (!text) {
      toast.error("No text to copy");
      return;
    }
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      toast.success("Text copied to clipboard!");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    if (!text) {
      toast.error("No text to download");
      return;
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "word-count-text.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded word-count-text.txt");
  };

  const handleCaseChange = (mode: "upper" | "lower" | "title") => {
    if (!text) return;
    if (mode === "upper") setText(text.toUpperCase());
    else if (mode === "lower") setText(text.toLowerCase());
    else if (mode === "title") {
      setText(
        text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      );
    }
    toast.success(`Converted to ${mode}case`);
  };

  const StatBox = ({
    label,
    value,
    highlight,
  }: {
    label: string;
    value: string | number;
    highlight?: boolean;
  }) => (
    <div className={`rounded-xl border p-4 transition-all ${
      highlight ? "border-brand/40 bg-brand/5 shadow-xs" : "border-border bg-card"
    }`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1.5 text-2xl font-bold ${highlight ? "text-brand" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatBox label="Words" value={stats.words} highlight />
        <StatBox label="Characters" value={stats.chars} />
        <StatBox label="No Spaces" value={stats.charsNoSpace} />
        <StatBox label="Sentences" value={stats.sentences} />
        <StatBox label="Paragraphs" value={stats.paragraphs} />
        <StatBox label="Reading Time" value={stats.readingTime} />
      </div>

      {/* Editor & Controls */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleCaseChange("upper")}
              disabled={!text}
              className="text-xs"
            >
              UPPERCASE
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleCaseChange("lower")}
              disabled={!text}
              className="text-xs"
            >
              lowercase
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleCaseChange("title")}
              disabled={!text}
              className="text-xs"
            >
              Title Case
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                setText(SAMPLE_TEXT);
                toast.info("Sample text loaded");
              }}
              className="text-xs"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-brand" />
              Sample Text
            </Button>
            {text && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setText("");
                  toast.info("Cleared");
                }}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your essay, article, blog post, or copy here…"
          className="min-h-[260px] font-mono text-sm leading-relaxed"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div className="text-xs text-muted-foreground">
            Estimated Speaking Time: <strong>{stats.speakingTime}</strong> (at 130 words/min)
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleCopy}
              disabled={!text}
              className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold text-xs"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy Text
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={!text}
              className="text-xs"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download .txt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}