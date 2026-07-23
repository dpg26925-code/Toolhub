import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Algo = "HS256" | "HS384" | "HS512";

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = ""; for (const v of b) s += String.fromCharCode(v);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlText(text: string) { return b64url(new TextEncoder().encode(text).buffer); }
function b64urlDecode(s: string) {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return new TextDecoder().decode(new Uint8Array([...b].map((c) => c.charCodeAt(0))));
}

async function sign(algo: Algo, data: string, secret: string) {
  const hash = algo === "HS256" ? "SHA-256" : algo === "HS384" ? "SHA-384" : "SHA-512";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data) as BufferSource);
  return b64url(sig);
}

export default function JwtEncoderTool() {
  const [algo, setAlgo] = useState<Algo>("HS256");
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "Alex",\n  "iat": 1700000000\n}');
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [token, setToken] = useState("");
  const [decodeToken, setDecodeToken] = useState("");
  const [decoded, setDecoded] = useState<{ header?: string; payload?: string; error?: string } | null>(null);

  const encode = async () => {
    try {
      const header = JSON.stringify({ alg: algo, typ: "JWT" });
      JSON.parse(payload); // validate
      const data = `${b64urlText(header)}.${b64urlText(payload)}`;
      const sig = await sign(algo, data, secret);
      setToken(`${data}.${sig}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Encode failed");
    }
  };

  const decode = () => {
    try {
      const parts = decodeToken.trim().split(".");
      if (parts.length !== 3) throw new Error("Not a JWT (need 3 parts)");
      const header = JSON.stringify(JSON.parse(b64urlDecode(parts[0])), null, 2);
      const pl = JSON.stringify(JSON.parse(b64urlDecode(parts[1])), null, 2);
      setDecoded({ header, payload: pl });
    } catch (e) {
      setDecoded({ error: e instanceof Error ? e.message : "Decode failed" });
    }
  };

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Encode</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Algorithm</Label>
            <Select value={algo} onValueChange={(v) => setAlgo(v as Algo)}>
              <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="HS256">HS256</SelectItem><SelectItem value="HS384">HS384</SelectItem><SelectItem value="HS512">HS512</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Secret</Label><Input value={secret} onChange={(e) => setSecret(e.target.value)} className="mt-1 font-mono"/></div>
        </div>
        <div><Label>Payload (JSON)</Label><Textarea rows={6} value={payload} onChange={(e) => setPayload(e.target.value)} className="mt-1 font-mono text-xs"/></div>
        <Button onClick={encode}>Encode JWT</Button>
        {token && (<>
          <Textarea rows={3} readOnly value={token} className="font-mono text-xs"/>
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(token); toast.success("Copied"); }}>Copy token</Button>
        </>)}
      </section>
      <hr />
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Decode</h3>
        <div><Label>JWT</Label><Textarea rows={3} value={decodeToken} onChange={(e) => setDecodeToken(e.target.value)} className="mt-1 font-mono text-xs"/></div>
        <Button variant="outline" onClick={decode}>Decode</Button>
        {decoded?.error && <p className="text-sm text-destructive">{decoded.error}</p>}
        {decoded?.header && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Header</Label><Textarea rows={5} readOnly value={decoded.header} className="mt-1 font-mono text-xs"/></div>
            <div><Label>Payload</Label><Textarea rows={5} readOnly value={decoded.payload} className="mt-1 font-mono text-xs"/></div>
          </div>
        )}
      </section>
    </div>
  );
}