import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Stop = { color: string; pos: number };

export default function GradientGeneratorTool() {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([{ color: "#7c3aed", pos: 0 }, { color: "#ec4899", pos: 100 }]);

  const css = useMemo(() => {
    const parts = stops.map((s) => `${s.color} ${s.pos}%`).join(", ");
    return type === "linear" ? `linear-gradient(${angle}deg, ${parts})` : `radial-gradient(circle, ${parts})`;
  }, [type, angle, stops]);

  const update = (i: number, patch: Partial<Stop>) => setStops(stops.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => stops.length > 2 && setStops(stops.filter((_, j) => j !== i));
  const add = () => setStops([...stops, { color: "#22d3ee", pos: 50 }]);

  return (
    <div className="space-y-4">
      <div className="h-56 w-full rounded-xl border" style={{ background: css }} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Type</Label>
          <select value={type} onChange={(e) => setType(e.target.value as "linear" | "radial")} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="linear">Linear</option><option value="radial">Radial</option></select>
        </div>
        {type === "linear" && (
          <div className="sm:col-span-2"><Label>Angle: {angle}°</Label><Slider className="mt-3" min={0} max={360} step={1} value={[angle]} onValueChange={([v]) => setAngle(v)} /></div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><Label>Color stops</Label><Button size="sm" variant="outline" onClick={add}>Add stop</Button></div>
        {stops.map((s, i) => (
          <div key={i} className="grid grid-cols-[80px_1fr_100px_auto] items-center gap-2">
            <Input type="color" value={s.color} onChange={(e) => update(i, { color: e.target.value })} className="h-10"/>
            <Slider min={0} max={100} step={1} value={[s.pos]} onValueChange={([v]) => update(i, { pos: v })}/>
            <Input type="number" min={0} max={100} value={s.pos} onChange={(e) => update(i, { pos: +e.target.value })}/>
            <Button size="sm" variant="ghost" onClick={() => remove(i)} disabled={stops.length <= 2}>×</Button>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><Label>CSS</Label><Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`background: ${css};`); toast.success("Copied"); }}>Copy</Button></div>
        <Textarea readOnly value={`background: ${css};`} className="font-mono text-xs"/>
      </div>
    </div>
  );
}