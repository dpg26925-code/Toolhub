import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyReferralStats } from "@/lib/referrals.functions";

export const Route = createFileRoute("/dashboard/referrals")({
  head: () => ({
    meta: [
      { title: "Referrals — Nexatools" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReferralsPage,
});

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function ReferralsPage() {
  const fetchStats = useServerFn(getMyReferralStats);
  const q = useQuery({
    queryKey: ["referral-stats"],
    queryFn: () => fetchStats(),
  });
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://nexatools.cloud";
  const code = q.data?.referralCode ?? "";
  const link = code ? `${origin}/?ref=${code}` : "";

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <DashboardShell title="Referrals">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your referral link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share this link. When someone signs up and upgrades to Pro, you earn{" "}
              <strong>30% commission</strong> on their first payment.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="flex-1 min-w-[260px] rounded-md border bg-muted px-3 py-2 text-sm">
                {link || "Loading…"}
              </code>
              <Button onClick={copy} disabled={!link} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <Button
                  onClick={() => (navigator as Navigator).share?.({ url: link, title: "Nexatools" })}
                  disabled={!link}
                  variant="outline"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
            {code && (
              <p className="text-xs text-muted-foreground">
                Your code: <span className="font-mono font-semibold">{code}</span>
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Referred" value={String(q.data?.totalReferred ?? 0)} />
          <Stat label="Converted" value={String(q.data?.totalConverted ?? 0)} />
          <Stat label="Pending payout" value={money(q.data?.pendingCents ?? 0, q.data?.currency)} />
          <Stat label="Paid out" value={money(q.data?.paidCents ?? 0, q.data?.currency)} />
        </div>

        <Card>
          <CardHeader><CardTitle>Referrals</CardTitle></CardHeader>
          <CardContent>
            {q.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !q.data?.referrals.length ? (
              <p className="text-sm text-muted-foreground">No referrals yet. Share your link to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2">User</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Commission</th>
                      <th className="py-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.data.referrals.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="py-2">{r.referred_email || r.referred_user_id.slice(0, 8)}</td>
                        <td className="py-2"><Badge variant={r.status === "paid" ? "default" : r.status === "converted" ? "secondary" : "outline"}>{r.status}</Badge></td>
                        <td className="py-2">{money(r.commission_cents, r.currency)}</td>
                        <td className="py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payouts</CardTitle></CardHeader>
          <CardContent>
            {!q.data?.payouts.length ? (
              <p className="text-sm text-muted-foreground">No payouts yet. Payouts are processed monthly once your pending balance reaches $50.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {q.data.payouts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between border-b py-2">
                    <span>{new Date(p.created_at).toLocaleDateString()} · {p.method ?? "manual"}</span>
                    <span className="font-medium">{money(p.amount_cents, p.currency)} <Badge variant="outline">{p.status}</Badge></span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><p className="text-2xl font-bold">{value}</p></CardContent>
    </Card>
  );
}