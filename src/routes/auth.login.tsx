import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth-layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Nexatools" },
      { name: "description", content: "Sign in to your Nexatools account to access tools, credits, and API keys." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/" });
  }

  async function handleMagicLink() {
    setError(null);
    if (!email) {
      setError("Enter your email to receive a magic link.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMagicSent(true);
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to Nexatools."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/auth/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {magicSent ? (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
          Check your inbox — we sent a sign-in link to <strong>{email}</strong>.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            required
          />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            required
          />
          <div className="flex items-center justify-end">
            <Link to="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          <div className="relative py-2 text-center text-xs uppercase text-muted-foreground">
            <span className="relative bg-background px-2">or</span>
            <span className="absolute inset-x-0 top-1/2 -z-0 border-t border-border" />
          </div>
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-60"
          >
            Email me a magic link
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}