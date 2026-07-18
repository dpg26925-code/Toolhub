import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in…" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const hash = window.location.hash;
      if (hash.includes("type=recovery")) {
        navigate({ to: "/reset-password" });
        return;
      }
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      navigate({ to: data.session ? "/" : "/auth/login" });
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-lg font-semibold text-foreground">We couldn't finish signing you in</h1>
            <p className="mt-2 text-sm text-destructive">{error}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Signing you in…</p>
        )}
      </div>
    </div>
  );
}