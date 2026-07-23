import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Algo = "aes-gcm" | "aes-cbc" | "xor" | "base64";

function b64enc(buf: ArrayBuffer) { let s = ""; const b = new Uint8Array(buf); for (const v of b) s += String.fromCharCode(v); return btoa(s); }
function b64dec(s: string) { const bin = atob(s); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b; }

async function deriveKey(password: string, salt: Uint8Array, name: "AES-GCM" | "AES-CBC") {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt as BufferSource, iterations: 150000, hash: "SHA-256" }, base, { name, length: 256 }, false, ["encrypt", "decrypt"]);
}

async function encryptAES(mode: "AES-GCM" | "AES-CBC", plain: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(mode === "AES-GCM" ? 12 : 16));
  const key = await deriveKey(password, salt, mode);
  const ct = await crypto.subtle.encrypt({ name: mode, iv: iv as BufferSource }, key, new TextEncoder().encode(plain));
  const out = new Uint8Array(salt.length + iv.length + ct.byteLength);
  out.set(salt, 0); out.set(iv, salt.length); out.set(new Uint8Array(ct), salt.length + iv.length);
  return b64enc(out.buffer);
}
async function decryptAES(mode: "AES-GCM" | "AES-CBC", cipher: string, password: string) {
  const data = b64dec(cipher);
  const salt = data.slice(0, 16);
  const ivLen = mode === "AES-GCM" ? 12 : 16;
  const iv = data.slice(16, 16 + ivLen);
  const ct = data.slice(16 + ivLen);
  const key = await deriveKey(password, salt, mode);
  const pt = await crypto.subtle.decrypt({ name: mode, iv: iv as BufferSource }, key, ct as BufferSource);
  return new TextDecoder().decode(pt);
}

function xorCipher(text: string, key: string) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
  return out;
}
function xorEncrypt(text: string, key: string) { return b64enc(xorCipher(text, key).buffer); }
function xorDecrypt(text: string, key: string) {
  const data = b64dec(text);
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ key.charCodeAt(i % key.length);
  return new TextDecoder().decode(out);
}

export default function EncryptionTool() {
  const [algo, setAlgo] = useState<Algo>("aes-gcm");
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (mode: "enc" | "dec") => {
    if (!text) return;
    setBusy(true);
    try {
      let out = "";
      if (algo === "base64") out = mode === "enc" ? btoa(unescape(encodeURIComponent(text))) : decodeURIComponent(escape(atob(text)));
      else if (algo === "xor") { if (!password) throw new Error("Key required"); out = mode === "enc" ? xorEncrypt(text, password) : xorDecrypt(text, password); }
      else { if (!password) throw new Error("Password required"); const m = algo === "aes-gcm" ? "AES-GCM" : "AES-CBC"; out = mode === "enc" ? await encryptAES(m, text, password) : await decryptAES(m, text, password); }
      setOutput(out);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
        ⚠️ For educational purposes. Base64 and XOR are <strong>not</strong> encryption. Use AES-GCM for real confidentiality.
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Algorithm</Label>
          <Select value={algo} onValueChange={(v) => setAlgo(v as Algo)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="aes-gcm">AES-256-GCM (recommended)</SelectItem>
              <SelectItem value="aes-cbc">AES-256-CBC</SelectItem>
              <SelectItem value="xor">XOR cipher</SelectItem>
              <SelectItem value="base64">Base64 (encoding only)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{algo === "base64" ? "Password (unused)" : "Password / key"}</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={algo === "base64"} className="mt-1" />
        </div>
      </div>
      <div>
        <Label>Input text</Label>
        <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} className="mt-1 font-mono text-sm" />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => run("enc")} disabled={busy || !text}>Encrypt</Button>
        <Button variant="outline" onClick={() => run("dec")} disabled={busy || !text}>Decrypt</Button>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label>Output</Label>
          {output && <button className="text-xs underline" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>Copy</button>}
        </div>
        <Textarea rows={5} readOnly value={output} className="font-mono text-sm" />
      </div>
    </div>
  );
}