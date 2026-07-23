import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Style = "question" | "statement" | "challenge" | "story" | "controversial" | "curiosity" | "benefit";

export default function Tool() {
  const [product, setProduct] = useState("noise-cancelling earbuds");
  const [pain, setPain] = useState("tired of tangled wires and dead batteries");
  const [style, setStyle] = useState<Style>("curiosity");

  const hooks = useMemo(() => {
    const p = product.trim() || "this product";
    const pn = pain.trim() || "your daily problem";
    const templates: Record<Style, string[]> = {
      question: [`Are you still using ${p} the wrong way?`, `What if I told you ${p} could fix ${pn}?`, `Do you know why nobody talks about ${p}?`, `Why is ${p} suddenly everywhere on your FYP?`],
      statement: [`${p} just changed everything.`, `I stopped ${pn} the day I found ${p}.`, `This is the ${p} I wish I had 2 years ago.`, `${p} is not a scam — here's proof.`],
      challenge: [`I tried ${p} for 7 days. Here's what happened.`, `Rating every ${p} so you don't have to.`, `${p} vs the viral one — no filter test.`, `Buying the cheapest and most expensive ${p} — the winner shocked me.`],
      story: [`So there I was ${pn}, and then I saw ${p}...`, `POV: You've been ${pn} for years. Then you find ${p}.`, `My sister said ${p} would fix it. She was right.`],
      controversial: [`Unpopular opinion: ${p} is overrated. Unless…`, `${p} isn't for everyone — stop lying to yourself.`, `Nobody wants to admit ${p} is actually life-changing.`],
      curiosity: [`The reason ${p} sells out in 3 minutes 👇`, `${p} — but not the one you're thinking of.`, `Wait for the end — this ${p} test surprised me.`, `The thing about ${p} that TikTok won't show you.`],
      benefit: [`Save $200 with this ${p} hack.`, `${p} that solves ${pn} in 5 seconds.`, `The ${p} that saved my mornings.`, `Get ${p} for less than a coffee — link in bio.`],
    };
    return templates[style];
  }, [product, pain, style]);

  const styles: [Style, string][] = [["question", "Question"], ["statement", "Statement"], ["challenge", "Challenge"], ["story", "Story"], ["controversial", "Controversial"], ["curiosity", "Curiosity"], ["benefit", "Benefit-driven"]];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Product / topic</Label><Input value={product} onChange={(e) => setProduct(e.target.value)} className="mt-1"/></div>
        <div><Label>Audience pain point</Label><Input value={pain} onChange={(e) => setPain(e.target.value)} className="mt-1"/></div>
      </div>
      <div className="flex flex-wrap gap-2">{styles.map(([k, n]) => <Button key={k} size="sm" variant={style === k ? "default" : "outline"} onClick={() => setStyle(k)}>{n}</Button>)}</div>
      <div className="space-y-2">
        {hooks.map((h, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="text-sm">{h}</div>
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(h); toast.success("Copied"); }}>Copy</Button>
          </div>
        ))}
      </div>
    </div>
  );
}