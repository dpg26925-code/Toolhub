import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Nexatools" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

async function checkAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  return !!data;
}

function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already signed in AND admin, jump straight in.
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user && (await checkAdmin(data.user.id))) {
        router.navigate({ to: "/admin/dashboard" });
      }
    })();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr || !data.user) {
      setSubmitting(false);
      setError(authErr?.message || "Invalid credentials");
      return;
    }
    const admin = await checkAdmin(data.user.id);
    setSubmitting(false);
    if (!admin) {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      return;
    }
    router.navigate({ to: "/admin/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">Restricted access — administrators only.</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <GoogleSignInButton label="Sign in with Google" />
          <div className="relative py-3 my-2 text-center text-xs uppercase text-muted-foreground">
            <span className="relative bg-card px-2">or</span>
            <span className="absolute inset-x-0 top-1/2 -z-0 border-t border-border" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in to admin"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground hover:underline">← Back to homepage</Link>
        </p>
      </div>
    </div>
  );
}