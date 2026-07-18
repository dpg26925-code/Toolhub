import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function toLocalDatetime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function TimestampConverterTool() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [ts, setTs] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [dt, setDt] = useState<string>(toLocalDatetime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const parsedTs = (() => {
    const n = Number(ts);
    if (!Number.isFinite(n) || ts.trim() === "") return null;
    const ms = n >= 1e12 ? n : n * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  })();

  const parsedDt = (() => {
    const d = new Date(dt);
    return isNaN(d.getTime()) ? null : d;
  })();

  const copy = async (s: string) => { await navigator.clipboard.writeText(s); toast.success("Copied"); };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-background p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Current Unix timestamp</div>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <div className="text-3xl font-semibold font-mono">{now}</div>
          <Button size="sm" variant="outline" onClick={() => copy(String(now))}>Copy seconds</Button>
          <Button size="sm" variant="outline" onClick={() => copy(String(now * 1000))}>Copy ms</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border bg-background p-5">
          <Label>Timestamp → Date</Label>
          <Input value={ts} onChange={(e) => setTs(e.target.value)} className="font-mono" placeholder="1700000000 or 1700000000000" />
          {parsedTs ? (
            <div className="space-y-1 text-sm">
              <div><span className="text-muted-foreground">Local:</span> {parsedTs.toString()}</div>
              <div><span className="text-muted-foreground">UTC:</span> {parsedTs.toUTCString()}</div>
              <div><span className="text-muted-foreground">ISO:</span> {parsedTs.toISOString()}</div>
            </div>
          ) : (
            <div className="text-sm text-destructive">Invalid timestamp</div>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-background p-5">
          <Label>Date → Timestamp</Label>
          <Input type="datetime-local" step="1" value={dt} onChange={(e) => setDt(e.target.value)} className="font-mono" />
          {parsedDt ? (
            <div className="space-y-1 text-sm">
              <div><span className="text-muted-foreground">Seconds:</span> <span className="font-mono">{Math.floor(parsedDt.getTime() / 1000)}</span></div>
              <div><span className="text-muted-foreground">Milliseconds:</span> <span className="font-mono">{parsedDt.getTime()}</span></div>
              <div><span className="text-muted-foreground">ISO:</span> {parsedDt.toISOString()}</div>
            </div>
          ) : (
            <div className="text-sm text-destructive">Invalid date</div>
          )}
        </div>
      </div>
    </div>
  );
}