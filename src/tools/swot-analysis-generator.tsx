import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [s, setS] = useState(""); const [w, setW] = useState(""); const [o, setO] = useState(""); const [t, setT] = useState("");
  const exportMd = () => {
    const md = `# SWOT Analysis\n\n## Strengths\n${s || "- (add)"}\n\n## Weaknesses\n${w || "- (add)"}\n\n## Opportunities\n${o || "- (add)"}\n\n## Threats\n${t || "- (add)"}\n`;
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = document.createElement("a"); a.href = url; a.download = "swot.md"; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Q label="Strengths (internal +)" v={s} onChange={setS} color="emerald"/>
        <Q label="Weaknesses (internal −)" v={w} onChange={setW} color="red"/>
        <Q label="Opportunities (external +)" v={o} onChange={setO} color="sky"/>
        <Q label="Threats (external −)" v={t} onChange={setT} color="amber"/>
      </div>
      <Button onClick={exportMd}>Export Markdown</Button>
    </div>
  );
}
function Q({ label, v, onChange, color }: { label: string; v: string; onChange: (v: string) => void; color: string }) {
  return <div className={`rounded-lg border p-3 border-${color}-500/30 bg-${color}-500/5`}>
    <div className="mb-2 font-semibold">{label}</div>
    <Textarea value={v} onChange={(e) => onChange(e.target.value)} className="min-h-[120px] bg-background" placeholder="- one point per line"/>
  </div>;
}