import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEMPLATES = [
  (b: string) => `${b}. Made simple.`,
  (b: string) => `Redefine what ${b} can do.`,
  (b: string) => `${b}, on your terms.`,
  (b: string) => `The smarter way to ${b}.`,
  (b: string) => `${b} that works for you.`,
  (b: string) => `Where ${b} meets craft.`,
  (b: string) => `Better ${b}. Guaranteed.`,
  (b: string) => `Rethink ${b}.`,
  (b: string) => `Everyday ${b}, elevated.`,
  (b: string) => `${b} without compromise.`,
];

export default function Tool() {
  const [brand, setBrand] = useState("coffee");
  const [out, setOut] = useState<string[]>([]);
  const [copied, setCopied] = useState(-1);
  return (
    <div className="space-y-4">
      <div><Label>Brand or category</Label><Input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 max-w-md"/></div>
      <Button onClick={() => setOut(TEMPLATES.map((f) => f(brand)))} disabled={!brand.trim()}>Generate slogans</Button>
      {out.length > 0 && <div className="space-y-2">{out.map((s, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <span className="font-medium">{s}</span>
          <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(s); setCopied(i); setTimeout(() => setCopied(-1), 1200); }}>{copied === i ? "Copied!" : "Copy"}</Button>
        </div>
      ))}</div>}
    </div>
  );
}