import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-secondary/40">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <Link to="/" className="mb-8 flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-soft">
            ▲
          </span>
          <span>
            ToolHub<span className="text-primary"> AI</span>
          </span>
        </Link>
        <div className="rounded-2xl border border-border/60 bg-background p-8 shadow-soft">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}