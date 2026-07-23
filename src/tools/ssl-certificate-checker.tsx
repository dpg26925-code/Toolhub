import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Info = { domain: string; validFormat: boolean; punycode: string; url: string; guides: string[] };

function toPunycode(host: string) {
  try { return new URL(`https://${host}`).hostname; } catch { return host; }
}

export default function SSLCertificateCheckerTool() {
  const [domain, setDomain] = useState("example.com");
  const [info, setInfo] = useState<Info | null>(null);

  const check = () => {
    const cleaned = domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const valid = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(cleaned);
    setInfo({
      domain: cleaned,
      validFormat: valid,
      punycode: toPunycode(cleaned),
      url: `https://${cleaned}`,
      guides: [
        `curl -vI https://${cleaned} 2>&1 | grep -E 'subject|issuer|expire'`,
        `openssl s_client -connect ${cleaned}:443 -servername ${cleaned} </dev/null 2>/dev/null | openssl x509 -noout -dates -subject -issuer`,
        `https://crt.sh/?q=${encodeURIComponent(cleaned)}`,
        `https://www.ssllabs.com/ssltest/analyze.html?d=${encodeURIComponent(cleaned)}`,
      ],
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
        ℹ️ Browsers can't read a remote server's TLS certificate details directly. This tool validates the domain format and opens trusted third-party lookups (Qualys SSL Labs, crt.sh) in one click.
      </div>
      <div className="flex gap-2">
        <div className="flex-1"><Label>Domain</Label><Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" className="mt-1" /></div>
        <div className="flex items-end"><Button onClick={check}>Check</Button></div>
      </div>
      {info && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 text-sm">
            <div><span className="text-muted-foreground">Domain:</span> <span className="font-mono">{info.domain}</span></div>
            <div><span className="text-muted-foreground">Punycode:</span> <span className="font-mono">{info.punycode}</span></div>
            <div><span className="text-muted-foreground">Format:</span> {info.validFormat ? <span className="text-emerald-600 dark:text-emerald-400">Valid ✓</span> : <span className="text-destructive">Invalid ✗</span>}</div>
            <div><span className="text-muted-foreground">HTTPS URL:</span> <a href={info.url} target="_blank" rel="noreferrer" className="underline font-mono">{info.url}</a></div>
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-sm font-semibold">Verify externally</div>
            <a href={`https://www.ssllabs.com/ssltest/analyze.html?d=${encodeURIComponent(info.domain)}`} target="_blank" rel="noreferrer" className="block text-sm underline">Open Qualys SSL Labs report →</a>
            <a href={`https://crt.sh/?q=${encodeURIComponent(info.domain)}`} target="_blank" rel="noreferrer" className="block text-sm underline">Open crt.sh certificate transparency log →</a>
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-sm font-semibold">CLI check</div>
            {info.guides.slice(0, 2).map((g) => (
              <pre key={g} className="overflow-x-auto rounded bg-muted p-2 font-mono text-xs">{g}</pre>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}