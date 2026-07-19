import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Row = { url: string; status: "pending" | "active" | "redirect" | "broken"; code?: number | string; finalUrl?: string; error?: string };

async function checkOne(url: string): Promise<Row> {
  try {
    const proxied = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxied);
    const data = await res.json();
    const code = Number(data?.status?.http_code) || 0;
    const finalUrl = data?.status?.url || url;
    if (code === 0) return { url, status: "broken", error: "No response" };
    if (code >= 400) return { url, status: "broken", code, finalUrl };
    if (finalUrl && finalUrl !== url) return { url, status: "redirect", code, finalUrl };
    return { url, status: "active", code, finalUrl };
  } catch (e: any) {
    return { url, status: "broken", error: e?.message ?? "Fetch failed" };
  }
}

export default function AffiliateLinkChecker() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const run = async () => {
    const urls = input.split(/\s+/).filter((u) => /^https?:\/\//i.test(u));
    if (urls.length === 0) { toast.error("Paste at least one http(s) URL"); return; }
    setRunning(true); setProgress(0);
    const results: Row[] = urls.map((u) => ({ url: u, status: "pending" }));
    setRows(results);
    for (let i = 0; i < urls.length; i++) {
      const r = await checkOne(urls[i]);
      results[i] = r;
      setRows([...results]);
      setProgress(Math.round(((i + 1) / urls.length) * 100));
    }
    setRunning(false);
  };

  const exportCsv = () => {
    const header = "url,status,http_code,final_url\n";
    const body = rows.map((r) => [r.url, r.status, r.code ?? "", r.finalUrl ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "link-check.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const color = (s: Row["status"]) =>
    s === "active" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    : s === "redirect" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
    : s === "broken" ? "bg-red-500/10 text-red-700 dark:text-red-400"
    : "bg-muted text-muted-foreground";

  return (
    <div className="space-y-4">
      <div>
        <Label>Paste URLs (one per line)</Label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://example.com/aff/123&#10;https://bit.ly/xyz" className="mt-1 min-h-[140px] font-mono text-xs" />
      </div>
      <div className="flex gap-2">
        <Button onClick={run} disabled={running || !input.trim()}>{running ? `Checking… ${progress}%` : "Check links"}</Button>
        {rows.length > 0 && <Button variant="outline" onClick={exportCsv}>Export CSV</Button>}
      </div>

      {running && (
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr><th className="p-2">Status</th><th className="p-2">URL</th><th className="p-2">Code</th><th className="p-2">Final</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t align-top">
                  <td className="p-2"><span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${color(r.status)}`}>{r.status}</span></td>
                  <td className="p-2 break-all font-mono text-xs">{r.url}</td>
                  <td className="p-2 font-mono text-xs">{r.code ?? "—"}</td>
                  <td className="p-2 break-all font-mono text-xs">{r.finalUrl && r.finalUrl !== r.url ? r.finalUrl : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">Uses a public CORS proxy — sites that block bots may report as broken even if they load in a browser.</p>
    </div>
  );
}