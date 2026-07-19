import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { callAi } from "@/lib/ai-client";

type Mode = "grammar-check" | "paragraph" | "email" | "blog-titles" | "expand" | "tone";

export function WritingTool({
  mode,
  toolSlug,
  placeholder,
  buttonLabel,
  optionLabel,
  optionValues,
  defaultOption,
}: {
  mode: Mode;
  toolSlug: string;
  placeholder: string;
  buttonLabel: string;
  optionLabel?: string;
  optionValues?: string[];
  defaultOption?: string;
}) {
  const [text, setText] = useState("");
  const [option, setOption] = useState(defaultOption ?? optionValues?.[0] ?? "");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setOut("");
    try {
      const content = await callAi({ action: "writing", text, mode, option, toolSlug });
      setOut(content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(out);
    toast.success("Copied");
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px]"
      />
      {optionLabel && optionValues && optionValues.length > 0 && (
        <div>
          <Label>{optionLabel}</Label>
          <Select value={option} onValueChange={setOption}>
            <SelectTrigger className="mt-2 max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {optionValues.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button onClick={run} disabled={!text.trim() || busy}>
        {busy ? "Working…" : buttonLabel}
      </Button>
      {out && (
        <div className="space-y-2">
          <div className="rounded-xl border border-border bg-background p-4 whitespace-pre-wrap text-sm">{out}</div>
          <Button size="sm" variant="outline" onClick={copy}>Copy</Button>
        </div>
      )}
    </div>
  );
}