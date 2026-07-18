import { Link, useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/tools", label: "Tools" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-soft">
            ▲
          </span>
          <span>ToolHub<span className="text-primary"> AI</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-secondary" />
          ) : user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/auth/signup"
                className="inline-flex items-center rounded-md bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}