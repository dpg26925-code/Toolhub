import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function analyze(origin: string, target: string, method: Method, credentials: boolean) {
  const rules: { key: string; expected: string; note: string }[] = [
    { key: "Access-Control-Allow-Origin", expected: credentials ? origin : `${origin} OR *`, note: credentials ? "Must echo the request Origin — '*' is not allowed with credentials." : "May be '*' to allow any origin." },
    { key: "Access-Control-Allow-Methods", expected: method, note: "Preflight response must include the requested method." },
    { key: "Access-Control-Allow-Headers", expected: "Content-Type, Authorization…", note: "Must include any non-simple headers the client sends." },
  ];
  if (credentials) rules.push({ key: "Access-Control-Allow-Credentials", expected: "true", note: "Required when the client sends cookies or Authorization." });
  if (method !== "GET") rules.push({ key: "Access-Control-Max-Age", expected: "600 (optional)", note: "Caches preflight response for N seconds." });
  return rules;
}

export default function CorsCheckerTool() {
  const [origin, setOrigin] = useState("https://app.example.com");
  const [target, setTarget] = useState("https://api.example.com/users");
  const [method, setMethod] = useState<Method>("GET");
  const [credentials, setCredentials] = useState(false);

  const rules = useMemo(() => analyze(origin, target, method, credentials), [origin, target, method, credentials]);
  const curl = `curl -i -X OPTIONS "${target}" \\\n  -H "Origin: ${origin}" \\\n  -H "Access-Control-Request-Method: ${method}" \\\n  -H "Access-Control-Request-Headers: Content-Type${credentials ? ", Authorization" : ""}"`;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
        ℹ️ Browsers block cross-origin AJAX to unknown servers, so this tool builds the expected preflight response and a ready-to-run <code>curl</code>. Paste real headers below to compare.
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Origin (client)</Label><Input value={origin} onChange={(e) => setOrigin(e.target.value)} className="mt-1"/></div>
        <div><Label>Target URL (server)</Label><Input value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1"/></div>
        <div>
          <Label>Method</Label>
          <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent>{["GET","POST","PUT","DELETE","PATCH"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={credentials} onChange={(e) => setCredentials(e.target.checked)} /> With credentials (cookies / Authorization)</label></div>
      </div>
      <div className="rounded-lg border p-3">
        <div className="mb-2 text-sm font-semibold">Expected server response headers</div>
        <ul className="space-y-2 text-sm">
          {rules.map((r) => (
            <li key={r.key} className="grid gap-1 rounded bg-muted/50 p-2 sm:grid-cols-[220px_1fr]">
              <code className="font-mono">{r.key}</code>
              <div><code className="font-mono">{r.expected}</code><div className="text-xs text-muted-foreground">{r.note}</div></div>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border p-3">
        <div className="mb-1 text-sm font-semibold">Manual check (curl)</div>
        <pre className="overflow-x-auto rounded bg-muted p-2 font-mono text-xs">{curl}</pre>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => navigator.clipboard.writeText(curl)}>Copy curl</Button>
      </div>
    </div>
  );
}