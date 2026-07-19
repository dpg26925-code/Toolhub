import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

function b64urlDecode(seg: string) {
  const pad = seg.length % 4 === 0 ? "" : "=".repeat(4 - (seg.length % 4));
  const b64 = seg.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return decodeURIComponent(escape(atob(b64)));
}

export default function JwtDecoderTool() {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  );

  const decoded = useMemo(() => {
    const parts = token.trim().split(".");
    if (parts.length < 2) return { error: "Not a JWT (expected 3 dot-separated segments)." };
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      const exp = payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
      const iat = payload.iat ? new Date(payload.iat * 1000).toISOString() : null;
      return { header, payload, exp, iat, signature: parts[2] ?? "" };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [token]);

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">JWT</label>
        <Textarea value={token} onChange={(e) => setToken(e.target.value)} className="min-h-[140px] font-mono text-xs" />
      </div>
      {"error" in decoded ? (
        <p className="text-sm text-destructive">{decoded.error}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Header</h3>
            <pre className="overflow-auto rounded-xl border border-border bg-background p-4 text-xs">{JSON.stringify(decoded.header, null, 2)}</pre>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Payload</h3>
            <pre className="overflow-auto rounded-xl border border-border bg-background p-4 text-xs">{JSON.stringify(decoded.payload, null, 2)}</pre>
            {(decoded.iat || decoded.exp) && (
              <div className="mt-2 text-xs text-muted-foreground">
                {decoded.iat && <div>Issued: {decoded.iat}</div>}
                {decoded.exp && <div>Expires: {decoded.exp}</div>}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <h3 className="mb-2 text-sm font-semibold">Signature</h3>
            <pre className="overflow-auto rounded-xl border border-border bg-background p-4 text-xs break-all whitespace-pre-wrap">{decoded.signature || "(none)"}</pre>
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Signature is decoded but not verified — verification requires the signing secret.</p>
    </div>
  );
}