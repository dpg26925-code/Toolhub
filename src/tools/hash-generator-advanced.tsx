import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Algo = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const INFO: Record<Algo, string> = {
  "MD5": "128-bit legacy hash. Broken for security — use for checksums only.",
  "SHA-1": "160-bit. Deprecated for signatures; still used for legacy checksums.",
  "SHA-256": "256-bit. Modern standard, widely used (Bitcoin, TLS).",
  "SHA-384": "384-bit variant of SHA-2.",
  "SHA-512": "512-bit. Faster on 64-bit CPUs than SHA-256.",
};

// tiny MD5 implementation (public-domain style)
function md5(str: string): string {
  function toHex(n: number) { let s = ""; for (let i = 0; i < 4; i++) s += ("0" + ((n >> (i * 8)) & 0xff).toString(16)).slice(-2); return s; }
  function add32(a: number, b: number) { return (a + b) & 0xffffffff; }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { const n = add32(add32(a, (b & c) | (~b & d)), add32(x, t)); return add32((n << s) | (n >>> (32 - s)), b); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { const n = add32(add32(a, (b & d) | (c & ~d)), add32(x, t)); return add32((n << s) | (n >>> (32 - s)), b); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { const n = add32(add32(a, b ^ c ^ d), add32(x, t)); return add32((n << s) | (n >>> (32 - s)), b); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { const n = add32(add32(a, c ^ (b | ~d)), add32(x, t)); return add32((n << s) | (n >>> (32 - s)), b); }
  const bytes: number[] = [];
  const utf8 = new TextEncoder().encode(str);
  for (const b of utf8) bytes.push(b);
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 0; i < 8; i++) bytes.push((bitLen >>> (i * 8)) & 0xff);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  for (let i = 0; i < bytes.length; i += 64) {
    const x: number[] = new Array(16);
    for (let j = 0; j < 16; j++) x[j] = bytes[i + j * 4] | (bytes[i + j * 4 + 1] << 8) | (bytes[i + j * 4 + 2] << 16) | (bytes[i + j * 4 + 3] << 24);
    const aa = a, bb = b, cc = c, dd = d;
    a = ff(a, b, c, d, x[0], 7, 0xd76aa478); d = ff(d, a, b, c, x[1], 12, 0xe8c7b756); c = ff(c, d, a, b, x[2], 17, 0x242070db); b = ff(b, c, d, a, x[3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, x[4], 7, 0xf57c0faf); d = ff(d, a, b, c, x[5], 12, 0x4787c62a); c = ff(c, d, a, b, x[6], 17, 0xa8304613); b = ff(b, c, d, a, x[7], 22, 0xfd469501);
    a = ff(a, b, c, d, x[8], 7, 0x698098d8); d = ff(d, a, b, c, x[9], 12, 0x8b44f7af); c = ff(c, d, a, b, x[10], 17, 0xffff5bb1); b = ff(b, c, d, a, x[11], 22, 0x895cd7be);
    a = ff(a, b, c, d, x[12], 7, 0x6b901122); d = ff(d, a, b, c, x[13], 12, 0xfd987193); c = ff(c, d, a, b, x[14], 17, 0xa679438e); b = ff(b, c, d, a, x[15], 22, 0x49b40821);
    a = gg(a, b, c, d, x[1], 5, 0xf61e2562); d = gg(d, a, b, c, x[6], 9, 0xc040b340); c = gg(c, d, a, b, x[11], 14, 0x265e5a51); b = gg(b, c, d, a, x[0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[5], 5, 0xd62f105d); d = gg(d, a, b, c, x[10], 9, 0x02441453); c = gg(c, d, a, b, x[15], 14, 0xd8a1e681); b = gg(b, c, d, a, x[4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[9], 5, 0x21e1cde6); d = gg(d, a, b, c, x[14], 9, 0xc33707d6); c = gg(c, d, a, b, x[3], 14, 0xf4d50d87); b = gg(b, c, d, a, x[8], 20, 0x455a14ed);
    a = gg(a, b, c, d, x[13], 5, 0xa9e3e905); d = gg(d, a, b, c, x[2], 9, 0xfcefa3f8); c = gg(c, d, a, b, x[7], 14, 0x676f02d9); b = gg(b, c, d, a, x[12], 20, 0x8d2a4c8a);
    a = hh(a, b, c, d, x[5], 4, 0xfffa3942); d = hh(d, a, b, c, x[8], 11, 0x8771f681); c = hh(c, d, a, b, x[11], 16, 0x6d9d6122); b = hh(b, c, d, a, x[14], 23, 0xfde5380c);
    a = hh(a, b, c, d, x[1], 4, 0xa4beea44); d = hh(d, a, b, c, x[4], 11, 0x4bdecfa9); c = hh(c, d, a, b, x[7], 16, 0xf6bb4b60); b = hh(b, c, d, a, x[10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, x[13], 4, 0x289b7ec6); d = hh(d, a, b, c, x[0], 11, 0xeaa127fa); c = hh(c, d, a, b, x[3], 16, 0xd4ef3085); b = hh(b, c, d, a, x[6], 23, 0x04881d05);
    a = hh(a, b, c, d, x[9], 4, 0xd9d4d039); d = hh(d, a, b, c, x[12], 11, 0xe6db99e5); c = hh(c, d, a, b, x[15], 16, 0x1fa27cf8); b = hh(b, c, d, a, x[2], 23, 0xc4ac5665);
    a = ii(a, b, c, d, x[0], 6, 0xf4292244); d = ii(d, a, b, c, x[7], 10, 0x432aff97); c = ii(c, d, a, b, x[14], 15, 0xab9423a7); b = ii(b, c, d, a, x[5], 21, 0xfc93a039);
    a = ii(a, b, c, d, x[12], 6, 0x655b59c3); d = ii(d, a, b, c, x[3], 10, 0x8f0ccc92); c = ii(c, d, a, b, x[10], 15, 0xffeff47d); b = ii(b, c, d, a, x[1], 21, 0x85845dd1);
    a = ii(a, b, c, d, x[8], 6, 0x6fa87e4f); d = ii(d, a, b, c, x[15], 10, 0xfe2ce6e0); c = ii(c, d, a, b, x[6], 15, 0xa3014314); b = ii(b, c, d, a, x[13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, x[4], 6, 0xf7537e82); d = ii(d, a, b, c, x[11], 10, 0xbd3af235); c = ii(c, d, a, b, x[2], 15, 0x2ad7d2bb); b = ii(b, c, d, a, x[9], 21, 0xeb86d391);
    a = add32(a, aa); b = add32(b, bb); c = add32(c, cc); d = add32(d, dd);
  }
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

async function hashSubtle(algo: Exclude<Algo, "MD5">, msg: string, hmacKey?: string) {
  const enc = new TextEncoder();
  const data = enc.encode(msg);
  if (hmacKey) {
    const key = await crypto.subtle.importKey("raw", enc.encode(hmacKey), { name: "HMAC", hash: algo }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, data as BufferSource);
    return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  const buf = await crypto.subtle.digest(algo, data as BufferSource);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGeneratorAdvancedTool() {
  const [algo, setAlgo] = useState<Algo>("SHA-256");
  const [text, setText] = useState("Hello, world!");
  const [uppercase, setUppercase] = useState(false);
  const [hmacKey, setHmacKey] = useState("");
  const [hash, setHash] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        let h = "";
        if (algo === "MD5") {
          if (hmacKey) { setHash("(HMAC-MD5 not supported here — use SHA-2)"); return; }
          h = md5(text);
        } else h = await hashSubtle(algo, text, hmacKey || undefined);
        if (!cancel) setHash(uppercase ? h.toUpperCase() : h);
      } catch (e) {
        if (!cancel) setHash("Error: " + (e instanceof Error ? e.message : "hash failed"));
      }
    })();
    return () => { cancel = true; };
  }, [algo, text, uppercase, hmacKey]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Algorithm</Label>
          <Select value={algo} onValueChange={(v) => setAlgo(v as Algo)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MD5">MD5</SelectItem>
              <SelectItem value="SHA-1">SHA-1</SelectItem>
              <SelectItem value="SHA-256">SHA-256</SelectItem>
              <SelectItem value="SHA-384">SHA-384</SelectItem>
              <SelectItem value="SHA-512">SHA-512</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>HMAC key (optional)</Label><Input value={hmacKey} onChange={(e) => setHmacKey(e.target.value)} placeholder="Leave blank for plain hash" className="mt-1" /></div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} /> Uppercase</label></div>
      </div>
      <div>
        <Label>Input text</Label>
        <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className="mt-1 font-mono text-sm" />
      </div>
      <div className="rounded-lg border p-3 text-xs text-muted-foreground">{INFO[algo]}</div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label>Hash · {hash.length ? `${hash.length} hex chars` : ""}</Label>
          {hash && <button className="text-xs underline" onClick={() => { navigator.clipboard.writeText(hash); toast.success("Copied"); }}>Copy</button>}
        </div>
        <Textarea rows={3} readOnly value={hash} className="font-mono text-xs" />
      </div>
      {hash && (
        <Button variant="outline" onClick={() => {
          const blob = new Blob([hash], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = `${algo.toLowerCase()}.txt`; a.click();
          URL.revokeObjectURL(url);
        }}>Download</Button>
      )}
    </div>
  );
}