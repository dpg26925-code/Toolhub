import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { md5 } from "js-md5";

const ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

async function hash(algo: string, text: string) {
  if (algo === "MD5") return md5(text);
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algo, buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGeneratorTool() {
  const [text, setText] = useState("Nexatools");
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: Record<string, string> = {};
      for (const a of ALGOS) out[a] = await hash(a, text);
      if (!cancelled) setResults(out);
    })();
    return () => { cancelled = true; };
  }, [text]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Input</label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[140px] font-mono text-xs" />
      </div>
      <div className="space-y-3">
        {ALGOS.map((a) => (
          <div key={a} className="rounded-xl border border-border bg-background p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{a}</span>
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(results[a] ?? ""); toast.success("Copied"); }}>Copy</Button>
            </div>
            <div className="break-all font-mono text-xs">{results[a] ?? "…"}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">MD5 is included for legacy checksums only — it's cryptographically broken. Prefer SHA-256+ for security.</p>
    </div>
  );
}