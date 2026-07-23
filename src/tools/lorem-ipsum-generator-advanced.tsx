import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Kind = "paragraphs" | "sentences" | "words";
type Format = "text" | "html" | "markdown";

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");

function rw() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }
function sentence(minW = 6, maxW = 14) {
  const len = minW + Math.floor(Math.random() * (maxW - minW + 1));
  const words = Array.from({ length: len }, rw);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}
function paragraph(minS = 4, maxS = 8) {
  const n = minS + Math.floor(Math.random() * (maxS - minS + 1));
  return Array.from({ length: n }, () => sentence()).join(" ");
}

export default function LoremIpsumGeneratorAdvancedTool() {
  const [kind, setKind] = useState<Kind>("paragraphs");
  const [count, setCount] = useState(3);
  const [format, setFormat] = useState<Format>("text");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [tick, setTick] = useState(0);

  const output = useMemo(() => {
    void tick;
    let items: string[] = [];
    if (kind === "words") items = Array.from({ length: count }, rw);
    else if (kind === "sentences") items = Array.from({ length: count }, () => sentence());
    else items = Array.from({ length: count }, () => paragraph());
    if (startWithLorem && items.length) {
      if (kind === "words") { items = ["lorem", "ipsum", ...items.slice(2)].slice(0, count); }
      else items[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + items[0];
    }
    if (kind === "words") return items.join(" ");
    if (format === "html") return items.map((t) => `<p>${t}</p>`).join("\n");
    if (format === "markdown") return items.map((t) => `${t}`).join("\n\n");
    return items.join("\n\n");
  }, [kind, count, format, startWithLorem, tick]);

  const download = () => {
    const ext = format === "html" ? "html" : format === "markdown" ? "md" : "txt";
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `lorem.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label>Type</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="paragraphs">Paragraphs</SelectItem><SelectItem value="sentences">Sentences</SelectItem><SelectItem value="words">Words</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>How many</Label><Input type="number" min={1} max={200} value={count} onChange={(e) => setCount(Math.max(1, Math.min(200, +e.target.value)))} className="mt-1"/></div>
        <div>
          <Label>Format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as Format)} disabled={kind === "words"}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="text">Plain text</SelectItem><SelectItem value="html">HTML &lt;p&gt;</SelectItem><SelectItem value="markdown">Markdown</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)} /> Start with "Lorem ipsum"</label></div>
      </div>
      <Textarea rows={14} readOnly value={output} className="font-mono text-xs" />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setTick((t) => t + 1)}>Regenerate</Button>
        <Button variant="outline" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>Copy</Button>
        <Button variant="outline" onClick={download}>Download</Button>
      </div>
    </div>
  );
}