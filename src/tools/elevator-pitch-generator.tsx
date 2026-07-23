import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [who, setWho] = useState("small e-commerce brands");
  const [problem, setProblem] = useState("struggle to keep up with content across channels");
  const [solution, setSolution] = useState("an all-in-one AI content studio");
  const [diff, setDiff] = useState("built specifically for founders, not enterprise teams");
  const [out, setOut] = useState("");
  const gen = () => setOut(`We help ${who} who ${problem}. Our ${solution} does the heavy lifting, and unlike other tools it's ${diff}.`);
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Who you serve</Label><Input value={who} onChange={(e) => setWho(e.target.value)} className="mt-1"/></div>
        <div><Label>Problem</Label><Input value={problem} onChange={(e) => setProblem(e.target.value)} className="mt-1"/></div>
        <div><Label>Your solution</Label><Input value={solution} onChange={(e) => setSolution(e.target.value)} className="mt-1"/></div>
        <div><Label>Differentiator</Label><Input value={diff} onChange={(e) => setDiff(e.target.value)} className="mt-1"/></div>
      </div>
      <Button onClick={gen}>Generate pitch</Button>
      {out && <><Textarea readOnly value={out} className="min-h-[120px]"/><Button variant="outline" onClick={() => navigator.clipboard.writeText(out)}>Copy</Button></>}
    </div>
  );
}