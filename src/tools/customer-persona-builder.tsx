import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [f, setF] = useState({ name: "Sarah", age: "34", job: "Marketing Manager", income: "$85k", goals: "Grow her brand's audience efficiently", pain: "Overwhelmed by juggling too many tools", channels: "LinkedIn, YouTube, industry newsletters", quote: "I need tools that just work — I don't have time to learn a new dashboard every week." });
  const upd = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  const exportMd = () => {
    const md = `# Persona: ${f.name}\n\n- **Age:** ${f.age}\n- **Job:** ${f.job}\n- **Income:** ${f.income}\n\n## Goals\n${f.goals}\n\n## Pain points\n${f.pain}\n\n## Channels\n${f.channels}\n\n## Quote\n> ${f.quote}\n`;
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = document.createElement("a"); a.href = url; a.download = `persona-${f.name}.md`; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Name</Label><Input value={f.name} onChange={(e) => upd("name", e.target.value)} className="mt-1"/></div>
        <div><Label>Age</Label><Input value={f.age} onChange={(e) => upd("age", e.target.value)} className="mt-1"/></div>
        <div><Label>Job title</Label><Input value={f.job} onChange={(e) => upd("job", e.target.value)} className="mt-1"/></div>
        <div><Label>Income</Label><Input value={f.income} onChange={(e) => upd("income", e.target.value)} className="mt-1"/></div>
      </div>
      <div><Label>Goals</Label><Textarea value={f.goals} onChange={(e) => upd("goals", e.target.value)} className="mt-1"/></div>
      <div><Label>Pain points</Label><Textarea value={f.pain} onChange={(e) => upd("pain", e.target.value)} className="mt-1"/></div>
      <div><Label>Channels</Label><Textarea value={f.channels} onChange={(e) => upd("channels", e.target.value)} className="mt-1"/></div>
      <div><Label>Signature quote</Label><Textarea value={f.quote} onChange={(e) => upd("quote", e.target.value)} className="mt-1"/></div>
      <Button onClick={exportMd}>Export Markdown</Button>
    </div>
  );
}