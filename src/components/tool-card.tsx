import { Link } from "@tanstack/react-router";
import type { Tool } from "@/lib/tools-data";
import { CATEGORIES } from "@/lib/tools-data";
import { CategoryIcon, CategoryBadge } from "@/components/category-icon";

export function ToolCard({ tool }: { tool: Tool }) {
  const category = CATEGORIES.find((c) => c.slug === tool.categorySlug);
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <CategoryIcon slug={tool.categorySlug} size={40} />
        {category && <CategoryBadge slug={category.slug} label={category.name} />}
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">
        {tool.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {tool.shortDescription}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{tool.creditCost === 0 ? "Free" : `${tool.creditCost} credit${tool.creditCost > 1 ? "s" : ""}`}</span>
        <span className="font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
          Open →
        </span>
      </div>
    </Link>
  );
}