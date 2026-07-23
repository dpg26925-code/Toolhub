import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function parse(input: string) {
  const s = input.trim();
  if (!s) return null;
  // Channel ID
  let m = s.match(/channel\/(UC[\w-]{20,})/); if (m) return { channelId: m[1], handle: null, custom: null, videoId: null };
  // Handle
  m = s.match(/@([\w.\-]+)/); if (m) return { channelId: null, handle: `@${m[1]}`, custom: null, videoId: null };
  // Custom URL /c/ or /user/
  m = s.match(/(?:\/c\/|\/user\/)([\w.\-]+)/); if (m) return { channelId: null, handle: null, custom: m[1], videoId: null };
  // Video URL
  m = s.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/); if (m) return { channelId: null, handle: null, custom: null, videoId: m[1] };
  if (/^UC[\w-]{20,}$/.test(s)) return { channelId: s, handle: null, custom: null, videoId: null };
  if (/^[\w-]{11}$/.test(s)) return { channelId: null, handle: null, custom: null, videoId: s };
  return null;
}

export default function YoutubeChannelIdFinderTool() {
  const [input, setInput] = useState("https://www.youtube.com/@MrBeast");
  const parsed = useMemo(() => parse(input), [input]);

  const rows: { label: string; value: string | null; link?: string }[] = parsed ? [
    { label: "Channel ID", value: parsed.channelId, link: parsed.channelId ? `https://www.youtube.com/channel/${parsed.channelId}` : undefined },
    { label: "Handle", value: parsed.handle, link: parsed.handle ? `https://www.youtube.com/${parsed.handle}` : undefined },
    { label: "Custom URL", value: parsed.custom, link: parsed.custom ? `https://www.youtube.com/c/${parsed.custom}` : undefined },
    { label: "Video ID", value: parsed.videoId, link: parsed.videoId ? `https://youtu.be/${parsed.videoId}` : undefined },
  ] : [];

  return (
    <div className="space-y-4">
      <div>
        <Label>Channel URL, @handle, or video URL</Label>
        <Input className="mt-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://youtube.com/@handle" />
      </div>
      {!parsed && input && <p className="text-sm text-destructive">Could not parse a channel or video reference from that input.</p>}
      {parsed && (
        <div className="rounded-md border divide-y">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 px-4 py-3">
              <div className="w-32 text-sm font-medium text-muted-foreground">{r.label}</div>
              <div className="flex-1 font-mono text-sm break-all">
                {r.value ? (r.link ? <a className="text-primary hover:underline" href={r.link} target="_blank" rel="noreferrer">{r.value}</a> : r.value) : <span className="text-muted-foreground">—</span>}
              </div>
              {r.value && <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(r.value!); toast.success("Copied"); }}>Copy</Button>}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Note: resolving a @handle to a full <code>UC...</code> Channel ID requires the YouTube Data API. This tool parses whichever identifiers are already present in the URL you provide.</p>
    </div>
  );
}