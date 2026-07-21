import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FontKey = "standard" | "small" | "big" | "block" | "bubble" | "banner";

const STANDARD: Record<string, string[]> = {
  A: ["  ##  ", " #  # ", "######", "#    #", "#    #"],
  B: ["##### ", "#    #", "##### ", "#    #", "##### "],
  C: [" #####", "#     ", "#     ", "#     ", " #####"],
  D: ["##### ", "#    #", "#    #", "#    #", "##### "],
  E: ["######", "#     ", "####  ", "#     ", "######"],
  F: ["######", "#     ", "####  ", "#     ", "#     "],
  G: [" #####", "#     ", "#  ###", "#    #", " #####"],
  H: ["#    #", "#    #", "######", "#    #", "#    #"],
  I: [" #### ", "  ##  ", "  ##  ", "  ##  ", " #### "],
  J: ["   ###", "    # ", "    # ", "#   # ", " ###  "],
  K: ["#   # ", "#  #  ", "###   ", "#  #  ", "#   # "],
  L: ["#     ", "#     ", "#     ", "#     ", "######"],
  M: ["#    #", "##  ##", "# ## #", "#    #", "#    #"],
  N: ["#    #", "##   #", "# #  #", "#  # #", "#   ##"],
  O: [" #### ", "#    #", "#    #", "#    #", " #### "],
  P: ["##### ", "#    #", "##### ", "#     ", "#     "],
  Q: [" #### ", "#    #", "#  # #", "#   # ", " ### #"],
  R: ["##### ", "#    #", "##### ", "#  #  ", "#   # "],
  S: [" #####", "#     ", " #### ", "     #", "##### "],
  T: ["######", "  ##  ", "  ##  ", "  ##  ", "  ##  "],
  U: ["#    #", "#    #", "#    #", "#    #", " #### "],
  V: ["#    #", "#    #", "#    #", " #  # ", "  ##  "],
  W: ["#    #", "#    #", "# ## #", "##  ##", "#    #"],
  X: ["#    #", " #  # ", "  ##  ", " #  # ", "#    #"],
  Y: ["#    #", " #  # ", "  ##  ", "  ##  ", "  ##  "],
  Z: ["######", "    # ", "   #  ", "  #   ", "######"],
  "0": [" #### ", "#   ##", "#  # #", "## # #", " #### "],
  "1": ["  ##  ", " ###  ", "  ##  ", "  ##  ", " #### "],
  "2": [" #### ", "#    #", "   ## ", " ##   ", "######"],
  "3": [" #### ", "#    #", "  ### ", "#    #", " #### "],
  "4": ["#   # ", "#   # ", "######", "    # ", "    # "],
  "5": ["######", "#     ", "##### ", "     #", "##### "],
  "6": [" #### ", "#     ", "##### ", "#    #", " #### "],
  "7": ["######", "    # ", "   #  ", "  #   ", " #    "],
  "8": [" #### ", "#    #", " #### ", "#    #", " #### "],
  "9": [" #### ", "#    #", " #####", "     #", " #### "],
  " ": ["      ", "      ", "      ", "      ", "      "],
  "!": ["  ##  ", "  ##  ", "  ##  ", "      ", "  ##  "],
  "?": [" #### ", "#    #", "   ## ", "      ", "  ##  "],
  ".": ["      ", "      ", "      ", "      ", "  ##  "],
  ",": ["      ", "      ", "      ", "  ##  ", " #    "],
  "-": ["      ", "      ", "######", "      ", "      "],
};

function render(text: string, ink: string, height: 3 | 5 | 7) {
  const t = text.toUpperCase();
  const glyphs = t.split("").map((c) => STANDARD[c] || STANDARD[" "]);
  const lines: string[] = [];
  for (let r = 0; r < 5; r++) lines.push(glyphs.map((g) => g[r]).join(" "));
  let picked = lines;
  if (height === 3) picked = lines.filter((_, i) => i !== 1 && i !== 3);
  else if (height === 7) picked = lines.flatMap((l) => [l, l]).slice(0, 7);
  return picked.join("\n").replaceAll("#", ink);
}

const FONTS: { key: FontKey; label: string; ink: string; height: 3 | 5 | 7 }[] = [
  { key: "standard", label: "Standard", ink: "#", height: 5 },
  { key: "small", label: "Small", ink: "#", height: 3 },
  { key: "big", label: "Big", ink: "█", height: 7 },
  { key: "block", label: "Block", ink: "█", height: 5 },
  { key: "bubble", label: "Bubble", ink: "●", height: 5 },
  { key: "banner", label: "Banner", ink: "*", height: 5 },
];

export default function AsciiArtGenerator() {
  const [text, setText] = useState("HELLO");
  const [fontKey, setFontKey] = useState<FontKey>("standard");

  const font = FONTS.find((f) => f.key === fontKey)!;
  const art = useMemo(() => render(text || " ", font.ink, font.height), [text, font]);
  const width = art.split("\n").reduce((m, l) => Math.max(m, l.length), 0);

  const copy = async () => { await navigator.clipboard.writeText(art); toast.success("ASCII art copied"); };
  const download = () => {
    const blob = new Blob([art], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${(text || "ascii").toLowerCase()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><Label>Text (A–Z, 0–9, punctuation, max 20 chars)</Label><Input value={text} onChange={(e) => setText(e.target.value.slice(0, 20))} className="mt-1" placeholder="HELLO" /></div>
        <div>
          <Label>Font style</Label>
          <select value={fontKey} onChange={(e) => setFontKey(e.target.value as FontKey)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {FONTS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Preview · {width} chars wide × {font.height} rows tall</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copy}>Copy</Button>
            <Button size="sm" variant="outline" onClick={download}>Download .txt</Button>
          </div>
        </div>
        <pre className="overflow-x-auto whitespace-pre font-mono text-xs leading-tight text-foreground sm:text-sm">{art}</pre>
      </div>

      <p className="text-xs text-muted-foreground">Supports uppercase A–Z, 0–9, space and basic punctuation (! ? . , -). Lowercase letters are auto-capitalised.</p>
    </div>
  );
}