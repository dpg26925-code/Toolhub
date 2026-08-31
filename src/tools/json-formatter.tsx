import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Code,
  Copy,
  Check,
  Download,
  Sparkles,
  Trash2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

const SAMPLE_JSON = `{
  "platform": "Nexatools",
  "version": "2.0.0",
  "toolsCount": 398,
  "clientSide": true,
  "features": [
    "100% In-Browser Execution",
    "Zero Data Retention",
    "Instant Live Output",
    "Developer Friendly"
  ],
  "author": {
    "organization": "Nexatools Cloud",
    "verified": true,
    "contact": "support@nexatools.cloud"
  }
}`;

function getJsonError(input: string, message: string): { line: number; col: number; message: string } {
  // Check Chrome style "at position 123"
  const posMatch = /position\s+(\d+)/i.exec(message);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const upto = input.slice(0, pos);
    const lines = upto.split("\n");
    const line = lines.length;
    const col = Math.max(1, pos - upto.lastIndexOf("\n"));
    return {
      line,
      col,
      message: `${message} (Line ${line}, Column ${col})`,
    };
  }

  // Check Firefox style "at line 2 column 5"
  const lineColMatch = /line\s+(\d+)\s+column\s+(\d+)/i.exec(message);
  if (lineColMatch) {
    const line = Number(lineColMatch[1]);
    const col = Number(lineColMatch[2]);
    return {
      line,
      col,
      message: `${message} (Line ${line}, Column ${col})`,
    };
  }

  // Fallback
  return {
    line: 1,
    col: 1,
    message: `${message} (Line 1, Column 1)`,
  };
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
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
    const res = document.execCommand("copy");
    document.body.removeChild(textArea);
    return res;
  } catch {
    return false;
  }
}

export default function JsonFormatterTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"pretty" | "minify">("pretty");

  const { output, error, isValid, stats } = useMemo(() => {
    if (!input.trim()) {
      return {
        output: "",
        error: null,
        isValid: true,
        stats: { size: 0, outSize: 0, lines: 0 },
      };
    }

    try {
      const parsed = JSON.parse(input);
      const formatted =
        mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      return {
        output: formatted,
        error: null,
        isValid: true,
        stats: {
          size: new Blob([input]).size,
          outSize: new Blob([formatted]).size,
          lines: formatted.split("\n").length,
        },
      };
    } catch (e: any) {
      const msg = e?.message || "Invalid JSON syntax";
      const errInfo = getJsonError(input, msg);
      return {
        output: "",
        error: errInfo.message,
        isValid: false,
        stats: { size: new Blob([input]).size, outSize: 0, lines: 0 },
      };
    }
  }, [input, mode]);

  const handleFormat = () => {
    setMode("pretty");
    if (!input.trim()) {
      toast.error("Please enter JSON first");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      JSON.stringify(parsed, null, 2);
      toast.success("JSON formatted successfully (2 spaces)");
    } catch (e: any) {
      const errInfo = getJsonError(input, e?.message || "");
      toast.error(`Invalid JSON syntax at Line ${errInfo.line}, Col ${errInfo.col}`);
    }
  };

  const handleMinify = () => {
    setMode("minify");
    if (!input.trim()) {
      toast.error("Please enter JSON first");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      JSON.stringify(parsed);
      toast.success("JSON minified successfully");
    } catch (e: any) {
      const errInfo = getJsonError(input, e?.message || "");
      toast.error(`Invalid JSON syntax at Line ${errInfo.line}, Col ${errInfo.col}`);
    }
  };

  const handleValidate = () => {
    if (!input.trim()) {
      toast.error("Please enter JSON first");
      return;
    }
    try {
      JSON.parse(input);
      toast.success("Valid JSON! No syntax errors detected.");
    } catch (e: any) {
      const errInfo = getJsonError(input, e?.message || "");
      toast.error(`Syntax Error at Line ${errInfo.line}, Column ${errInfo.col}`);
    }
  };

  const handleCopy = async () => {
    const textToCopy = output || input;
    if (!textToCopy.trim()) {
      toast.error("No JSON to copy");
      return;
    }
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopied(true);
      toast.success("JSON copied to clipboard!");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    const textToDownload = output || input;
    if (!textToDownload.trim()) {
      toast.error("No JSON to download");
      return;
    }
    const blob = new Blob([textToDownload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "minify" ? "minified.json" : "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${a.download}`);
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_JSON);
    setMode("pretty");
    toast.info("Sample JSON loaded");
  };

  const handleClear = () => {
    setInput("");
    toast.info("Input cleared");
  };

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={mode === "pretty" ? "default" : "secondary"}
            onClick={handleFormat}
            className="text-xs"
          >
            <Code className="mr-1.5 h-3.5 w-3.5" />
            Format
          </Button>
          <Button
            size="sm"
            variant={mode === "minify" ? "default" : "secondary"}
            onClick={handleMinify}
            className="text-xs"
          >
            <Minimize2 className="mr-1.5 h-3.5 w-3.5" />
            Minify
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleValidate}
            className="text-xs"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            Validate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!input.trim()}
            className="text-xs"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleLoadSample} className="text-xs">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-brand" />
            Sample JSON
          </Button>
          {input && (
            <Button size="sm" variant="ghost" onClick={handleClear} className="text-xs text-muted-foreground hover:text-destructive">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="json-input" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Input JSON
            </Label>
            {input.trim() && (
              <span className="text-[11px] text-muted-foreground">
                {stats.size} Bytes
              </span>
            )}
          </div>
          <Textarea
            id="json-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your raw, minified or unformatted JSON here…"
            className="min-h-[320px] font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="json-output" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Formatted Result
            </Label>
            {isValid && output && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Valid JSON ({stats.lines} lines)
              </span>
            )}
          </div>
          <Textarea
            id="json-output"
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here in real-time…"
            className="min-h-[320px] font-mono text-xs leading-relaxed bg-muted/30 select-all"
          />
        </div>
      </div>

      {/* Error Message if invalid */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Syntax Error: </strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="text-xs text-muted-foreground">
          {isValid && output ? (
            <span>Size: <strong>{stats.outSize} bytes</strong> · Ready to export</span>
          ) : (
            <span>Paste valid JSON to enable formatting and export options</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCopy}
            disabled={!output && !input.trim()}
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
                Copy Output
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={!output && !input.trim()}
            className="text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download .json
          </Button>
        </div>
      </div>
    </div>
  );
}