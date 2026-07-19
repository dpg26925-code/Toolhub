import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Hop = { url: string; status?: number | string };

const PROXIES = [
  (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
];

const SUSPICIOUS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "buff.ly", "is.gd"];

export default function LinkExpander() {
  const [url, setUrl] = useState("");
  const [chain, setChain] = useState<Hop[]>([]);
  const [final, setFinal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    setError(""); setChain([]); setFinal(""); setLoading(true);
    try {
      new URL(url);
    } catch { setError("Invalid URL — include https://"); setLoading(false); return; }

    // Try HEAD via proxy to follow redirects
    try {
      const proxied = PROXIES[0](url);
      const res = await fetch(proxied);
      const data = await res.json();
      // allorigins returns { contents, status: { url, http_code } }
      const finalUrl = data?.status?.url || url;
      const code = data?.status?.http_code;
      const hops: Hop[] = [{ url, status: "start" }];
      if (finalUrl && finalUrl !== url) hops.push({ url: finalUrl, status: code });
      setChain(hops);
      setFinal(finalUrl);
    } catch (e) {
      setError("Could not fetch — the target may block CORS. Try a different URL.");
    } finally {
      setLoading(false);
    }
  };

  const host = (() => { try { return new URL(url).hostname; } catch { return ""; } })();
  const isShortener = SUSPICIOUS.some((s) => host.endsWith(s));

  return (
    <div className="space-y-4">
      <div>
        <Label>URL to expand</Label>
        <div className="mt-1 flex gap-2">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://bit.ly/xxxx" />
          <Button onClick={check} disabled={!url || loading}>{loading ? "Checking…" : "Expand"}</Button>
        </div>
        {isShortener && <p className="mt-1 text-xs text-amber-600">Detected shortener: {host}</p>}
      </div>

      {error && <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}

      {chain.length > 0 && (
        <div>
          <Label>Redirect chain</Label>
          <ol className="mt-2 space-y-2">
            {chain.map((h, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                <span className="mt-0.5 rounded bg-muted px-2 py-0.5 font-mono text-xs">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="break-all font-mono text-xs">{h.url}</div>
                  {h.status !== undefined && <div className="mt-1 text-xs text-muted-foreground">HTTP {h.status}</div>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {final && (
        <div className="rounded-lg border bg-primary/5 p-4">
          <div className="text-xs font-semibold text-primary">Final destination</div>
          <div className="mt-1 break-all font-mono text-sm">{final}</div>
          <Button size="sm" className="mt-3" onClick={() => { navigator.clipboard.writeText(final); toast.success("Copied"); }}>Copy final URL</Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Note: Some destinations block cross-origin requests. This tool uses a public CORS proxy and may fail on strict sites.
      </p>
    </div>
  );
}