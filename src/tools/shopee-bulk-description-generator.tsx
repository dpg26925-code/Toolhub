import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Tool() {
  const [name, setName] = useState("Wireless Earbuds Pro");
  const [feats, setFeats] = useState("Bluetooth 5.3, IPX5, 30h battery, touch controls, dual mic");
  const [tone, setTone] = useState<"formal" | "casual">("casual");
  const [tick, setTick] = useState(0);

  const variants = useMemo(() => {
    void tick;
    const list = feats.split(",").map((s) => s.trim()).filter(Boolean);
    const emojis = ["✨","🔥","💯","🎁","⚡","💎","🏆"];
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const bullets = list.map((f) => `${pick(emojis)} ${f}`).join("\n");
    return [
      `🌟 ${name} 🌟\n\n${bullets}\n\n📦 Ship trong 24h · 🔄 Đổi trả 7 ngày · 💯 Chính hãng\n\n#shopeevn #${name.toLowerCase().replace(/\s/g, "")}`,
      `Bạn đang tìm ${name}? Đây rồi!\n\n${bullets}\n\n💌 Đặt hàng ngay để nhận ưu đãi!`,
      tone === "formal" ? `Introducing the ${name}.\n\nKey features:\n${list.map((f) => `• ${f}`).join("\n")}\n\nOfficial warranty. Fast shipping.` : `Ngại gì không đặt liền ${name} 🤩\n\n${bullets}\n\n#viral #musthave`,
      `${pick(emojis)} ${name.toUpperCase()} ${pick(emojis)}\n\nWhy customers love it:\n${bullets}\n\nHurry — limited stock!`,
      `【HOT】${name}\n\n${list.map((f, i) => `${i + 1}. ${f}`).join("\n")}\n\n⭐ 4.9/5 from 10k+ orders`,
    ];
  }, [name, feats, tone, tick]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Product name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1"/></div>
        <div><Label>Tone</Label>
          <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="casual">Casual</SelectItem><SelectItem value="formal">Formal</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2"><Label>Features (comma)</Label><Input value={feats} onChange={(e) => setFeats(e.target.value)} className="mt-1"/></div>
      </div>
      <Button onClick={() => setTick((t) => t + 1)}>Regenerate</Button>
      {variants.map((v, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold">Variant {i + 1} · {v.length} chars</span>
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(v); toast.success("Copied"); }}>Copy</Button></div>
          <Textarea rows={6} readOnly value={v} className="font-mono text-xs"/>
        </div>
      ))}
    </div>
  );
}