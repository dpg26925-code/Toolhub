import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, Sparkles, Trash2, KeyRound } from "lucide-react";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MDAwMDAwMDB9.4S154Gk3hUeQ7v4Q3E8b6n4H7d7c6";

function b64urlDecode(seg: string) {
  const pad = seg.length % 4 === 0 ? "" : "=".repeat(4 - (seg.length % 4));
  const b64 = seg.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return decodeURIComponent(escape(atob(b64)));
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

export default function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const decoded = useMemo(() => {
    const trimmed = token.trim();
    if (!trimmed) return null;
    const parts = trimmed.split(".");
    if (parts.length < 2) {
      return { error: "Not a valid JWT (expected 3 dot-separated base64url segments)." };
    }
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      const exp = payload.exp ? new Date(payload.exp * 1000).toUTCString() : null;
      const iat = payload.iat ? new Date(payload.iat * 1000).toUTCString() : null;
      return { header, payload, exp, iat, signature: parts[2] ?? "" };
    } catch (e) {
      return { error: `Failed to decode JWT: ${(e as Error).message}` };
    }
  }, [token]);

  const handleCopy = async (key: string, data: any) => {
    const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      toast.success(`Copied ${key} to clipboard!`);
      setTimeout(() => setCopiedKey(null), 1500);
    } else {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-5">
      {/* Input section */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="jwt-input" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <KeyRound className="h-4 w-4 text-brand" />
            Encoded JWT Token
          </Label>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                setToken(SAMPLE_JWT);
                toast.info("Sample JWT loaded");
              }}
              className="text-xs"
            >
              <Sparkles className="mr-1 h-3 w-3 text-brand" />
              Sample Token
            </Button>
            {token && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setToken("")}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <Textarea
          id="jwt-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste JWT string (eyJhbGciOi...)..."
          className="min-h-[110px] font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Decoded Output */}
      {decoded && "error" in decoded && decoded.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          {decoded.error}
        </div>
      )}

      {decoded && !("error" in decoded) && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Header Card */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                HEADER (Algorithm & Token Type)
              </span>
              <Button
                size="xs"
                variant={copiedKey === "header" ? "default" : "secondary"}
                onClick={() => handleCopy("header", decoded.header)}
                className="text-xs"
              >
                {copiedKey === "header" ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                {copiedKey === "header" ? "Copied" : "Copy Header"}
              </Button>
            </div>
            <pre className="overflow-auto rounded-xl bg-muted/40 p-3.5 font-mono text-xs text-foreground select-all">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload Card */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
                PAYLOAD (Claims & Data)
              </span>
              <Button
                size="xs"
                variant={copiedKey === "payload" ? "default" : "secondary"}
                onClick={() => handleCopy("payload", decoded.payload)}
                className="text-xs"
              >
                {copiedKey === "payload" ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                {copiedKey === "payload" ? "Copied" : "Copy Payload"}
              </Button>
            </div>
            <pre className="overflow-auto rounded-xl bg-muted/40 p-3.5 font-mono text-xs text-foreground select-all max-h-[260px]">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
            {(decoded.iat || decoded.exp) && (
              <div className="rounded-lg bg-muted/20 p-2.5 text-[11px] text-muted-foreground space-y-1">
                {decoded.iat && <div><strong>Issued At:</strong> {decoded.iat}</div>}
                {decoded.exp && <div><strong>Expires:</strong> {decoded.exp}</div>}
              </div>
            )}
          </div>

          {/* Signature Card */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                SIGNATURE
              </span>
              <Button
                size="xs"
                variant={copiedKey === "signature" ? "default" : "secondary"}
                onClick={() => handleCopy("signature", decoded.signature)}
                className="text-xs"
              >
                {copiedKey === "signature" ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                {copiedKey === "signature" ? "Copied" : "Copy Signature"}
              </Button>
            </div>
            <pre className="overflow-auto rounded-xl bg-muted/40 p-3.5 font-mono text-xs text-foreground break-all whitespace-pre-wrap select-all">
              {decoded.signature || "(No signature)"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}