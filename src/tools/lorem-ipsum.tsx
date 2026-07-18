import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");

const rand = (n: number) => Math.floor(Math.random() * n);
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const sentence = () => {
  const len = 6 + rand(12);
  const words = Array.from({ length: len }, () => WORDS[rand(WORDS.length)]);
  return cap(words.join(" ")) + ".";
};

const paragraph = () => {
  const len = 3 + rand(5);
  return Array.from({ length: len }, sentence).join(" ");
};

type Unit = "paragraphs" | "sentences" | "words";

export default function LoremIpsumTool() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [seed, setSeed] = useState(0);

  const output = useMemo(() => {
    void seed;
    const n = Math.max(1, Math.min(count, 100));
    if (unit === "paragraphs") return Array.from({ length: n }, paragraph).join("\n\n");
    if (unit === "sentences") return Array.from({ length: n }, sentence).join(" ");
    return Array.from({ length: n }, () => WORDS[rand(WORDS.length)]).join(" ");
  }, [unit, count, seed]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Unit</Label>
          <div className="mt-1 flex rounded-lg border border-border p-1">
            {(["paragraphs", "sentences", "words"] as Unit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`rounded-md px-3 py-1 text-sm capitalize transition ${
                  unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="w-24">
          <Label htmlFor="count">Count</Label>
          <Input
            id="count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 1)}
          />
        </div>
        <Button variant="outline" onClick={() => setSeed((s) => s + 1)}>
          Regenerate
        </Button>
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(output);
            toast.success("Copied to clipboard");
          }}
        >
          Copy
        </Button>
      </div>
      <Textarea value={output} readOnly className="min-h-[280px] font-mono text-sm" />
    </div>
  );
}