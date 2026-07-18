import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import type { Tool, ToolCategory } from "@/lib/tools-data";

export function ToolShell({
  tool,
  category,
  children,
}: {
  tool: Tool;
  category?: ToolCategory;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <Link to="/tools" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to tools
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-lg font-semibold text-accent-foreground">
            {tool.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
            {category && (
              <Link
                to="/categories/$slug"
                params={{ slug: category.slug }}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {category.name}
              </Link>
            )}
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">{tool.shortDescription}</p>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          {children}
        </div>
      </div>
    </SiteLayout>
  );
}