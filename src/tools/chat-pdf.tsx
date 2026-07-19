import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { callAi } from "@/lib/ai-client";
import { extractPdfText } from "./pdf-text";
import { FileText, Upload } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
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

  const ask = async (q: string) => {
    if (!q || !pdfText) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setLoading(true); setError(null);
    try {
      const content = await callAi({ action: "chat-pdf", pdfText, question: q, history: messages.slice(-10) });
      setMessages([...next, { role: "assistant", content }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  };

  const onPromptSubmit = async (message: PromptInputMessage) => {
    await ask(message.text.trim());
  };

  const chatStatus: "submitted" | undefined = loading && messages.length > 0 ? "submitted" : undefined;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-dashed border-border bg-background p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Upload className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Upload PDF</div>
              <div className="text-xs text-muted-foreground">Text-based PDFs work best. Scanned files may need OCR first.</div>
            </div>
          </div>
          <Input className="sm:max-w-xs" type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>
      {file && pdfText && (
        <div className="rounded-xl border border-border bg-background p-4 text-sm">
          <span className="font-medium">{file.name}</span>
          <span className="text-muted-foreground"> — {pdfText.length.toLocaleString()} characters extracted. Ask questions below.</span>
        </div>
      )}
      {pdfText && (
        <div className="rounded-xl border border-border bg-background">
          <Conversation className="h-[430px]">
            <ConversationContent>
            {messages.length === 0 && (
              <ConversationEmptyState
                icon={<FileText className="size-8" />}
                title="Chat with this PDF"
                description="Ask for summaries, key points, definitions, or specific facts from the document."
              />
            )}
            {messages.map((m, i) => (
              <Message key={i} from={m.role}>
                <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-assistant]:w-full group-[.is-assistant]:max-w-full">
                  {m.role === "assistant" ? <MessageResponse>{m.content}</MessageResponse> : m.content}
                </MessageContent>
              </Message>
            ))}
            {loading && messages.length > 0 && (
              <Message from="assistant">
                <MessageContent className="group-[.is-assistant]:w-full group-[.is-assistant]:max-w-full">
                  <Shimmer>Thinking through the PDF…</Shimmer>
                </MessageContent>
              </Message>
            )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <PromptInput className="border-t border-border p-3" onSubmit={onPromptSubmit}>
            <PromptInputTextarea placeholder="Ask about this PDF…" disabled={loading} />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={chatStatus} disabled={loading} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      )}
      {loading && !messages.length && <p className="text-sm text-muted-foreground">Reading PDF…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}