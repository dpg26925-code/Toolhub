import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [d, setD] = useState("Format, validate and minify JSON online — free, fast, and 100% in your browser. No sign-up required.");
  const [kw, setKw] = useState("JSON");
  const inKw = kw && d.toLowerCase().includes(kw.toLowerCase());
  const hasCta = /free|try|start|discover|learn|get/i.test(d);
  const score = (d.length >= 140 && d.length <= 160 ? 40 : d.length > 100 ? 25 : 10) + (inKw ? 30 : 0) + (hasCta ? 30 : 0);
  return (
    <div className="space-y-4">
      <div><Label>Meta description</Label><Textarea value={d} onChange={(e) => setD(e.target.value)} className="mt-1 min-h-[100px]"/></div>
      <div><Label>Target keyword</Label><Input value={kw} onChange={(e) => setKw(e.target.value)} className="mt-1 max-w-md"/></div>
      <div className="rounded-lg border p-3">
        <div className="mb-1 text-xs text-muted-foreground">Google SERP preview</div>
        <div className="text-sm">{d.length > 160 ? d.slice(0, 157) + "…" : d}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Characters" value={`${d.length}/160`} ok={d.length >= 140 && d.length <= 160}/>
        <Stat label="Keyword" value={inKw ? "Present" : "Missing"} ok={!!inKw}/>
        <Stat label="Call-to-action" value={hasCta ? "Yes" : "No"} ok={hasCta}/>
        <Stat label="Score" value={`${score}/100`} ok={score >= 70}/>
      </div>
    </div>
  );
}
function Stat({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return <div className={`rounded-lg border p-3 ${ok ? "border-emerald-500/40 bg-emerald-500/5" : "bg-muted/30"}`}><div className="text-xs text-muted-foreground">{label}</div><div className={`mt-1 text-lg font-semibold ${ok ? "text-emerald-500" : ""}`}>{value}</div></div>;
}