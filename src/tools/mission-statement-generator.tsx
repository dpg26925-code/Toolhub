import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [company, setCompany] = useState("Acme");
  const [what, setWhat] = useState("beautiful design tools");
  const [audience, setAudience] = useState("small businesses");
  const [value, setValue] = useState("save time and grow revenue");
  const [out, setOut] = useState("");
  const gen = () => setOut(`At ${company}, we build ${what} for ${audience} so they can ${value}. We are guided by curiosity, honesty, and craftsmanship — every decision starts with the people who use our product.`);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Company name</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1"/></div>
        <div><Label>What you make</Label><Input value={what} onChange={(e) => setWhat(e.target.value)} className="mt-1"/></div>
        <div><Label>Target audience</Label><Input value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1"/></div>
        <div><Label>The value you provide</Label><Input value={value} onChange={(e) => setValue(e.target.value)} className="mt-1"/></div>
      </div>
      <Button onClick={gen}>Generate mission statement</Button>
      {out && <Textarea readOnly value={out} className="min-h-[120px]"/>}
      {out && <Button variant="outline" onClick={() => navigator.clipboard.writeText(out)}>Copy</Button>}
    </div>
  );
}