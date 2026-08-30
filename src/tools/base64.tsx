import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Copy,
  Check,
  ArrowRightLeft,
  Download,
  Trash2,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
} from "lucide-react";

const SAMPLE_TEXT = "Nexatools — 390+ Free Online Tools";

function utf8ToBase64(str: string, urlSafe = false): string {
  const encoded = btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
  if (urlSafe) {
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return encoded;
}

function base64ToUtf8(str: string): string {
  let clean = str.trim();
  // Handle URL safe base64
  clean = clean.replace(/-/g, "+").replace(/_/g, "/");
  while (clean.length % 4 !== 0) {
    clean += "=";
  }
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

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

export default function Base64Tool() {
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: null };

    try {
      if (mode === "encode") {
        return { output: utf8ToBase64(input, urlSafe), error: null };
      } else {
        return { output: base64ToUtf8(input), error: null };
      }
    } catch (e) {
      return { output: "", error: "Invalid Base64 string format" };
    }
  }, [input, mode, urlSafe]);

  const handleCopy = async () => {
    if (!output) {
      toast.error("No output to copy");
      return;
    }
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "encode" ? "encoded-base64.txt" : "decoded-text.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded result file");
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    toast.info("Swapped input and output");
  };

  const handleLoadSample = () => {
    if (mode === "encode") {
      setInput(SAMPLE_TEXT);
    } else {
      setInput(utf8ToBase64(SAMPLE_TEXT, urlSafe));
    }
    toast.info("Sample loaded");
  };

  return (
    <div className="space-y-5">
      {/* Mode Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={mode === "encode" ? "default" : "secondary"}
            onClick={() => setMode("encode")}
            className="text-xs font-semibold"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            Encode (Text → Base64)
          </Button>
          <Button
            size="sm"
            variant={mode === "decode" ? "default" : "secondary"}
            onClick={() => setMode("decode")}
            className="text-xs font-semibold"
          >
            <Unlock className="mr-1.5 h-3.5 w-3.5" />
            Decode (Base64 → Text)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSwap}
            disabled={!output}
            className="text-xs"
          >
            <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
            Swap
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {mode === "encode" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="url-safe"
                checked={urlSafe}
                onCheckedChange={setUrlSafe}
              />
              <Label htmlFor="url-safe" className="cursor-pointer text-xs text-muted-foreground">
                URL-Safe Base64
              </Label>
            </div>
          )}
          <Button size="sm" variant="outline" onClick={handleLoadSample} className="text-xs">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-brand" />
            Sample
          </Button>
          {input && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setInput("")}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
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
            <Label htmlFor="base64-input" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {mode === "encode" ? "Plain Text Input" : "Base64 Input"}
            </Label>
            <span className="text-[11px] text-muted-foreground">
              {input.length} characters
            </span>
          </div>
          <Textarea
            id="base64-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter text or data to encode into Base64…" : "Paste Base64 encoded string to decode…"}
            className="min-h-[260px] font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="base64-output" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {mode === "encode" ? "Base64 Encoded Output" : "Decoded Plain Text"}
            </Label>
            <span className="text-[11px] text-muted-foreground">
              {output.length} characters
            </span>
          </div>
          <Textarea
            id="base64-output"
            value={output}
            readOnly
            placeholder="Result will compute automatically here…"
            className="min-h-[260px] font-mono text-xs leading-relaxed bg-muted/30 select-all"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="text-xs text-muted-foreground">
          {output ? "Computed live in browser memory" : "Enter text to compute result"}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCopy}
            disabled={!output}
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
            disabled={!output}
            className="text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download .txt
          </Button>
        </div>
      </div>
    </div>
  );
}