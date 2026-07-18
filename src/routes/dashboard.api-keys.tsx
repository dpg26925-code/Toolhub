import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Trash2, Copy } from "lucide-react";

export const Route = createFileRoute("/dashboard/api-keys")({
  head: () => ({ meta: [{ title: "API Keys — Nexatools" }, { name: "robots", content: "noindex" }] }),
  component: ApiKeysPage,
});

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function ApiKeysPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  const keysQ = useQuery({
    queryKey: ["api-keys", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("api_keys").select("*").eq("user_id", user!.id)
        .is("revoked_at", null).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createM = useMutation({
    mutationFn: async () => {
      const raw = "th_" + crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const key_hash = await sha256(raw);
      const key_prefix = raw.slice(0, 10);
      const { error } = await supabase.from("api_keys").insert({
        user_id: user!.id, name: name || "Untitled", key_hash, key_prefix,
      });
      if (error) throw error;
      return raw;
    },
    onSuccess: (raw) => {
      setNewKey(raw); setName("");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const revokeM = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  return (
    <DashboardShell title="API Keys">
      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle>Create new key</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="e.g. Production" value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={() => createM.mutate()} disabled={createM.isPending}>Generate</Button>
          </CardContent>
        </Card>

        {newKey && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-medium text-amber-900">Copy your key now — it won't be shown again.</p>
              <div className="flex gap-2">
                <code className="flex-1 rounded bg-white px-3 py-2 text-xs break-all">{newKey}</code>
                <Button size="sm" onClick={() => { navigator.clipboard.writeText(newKey); toast.success("Copied"); }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Your keys</CardTitle></CardHeader>
          <CardContent className="p-0">
            {keysQ.data?.length ? (
              <ul className="divide-y">
                {keysQ.data.map((k: any) => (
                  <li key={k.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <div className="font-medium">{k.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{k.key_prefix}…</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => revokeM.mutate(k.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-6 text-sm text-muted-foreground">No API keys yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Using the API</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Send requests with header <code className="bg-slate-100 px-1 rounded">Authorization: Bearer YOUR_KEY</code>.</p>
            <p>Rate limits: Free 10/min · Pro 100/min.</p>
            <p>Endpoint: <code className="bg-slate-100 px-1 rounded">POST /api/v1/tools/&#123;slug&#125;/process</code></p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}