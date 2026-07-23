import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Result = "W" | "L" | "T";
type Game = { id: string; date: string; opponent: string; result: Result; scoreFor?: number; scoreAgainst?: number };
type Team = { name: string; sport: string; games: Game[] };

const STORAGE_KEY = "nexatools_sports_record_v1";
const rid = () => Math.random().toString(36).slice(2, 9);

export default function SportsRecordTracker() {
  const [team, setTeam] = useState<Team>({ name: "My Team", sport: "Basketball", games: [] });
  const [opponent, setOpponent] = useState("");
  const [result, setResult] = useState<Result>("W");
  const [sf, setSf] = useState<string>("");
  const [sa, setSa] = useState<string>("");

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setTeam(JSON.parse(raw)); } catch { /* empty */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(team)); } catch { /* empty */ }
  }, [team]);

  const stats = useMemo(() => {
    const w = team.games.filter((g) => g.result === "W").length;
    const l = team.games.filter((g) => g.result === "L").length;
    const t = team.games.filter((g) => g.result === "T").length;
    const total = team.games.length;
    const pct = total > 0 ? (w + t * 0.5) / total : 0;
    let streak = 0; let streakType: Result | null = null;
    for (let i = team.games.length - 1; i >= 0; i--) {
      const r = team.games[i].result;
      if (streakType === null) { streakType = r; streak = 1; }
      else if (r === streakType) streak++;
      else break;
    }
    return { w, l, t, total, pct, streak, streakType };
  }, [team]);

  const add = () => {
    if (!opponent.trim()) return;
    const g: Game = {
      id: rid(),
      date: new Date().toISOString().slice(0, 10),
      opponent: opponent.trim(),
      result,
      scoreFor: sf === "" ? undefined : Number(sf),
      scoreAgainst: sa === "" ? undefined : Number(sa),
    };
    setTeam((t) => ({ ...t, games: [...t.games, g] }));
    setOpponent(""); setSf(""); setSa("");
  };
  const removeGame = (id: string) => setTeam((t) => ({ ...t, games: t.games.filter((g) => g.id !== id) }));
  const reset = () => setTeam({ name: team.name, sport: team.sport, games: [] });

  const W = 640, H = 180, P = 24;
  const series = team.games.reduce<number[]>((a, g) => {
    const last = a.length ? a[a.length - 1] : 0;
    a.push(last + (g.result === "W" ? 1 : g.result === "T" ? 0.5 : 0));
    return a;
  }, []);
  const maxY = Math.max(1, series[series.length - 1] || 1);
  const path = series.length
    ? series.map((v, i) => {
        const x = P + (i / Math.max(1, series.length - 1)) * (W - P * 2);
        const y = H - P - (v / maxY) * (H - P * 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ")
    : "";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Team / player</Label><Input value={team.name} onChange={(e) => setTeam((t) => ({ ...t, name: e.target.value }))} /></div>
        <div><Label>Sport</Label><Input value={team.sport} onChange={(e) => setTeam((t) => ({ ...t, sport: e.target.value }))} /></div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Log a game</h3>
        <div className="grid gap-2 sm:grid-cols-6">
          <Input className="sm:col-span-2" placeholder="Opponent" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={result} onChange={(e) => setResult(e.target.value as Result)}>
            <option value="W">Win</option><option value="L">Loss</option><option value="T">Tie</option>
          </select>
          <Input placeholder="Pts for" type="number" value={sf} onChange={(e) => setSf(e.target.value)} />
          <Input placeholder="Pts against" type="number" value={sa} onChange={(e) => setSa(e.target.value)} />
          <Button onClick={add}>Add</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Record (W-L-T)" value={`${stats.w}-${stats.l}-${stats.t}`} accent />
        <Stat label="Win percentage" value={`${(stats.pct * 100).toFixed(1)}%`} />
        <Stat label="Games played" value={String(stats.total)} />
        <Stat label="Current streak" value={stats.streak ? `${stats.streak}${stats.streakType}` : "—"} />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Cumulative wins</h3>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <rect x={0} y={0} width={W} height={H} className="fill-secondary/30" />
          {path && <path d={path} className="stroke-primary" strokeWidth={2.5} fill="none" strokeLinecap="round" />}
          {series.length === 0 && <text x={W / 2} y={H / 2} textAnchor="middle" className="fill-muted-foreground text-xs">No games yet</text>}
        </svg>
      </div>

      {team.games.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Opponent</th><th className="px-3 py-2 text-center">Result</th><th className="px-3 py-2 text-right">Score</th><th className="px-3 py-2" /></tr>
            </thead>
            <tbody>
              {team.games.slice().reverse().map((g, i) => (
                <tr key={g.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{team.games.length - i}</td>
                  <td className="px-3 py-2">{g.date}</td>
                  <td className="px-3 py-2">{g.opponent}</td>
                  <td className="px-3 py-2 text-center"><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${g.result === "W" ? "bg-primary/20 text-primary" : g.result === "L" ? "bg-destructive/20 text-destructive" : "bg-secondary text-foreground"}`}>{g.result}</span></td>
                  <td className="px-3 py-2 text-right font-mono">{g.scoreFor !== undefined && g.scoreAgainst !== undefined ? `${g.scoreFor}–${g.scoreAgainst}` : "—"}</td>
                  <td className="px-3 py-2 text-right"><Button size="sm" variant="ghost" onClick={() => removeGame(g.id)}>×</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button variant="outline" onClick={reset}>Clear all games</Button>
      <p className="text-xs text-muted-foreground">All data saves automatically to this browser only.</p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? "bg-primary/10 border-primary/30" : "bg-background"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}