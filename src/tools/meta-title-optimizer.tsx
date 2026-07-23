import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tool() {
  const [t, setT] = useState("Best JSON Formatter — Format, Validate & Minify Online");
  const [kw, setKw] = useState("JSON Formatter");
  const px = useMemo(() => Math.round(t.length * 8.4), [t]);
  const inKw = kw && t.toLowerCase().includes(kw.toLowerCase());
  const score = (t.length >= 50 && t.length <= 60 ? 40 : t.length > 40 ? 25 : 10) + (inKw ? 30 : 0) + (t.includes("|") || t.includes("—") ? 15 : 0) + (/[A-Z]/.test(t.charAt(0)) ? 15 : 0);
  return (
    <div className="space-y-4">
      <div><Label>Meta title</Label><Input value={t} onChange={(e) => setT(e.target.value)} className="mt-1"/></div>
      <div><Label>Target keyword</Label><Input value={kw} onChange={(e) => setKw(e.target.value)} className="mt-1 max-w-md"/></div>
      <div className="rounded-lg border p-3">
        <div className="mb-1 text-xs text-muted-foreground">Google SERP preview</div>
        <div className="text-lg text-blue-500">{t.length > 60 ? t.slice(0, 57) + "…" : t}</div>
        <div className="text-xs text-emerald-600">https://yoursite.com/page</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Characters" value={`${t.length}/60`} ok={t.length >= 50 && t.length <= 60}/>
        <Stat label="Pixels (~)" value={`${px}/580`} ok={px <= 580}/>
        <Stat label="Keyword" value={inKw ? "Present" : "Missing"} ok={!!inKw}/>
        <Stat label="Score" value={`${score}/100`} ok={score >= 70}/>
      </div>
    </div>
  );
}
function Stat({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return <div className={`rounded-lg border p-3 ${ok ? "border-emerald-500/40 bg-emerald-500/5" : "bg-muted/30"}`}><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${ok ? "text-emerald-500" : ""}`}>{value}</div></div>;
}