import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Cipher = "caesar" | "rot13" | "atbash" | "vigenere";

function shiftLetter(ch: string, shift: number) {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
  if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
  return ch;
}
function caesar(t: string, s: number) { return [...t].map((c) => shiftLetter(c, s)).join(""); }
function atbash(t: string) {
  return [...t].map((c) => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCharCode(90 - (code - 65));
    if (code >= 97 && code <= 122) return String.fromCharCode(122 - (code - 97));
    return c;
  }).join("");
}
function vigenere(text: string, key: string, encode: boolean) {
  const k = key.replace(/[^A-Za-z]/g, "");
  if (!k) return text;
  let ki = 0;
  return [...text].map((c) => {
    const isLetter = /[A-Za-z]/.test(c);
    if (!isLetter) return c;
    const shift = k.toUpperCase().charCodeAt(ki % k.length) - 65;
    ki++;
    return shiftLetter(c, encode ? shift : -shift);
  }).join("");
}

export default function CipherTool() {
  const [cipher, setCipher] = useState<Cipher>("caesar");
  const [shift, setShift] = useState(3);
  const [key, setKey] = useState("LEMON");
  const [text, setText] = useState("Hello, world!");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const output = useMemo(() => {
    if (cipher === "atbash") return atbash(text);
    if (cipher === "rot13") return caesar(text, 13);
    if (cipher === "caesar") return caesar(text, mode === "encode" ? shift : -shift);
    return vigenere(text, key, mode === "encode");
  }, [cipher, shift, key, text, mode]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label>Cipher</Label>
          <Select value={cipher} onValueChange={(v) => setCipher(v as Cipher)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="caesar">Caesar</SelectItem>
              <SelectItem value="rot13">ROT13</SelectItem>
              <SelectItem value="atbash">Atbash</SelectItem>
              <SelectItem value="vigenere">Vigenère</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")} disabled={cipher === "rot13" || cipher === "atbash"}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="encode">Encode</SelectItem>
              <SelectItem value="decode">Decode</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {cipher === "caesar" && (
          <div><Label>Shift</Label><Input type="number" min={1} max={25} value={shift} onChange={(e) => setShift(+e.target.value)} className="mt-1" /></div>
        )}
        {cipher === "vigenere" && (
          <div><Label>Key</Label><Input value={key} onChange={(e) => setKey(e.target.value)} className="mt-1" /></div>
        )}
      </div>
      <div><Label>Input</Label><Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} className="mt-1 font-mono text-sm" /></div>
      <div><div className="mb-1 flex items-center justify-between"><Label>Output</Label><Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>Copy</Button></div><Textarea rows={5} readOnly value={output} className="font-mono text-sm" /></div>
    </div>
  );
}