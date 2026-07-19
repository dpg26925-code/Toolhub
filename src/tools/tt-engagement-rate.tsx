import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TtEngagementRate() {
  const [likes, setLikes] = useState(1200);
  const [comments, setComments] = useState(80);
  const [shares, setShares] = useState(40);
  const [saves, setSaves] = useState(60);
  const [views, setViews] = useState(25000);
  const [followers, setFollowers] = useState(5000);
  const eng = likes + comments + shares + saves;
  const byViews = views ? (eng / views) * 100 : 0;
  const byFollowers = followers ? (eng / followers) * 100 : 0;
  const band = useMemo(() => {
    if (byViews >= 10) return { label: "Excellent", color: "text-emerald-600" };
    if (byViews >= 5) return { label: "Great", color: "text-emerald-500" };
    if (byViews >= 3) return { label: "Good", color: "text-amber-500" };
    if (byViews >= 1) return { label: "Average", color: "text-orange-500" };
    return { label: "Below average", color: "text-destructive" };
  }, [byViews]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field l="Likes" v={likes} on={setLikes} />
        <Field l="Comments" v={comments} on={setComments} />
        <Field l="Shares" v={shares} on={setShares} />
        <Field l="Saves" v={saves} on={setSaves} />
        <Field l="Views" v={views} on={setViews} />
        <Field l="Followers" v={followers} on={setFollowers} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Result l="Engagement rate (by views)" v={`${byViews.toFixed(2)}%`} sub={band.label} color={band.color} />
        <Result l="Engagement rate (by followers)" v={`${byFollowers.toFixed(2)}%`} sub={`${eng.toLocaleString()} total interactions`} />
      </div>
    </div>
  );
}
function Field({ l, v, on }: { l: string; v: number; on: (n: number) => void }) {
  return <div><Label>{l}</Label><Input type="number" min={0} value={v} onChange={(e) => on(Math.max(0, +e.target.value || 0))} className="mt-1" /></div>;
}
function Result({ l, v, sub, color }: { l: string; v: string; sub?: string; color?: string }) {
  return <div className="rounded-xl border bg-card p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="mt-1 text-3xl font-bold">{v}</div>{sub && <div className={`mt-1 text-sm ${color ?? "text-muted-foreground"}`}>{sub}</div>}</div>;
}