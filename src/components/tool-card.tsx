import { Link } from "@tanstack/react-router";
import type { Tool } from "@/lib/tools-data";
import { CATEGORIES } from "@/lib/tools-data";

export function ToolCard({ tool }: { tool: Tool }) {
  const category = CATEGORIES.find((c) => c.slug === tool.categorySlug);
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className="hover-lift group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-lg font-semibold text-accent-foreground">
          {tool.icon}
        </div>
        {tool.isFree && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
            Free
          </span>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground group-hover:text-primary">
        {tool.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tool.shortDescription}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{category?.name}</span>
        <span>{tool.creditCost === 0 ? "Free" : `${tool.creditCost} credit${tool.creditCost > 1 ? "s" : ""}`}</span>
      </div>
    </Link>
  );
}