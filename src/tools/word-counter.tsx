import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, Trash2, Sparkles, Download, BarChart2 } from "lucide-react";

const SAMPLE_TEXT = `Nexatools is a comprehensive collection of over 390 high-performance, browser-based web tools built for developers, designers, writers, and creators. 

Everything executes locally on your device with zero data logging, ensuring total privacy and near-instant processing. Whether you need to compress PDFs, format JSON, convert cases, or calculate trading positions, Nexatools delivers a seamless, ad-friendly experience with no required logins or software installation.`;

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
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
  const [statsCopied, setStatsCopied] = useState(false);
  const [excludeSpaces, setExcludeSpaces] = useState(false);
  const [showReadingTime, setShowReadingTime] = useState(true);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    // Words (split by whitespace)
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    // Characters (with / without spaces)
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    // Sentences (split by . ! ?)
    const sentences = trimmed
      ? text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
      : 0;
    // Paragraphs (split by double newline)
    const paragraphs = trimmed
      ? text.split(/\r?\n\s*\r?\n/).filter((p) => p.trim().length > 0).length
      : 0;
    // Reading time (words / 238 WPM)
    const readingSeconds = Math.ceil((words / 238) * 60);
    // Speaking time (words / 150 WPM)
    const speakingSeconds = Math.ceil((words / 150) * 60);

    const formatTime = (totalSec: number) => {
      if (totalSec < 60) return `${totalSec}s`;
      const mins = Math.floor(totalSec / 60);
      const remSec = totalSec % 60;
      return remSec > 0 ? `${mins}m ${remSec}s` : `${mins}m`;
    };

    return {
      words,
      charsWithSpaces,
      charsNoSpaces,
      displayedChars: excludeSpaces ? charsNoSpaces : charsWithSpaces,
      sentences,
      paragraphs,
      readingTime: formatTime(readingSeconds),
      speakingTime: formatTime(speakingSeconds),
      readingSeconds,
      speakingSeconds,
    };
  }, [text, excludeSpaces]);

  const handleCopyText = async () => {
    if (!text.trim()) {
      toast.error("No text to copy");
      return;
    }
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      toast.success("Text copied to clipboard!");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy text");
    }
  };

  const handleCopyStats = async () => {
    if (!text.trim()) {
      toast.error("Enter text to view and copy statistics");
      return;
    }
    const summary = [
      `Text Statistics Summary:`,
      `• Words: ${stats.words}`,
      `• Characters (with spaces): ${stats.charsWithSpaces}`,
      `• Characters (no spaces): ${stats.charsNoSpaces}`,
      `• Sentences: ${stats.sentences}`,
      `• Paragraphs: ${stats.paragraphs}`,
      `• Reading Time (238 WPM): ${stats.readingTime}`,
      `• Speaking Time (150 WPM): ${stats.speakingTime}`,
    ].join("\n");

    const ok = await copyToClipboard(summary);
    if (ok) {
      setStatsCopied(true);
      toast.success("Stats copied to clipboard!");
      setTimeout(() => setStatsCopied(false), 1500);
    } else {
      toast.error("Failed to copy stats");
    }
  };

  const handleDownload = () => {
    if (!text.trim()) {
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
    <div
      className={`rounded-xl border p-4 transition-all ${
        highlight ? "border-brand/40 bg-brand/5 shadow-xs" : "border-border bg-card"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1.5 text-2xl font-bold ${
          highlight ? "text-brand" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatBox label="Words" value={stats.words} highlight />
        <StatBox
          label={excludeSpaces ? "Chars (No Space)" : "Characters"}
          value={stats.displayedChars}
        />
        <StatBox label="No Spaces" value={stats.charsNoSpaces} />
        <StatBox label="Sentences" value={stats.sentences} />
        <StatBox label="Paragraphs" value={stats.paragraphs} />
        {showReadingTime ? (
          <StatBox label="Reading Time" value={stats.readingTime} />
        ) : (
          <StatBox label="Speaking Time" value={stats.speakingTime} />
        )}
      </div>

      {/* Editor & Controls */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        {/* Top Controls: Case buttons + Presets + Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCaseChange("upper")}
              disabled={!text.trim()}
              className="text-xs"
            >
              UPPERCASE
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCaseChange("lower")}
              disabled={!text.trim()}
              className="text-xs"
            >
              lowercase
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCaseChange("title")}
              disabled={!text.trim()}
              className="text-xs"
            >
              Title Case
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="exclude-spaces"
                checked={excludeSpaces}
                onCheckedChange={setExcludeSpaces}
              />
              <Label htmlFor="exclude-spaces" className="cursor-pointer text-xs text-muted-foreground">
                Exclude spaces
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-reading-time"
                checked={showReadingTime}
                onCheckedChange={setShowReadingTime}
              />
              <Label htmlFor="show-reading-time" className="cursor-pointer text-xs text-muted-foreground">
                Reading time
              </Label>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setText(SAMPLE_TEXT);
                toast.info("Sample text loaded");
              }}
              className="text-xs"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-brand" />
              Sample
            </Button>
            {text && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setText("");
                  toast.info("Cleared text");
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
          <div className="text-xs text-muted-foreground space-x-3">
            <span>
              Reading: <strong>{stats.readingTime}</strong> (at 238 WPM)
            </span>
            <span>·</span>
            <span>
              Speaking: <strong>{stats.speakingTime}</strong> (at 150 WPM)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyStats}
              disabled={!text.trim()}
              className="text-xs"
            >
              {statsCopied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                  Copied Stats!
                </>
              ) : (
                <>
                  <BarChart2 className="mr-1.5 h-3.5 w-3.5" />
                  Copy Stats
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleCopyText}
              disabled={!text.trim()}
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
              disabled={!text.trim()}
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