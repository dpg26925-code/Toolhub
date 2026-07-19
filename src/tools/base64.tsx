import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function encode(s: string) {
  return btoa(unescape(encodeURIComponent(s)));
}
function decode(s: string) {
  return decodeURIComponent(escape(atob(s.trim())));
}

export default function Base64Tool() {
  const [input, setInput] = useState("Hello, Nexatools!");
  const [output, setOutput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const run = (mode: "encode" | "decode") => {
    try {
      setOutput(mode === "encode" ? encode(input) : decode(input));
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Input</label>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[220px] font-mono text-xs" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Output</label>
          <Textarea value={output} readOnly className="min-h-[220px] font-mono text-xs" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => run("encode")}>Encode</Button>
        <Button variant="secondary" onClick={() => run("decode")}>Decode</Button>
        <Button variant="ghost" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }} disabled={!output}>Copy</Button>
        <Button variant="ghost" disabled={!output} onClick={() => {
          const blob = new Blob([output], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "base64.txt"; a.click();
          URL.revokeObjectURL(url);
        }}>Download</Button>
      </div>
      {err && <p className="text-sm text-destructive">Error: {err}</p>}
    </div>
  );
}