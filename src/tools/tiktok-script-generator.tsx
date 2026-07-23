import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Tpl = "review" | "tutorial" | "unboxing" | "testimonial";

export default function Tool() {
  const [product, setProduct] = useState("Silk Face Mist");
  const [features, setFeatures] = useState("hydrating, travel size, cruelty-free");
  const [audience, setAudience] = useState("busy women in their 20s");
  const [tone, setTone] = useState("friendly");
  const [tpl, setTpl] = useState<Tpl>("review");
  const [duration, setDuration] = useState<"15" | "30" | "60">("30");

  const script = useMemo(() => {
    const feats = features.split(",").map((s) => s.trim()).filter(Boolean);
    const feat = feats[0] ?? "amazing quality";
    const hooks: Record<Tpl, string> = {
      review: `POV: You're a ${audience} and just found the ${product} you'll wish you knew about sooner.`,
      tutorial: `Wait — you're using ${product} wrong. Here's the 15-second fix.`,
      unboxing: `Unboxing the ${product} everyone's talking about... let's see if it lives up.`,
      testimonial: `Three weeks with the ${product}. Here's my honest review.`,
    };
    const secs = +duration;
    const shots = secs <= 15 ? 3 : secs <= 30 ? 5 : 8;
    const body: string[] = [];
    body.push(`[0-3s] HOOK — ${hooks[tpl]}`);
    body.push(`[3-6s] Show the product close-up. Voiceover: "It's ${feat} and honestly a game-changer for ${audience}."`);
    for (let i = 2; i < shots - 1; i++) {
      const f = feats[(i - 1) % Math.max(feats.length, 1)] ?? "worth every penny";
      body.push(`[${i * 4}-${(i + 1) * 4}s] Feature #${i}: ${f}. Show it in action, ${tone} tone.`);
    }
    body.push(`[${secs - 3}-${secs}s] CTA — "Grab yours before it sells out again. Link in bio 👇 #TikTokShop"`);
    return body.join("\n");
  }, [product, features, audience, tone, tpl, duration]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Product name</Label><Input value={product} onChange={(e) => setProduct(e.target.value)} className="mt-1"/></div>
        <div><Label>Target audience</Label><Input value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1"/></div>
        <div className="sm:col-span-2"><Label>Key features (comma separated)</Label><Input value={features} onChange={(e) => setFeatures(e.target.value)} className="mt-1"/></div>
        <div><Label>Tone</Label><Input value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1"/></div>
        <div><Label>Template</Label>
          <Select value={tpl} onValueChange={(v) => setTpl(v as Tpl)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="review">Review</SelectItem><SelectItem value="tutorial">Tutorial</SelectItem><SelectItem value="unboxing">Unboxing</SelectItem><SelectItem value="testimonial">Testimonial</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Duration</Label>
          <Select value={duration} onValueChange={(v) => setDuration(v as typeof duration)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="15">15s</SelectItem><SelectItem value="30">30s</SelectItem><SelectItem value="60">60s</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <Textarea rows={14} readOnly value={script} className="font-mono text-xs"/>
      <Button variant="outline" onClick={() => { navigator.clipboard.writeText(script); toast.success("Copied"); }}>Copy script</Button>
    </div>
  );
}