import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Tone = "funny" | "professional" | "educational" | "storytelling";
type Template = "product-review" | "tutorial" | "trend" | "storytelling";

const TEMPLATES: Record<Template, (topic: string, keyword: string, tone: Tone) => string> = {
  "product-review": (t, k, tone) => {
    const opener: Record<Tone, string> = {
      funny: `POV: You bought ${t} so you didn't have to 😅`,
      professional: `Honest review of ${t} after using it every day.`,
      educational: `3 things nobody tells you about ${t}.`,
      storytelling: `I almost returned ${t}… then this happened.`,
    };
    return `${opener[tone]}\n\n✅ What I loved\n⚠️ What could be better\n💡 Would I buy it again?\n\nWatch till the end for my verdict on ${k}.`;
  },
  tutorial: (t, k, tone) => {
    const opener: Record<Tone, string> = {
      funny: `Stop scrolling — ${t} in 30 seconds (no BS).`,
      professional: `Step-by-step: ${t}.`,
      educational: `Learn ${t} — the beginner-friendly way.`,
      storytelling: `The ${t} trick I wish I knew 5 years ago.`,
    };
    return `${opener[tone]}\n\nStep 1 · Set it up\nStep 2 · Do the thing\nStep 3 · Save the result\n\nSave this for later 📌 · Keyword: ${k}`;
  },
  trend: (t, k, tone) => {
    const opener: Record<Tone, string> = {
      funny: `Trying the ${t} trend so you don't have to 💀`,
      professional: `Breaking down the ${t} trend and why it works.`,
      educational: `Why the ${t} trend is everywhere right now.`,
      storytelling: `I did the ${t} trend and the internet reacted…`,
    };
    return `${opener[tone]}\n\nDid I nail it or fail it? Comment below 👇\n\n${k} lovers, this one's for you.`;
  },
  storytelling: (t, _k, tone) => {
    const opener: Record<Tone, string> = {
      funny: `Story time: how ${t} ruined my week (in a good way).`,
      professional: `A short story about ${t}.`,
      educational: `Story: what ${t} taught me.`,
      storytelling: `Nobody talks about this part of ${t}…`,
    };
    return `${opener[tone]}\n\nPart 1 of ? · Follow for the rest 🎬`;
  },
};

function suggestHashtags(topic: string, keyword: string) {
  const words = (topic + " " + keyword).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length >= 3);
  const seen = new Set<string>();
  const tags = ["fyp", "foryou", "foryoupage", "viral"];
  for (const w of words) { if (!seen.has(w)) { seen.add(w); tags.push(w); } if (tags.length >= 10) break; }
  return tags.slice(0, 10).map((t) => "#" + t).join(" ");
}

export default function TikTokCaptionGenerator() {
  const [topic, setTopic] = useState("noise-cancelling headphones for creators");
  const [keyword, setKeyword] = useState("creator gear");
  const [tone, setTone] = useState<Tone>("funny");
  const [template, setTemplate] = useState<Template>("product-review");

  const caption = useMemo(() => TEMPLATES[template](topic || "your topic", keyword || "your keyword", tone), [topic, keyword, tone, template]);
  const hashtags = useMemo(() => suggestHashtags(topic, keyword), [topic, keyword]);
  const full = caption + "\n\n" + hashtags;
  const count = full.length;
  const over = count > 2200;

  const copy = async () => { await navigator.clipboard.writeText(full); toast.success("Caption copied"); };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Video topic</Label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div>
          <Label>Keyword</Label>
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <div>
          <Label>Tone</Label>
          <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="funny">Funny</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
              <SelectItem value="storytelling">Storytelling</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Template</Label>
          <Select value={template} onValueChange={(v) => setTemplate(v as Template)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="product-review">Product review</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
              <SelectItem value="trend">Trend</SelectItem>
              <SelectItem value="storytelling">Storytelling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Caption + hashtags</Label>
          <span className={`text-xs ${over ? "text-destructive" : "text-muted-foreground"}`}>{count} / 2200</span>
        </div>
        <Textarea rows={12} value={full} readOnly />
      </div>

      <Button onClick={copy}>Copy caption</Button>
    </div>
  );
}