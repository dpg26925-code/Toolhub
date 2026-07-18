import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth-layout";
import { supabase } from "@/integrations/supabase/client";
import { GoogleSignInButton } from "@/components/google-signin-button";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create an account — Nexatools" },
      { name: "description", content: "Sign up for a free Nexatools account and get 10 credits to start using every tool." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/" });
    } else {
      setConfirmSent(true);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get 10 free credits when you sign up."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {confirmSent ? (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
          Almost there — check <strong>{email}</strong> for a confirmation link.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name" type="text" autoComplete="name" value={fullName} onChange={setFullName} />
          <Field label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} required />
          <Field
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            required
          />
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95 disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
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