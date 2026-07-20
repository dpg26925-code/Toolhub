import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function wifiPayload(ssid: string, pass: string, enc: string, hidden: boolean) {
  const esc = (s: string) => s.replace(/([\\;,":])/g, "\\$1");
  return `WIFI:T:${enc};S:${esc(ssid)};P:${esc(pass)};${hidden ? "H:true;" : ""};`;
}
function vcardPayload(f: { name: string; org: string; phone: string; email: string; url: string }) {
  return `BEGIN:VCARD\nVERSION:3.0\nFN:${f.name}\nORG:${f.org}\nTEL:${f.phone}\nEMAIL:${f.email}\nURL:${f.url}\nEND:VCARD`;
}

export default function QrCodeGeneratorTool() {
  const [mode, setMode] = useState("url");
  const [text, setText] = useState("https://nexatools.app");
  const [freeText, setFreeText] = useState("Hello from Nexatools");
  const [ssid, setSsid] = useState(""); const [pass, setPass] = useState(""); const [enc, setEnc] = useState("WPA"); const [hidden, setHidden] = useState(false);
  const [vc, setVc] = useState({ name: "", org: "", phone: "", email: "", url: "" });
  const [email, setEmail] = useState(""); const [subject, setSubject] = useState(""); const [body, setBody] = useState("");
  const [size, setSize] = useState(360);
  const [fg, setFg] = useState("#0f172a"); const [bg, setBg] = useState("#ffffff");
  const [level, setLevel] = useState<"L"|"M"|"Q"|"H">("M");
  const [dataUrl, setDataUrl] = useState("");

  const payload = mode === "url" ? text
    : mode === "text" ? freeText
    : mode === "wifi" ? wifiPayload(ssid, pass, enc, hidden)
    : mode === "vcard" ? vcardPayload(vc)
    : `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  useEffect(() => {
    if (!payload.trim()) return setDataUrl("");
    QRCode.toDataURL(payload, { width: size, margin: 2, errorCorrectionLevel: level, color: { dark: fg, light: bg } }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [payload, size, fg, bg, level]);

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="flex flex-wrap"><TabsTrigger value="url">URL</TabsTrigger><TabsTrigger value="text">Text</TabsTrigger><TabsTrigger value="wifi">Wi-Fi</TabsTrigger><TabsTrigger value="vcard">vCard</TabsTrigger><TabsTrigger value="email">Email</TabsTrigger></TabsList>
        <TabsContent value="url"><Input value={text} onChange={(e) => setText(e.target.value)} placeholder="https://…"/></TabsContent>
        <TabsContent value="text"><Textarea value={freeText} onChange={(e) => setFreeText(e.target.value)} className="min-h-[100px]"/></TabsContent>
        <TabsContent value="wifi" className="grid gap-3 sm:grid-cols-2">
          <div><Label>SSID</Label><Input value={ssid} onChange={(e) => setSsid(e.target.value)} className="mt-1"/></div>
          <div><Label>Password</Label><Input value={pass} onChange={(e) => setPass(e.target.value)} className="mt-1"/></div>
          <div><Label>Encryption</Label><select value={enc} onChange={(e) => setEnc(e.target.value)} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option>WPA</option><option>WEP</option><option value="nopass">None</option></select></div>
          <label className="flex items-end gap-2 text-sm"><input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)}/> Hidden network</label>
        </TabsContent>
        <TabsContent value="vcard" className="grid gap-3 sm:grid-cols-2">
          {(["name","org","phone","email","url"] as const).map((k) => (
            <div key={k}><Label className="capitalize">{k}</Label><Input value={vc[k]} onChange={(e) => setVc({ ...vc, [k]: e.target.value })} className="mt-1"/></div>
          ))}
        </TabsContent>
        <TabsContent value="email" className="grid gap-3 sm:grid-cols-2">
          <div><Label>To</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1"/></div>
          <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1"/></div>
          <div className="sm:col-span-2"><Label>Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} className="mt-1"/></div>
        </TabsContent>
      </Tabs>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Size (px)</Label><Input type="number" min={128} max={1024} value={size} onChange={(e) => setSize(+e.target.value || 360)} className="mt-1"/></div>
        <div><Label>Foreground</Label><Input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="mt-1 h-10"/></div>
        <div><Label>Background</Label><Input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-1 h-10"/></div>
        <div><Label>Error correction</Label><select value={level} onChange={(e) => setLevel(e.target.value as "L"|"M"|"Q"|"H")} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option>L</option><option>M</option><option>Q</option><option>H</option></select></div>
      </div>
      {dataUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={dataUrl} alt="QR code" className="rounded-lg border bg-white p-2" width={size} height={size}/>
          <Button asChild variant="outline"><a href={dataUrl} download="qr.png">Download PNG</a></Button>
        </div>
      )}
    </div>
  );
}