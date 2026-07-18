import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatWithPdf } from "@/lib/ai.functions";
import { extractPdfText } from "./pdf-text";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPdfTool() {
  const call = useServerFn(chatWithPdf);
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onFile = async (f: File | null) => {
    setError(null); setMessages([]); setPdfText(""); setFile(f);
    if (!f) return;
    setLoading(true);
    try {
      const text = await extractPdfText(await f.arrayBuffer());
      if (!text.trim()) throw new Error("No text found in this PDF (is it scanned?)");
      setPdfText(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read PDF");
    } finally { setLoading(false); }
  };

  const send = async () => {
    const q = input.trim();
    if (!q || !pdfText) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setLoading(true); setError(null);
    try {
      const r = await call({ data: { pdfText, question: q, history: messages.slice(-10) } });
      setMessages([...next, { role: "assistant", content: r.answer }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {file && pdfText && (
        <p className="text-xs text-muted-foreground">
          Loaded <span className="font-medium">{file.name}</span> — {pdfText.length.toLocaleString()} characters extracted.
        </p>
      )}
      {pdfText && (
        <div className="rounded-xl border border-border bg-background">
          <div className="max-h-[400px] min-h-[200px] space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">Ask a question about this PDF to get started.</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[80%] rounded-2xl bg-muted px-4 py-2 text-sm"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && messages.length > 0 && (
              <div className="mr-auto max-w-[80%] rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
                Thinking…
              </div>
            )}
          </div>
          <div className="flex gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && send()}
              placeholder="Ask about this PDF…"
              disabled={loading}
            />
            <Button onClick={send} disabled={loading || !input.trim()}>Send</Button>
          </div>
        </div>
      )}
      {loading && !messages.length && <p className="text-sm text-muted-foreground">Reading PDF…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}