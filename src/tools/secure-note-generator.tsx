import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function b64url(buf: ArrayBuffer) {
  const b = new Uint8Array(buf); let s = "";
  for (const v of b) s += String.fromCharCode(v);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function encryptNote(text: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt as BufferSource, iterations: 200000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, new TextEncoder().encode(text));
  return { salt: b64url(salt.buffer), iv: b64url(iv.buffer), ct: b64url(ct) };
}

export default function SecureNoteGeneratorTool() {
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [ttl, setTtl] = useState("3600");
  const [oneTime, setOneTime] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ link: string; expiresAt: string } | null>(null);

  const create = async () => {
    if (!note || !password) return;
    setBusy(true);
    try {
      const enc = await encryptNote(note, password);
      const payload = { ...enc, exp: Date.now() + +ttl * 1000, once: oneTime };
      const packed = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const link = `${typeof window !== "undefined" ? window.location.origin : ""}/tools/secure-note-generator#${packed}`;
      setResult({ link, expiresAt: new Date(payload.exp).toLocaleString() });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs">
        🔒 The note is encrypted with AES-256-GCM in your browser. The password is never sent — only the encrypted blob lives in the URL fragment.
      </div>
      <div><Label>Note</Label><Textarea rows={6} value={note} onChange={(e) => setNote(e.target.value)} className="mt-1" placeholder="Type your secret message…" /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Expires in</Label>
          <Select value={ttl} onValueChange={setTtl}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="600">10 minutes</SelectItem>
              <SelectItem value="3600">1 hour</SelectItem>
              <SelectItem value="86400">1 day</SelectItem>
              <SelectItem value="604800">1 week</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={oneTime} onChange={(e) => setOneTime(e.target.checked)} /> One-time view</label></div>
      </div>
      <Button onClick={create} disabled={!note || !password || busy}>{busy ? "Encrypting…" : "Create secure note"}</Button>
      {result && (
        <div className="rounded-lg border p-3 space-y-2">
          <div className="text-sm font-semibold">Shareable link (simulated)</div>
          <Textarea rows={3} readOnly value={result.link} className="font-mono text-xs" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Expires: {result.expiresAt}</span>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(result.link); toast.success("Link copied"); }}>Copy link</Button>
          </div>
          <p className="text-xs text-muted-foreground">This demo stores the encrypted note in the URL fragment — nothing is uploaded. Share the password separately.</p>
        </div>
      )}
    </div>
  );
}