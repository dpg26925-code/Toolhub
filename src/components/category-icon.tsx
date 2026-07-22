import {
  FileText,
  Image as ImageIcon,
  Film,
  Youtube,
  Link2,
  Music2,
  Repeat,
  Sparkles,
  Code2,
  CandlestickChart,
  Calculator,
  HeartPulse,
  GraduationCap,
  Home,
  Scale,
  Ruler,
  Dices,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

type CategoryMeta = { Icon: LucideIcon; color: string };

const META: Record<string, CategoryMeta> = {
  pdf: { Icon: FileText, color: "#ff6b6b" },
  image: { Icon: ImageIcon, color: "#4ecdc4" },
  video: { Icon: Film, color: "#45b7d1" },
  youtube: { Icon: Youtube, color: "#ff0000" },
  affiliate: { Icon: Link2, color: "#96ceb4" },
  tiktok: { Icon: Music2, color: "#111111" },
  converter: { Icon: Repeat, color: "#feca57" },
  ai: { Icon: Sparkles, color: "#a55eea" },
  developer: { Icon: Code2, color: "#3742fa" },
  trader: { Icon: CandlestickChart, color: "#26de81" },
  accounting: { Icon: Calculator, color: "#fd9644" },
  health: { Icon: HeartPulse, color: "#fc5c65" },
  education: { Icon: GraduationCap, color: "#45aaf2" },
  "real-estate": { Icon: Home, color: "#2bcbba" },
  legal: { Icon: Scale, color: "#778ca3" },
  units: { Icon: Ruler, color: "#4b7bec" },
  fun: { Icon: Dices, color: "#a55eea" },
};

const FALLBACK: CategoryMeta = { Icon: LayoutGrid, color: "#64748b" };

export function categoryColor(slug: string): string {
  return (META[slug] ?? FALLBACK).color;
}

type IconProps = {
  slug: string;
  size?: number;
  className?: string;
};

/** Colored square badge (rounded) with a white line-icon. Use in tool cards / hero grids. */
export function CategoryIcon({ slug, size = 40, className = "" }: IconProps) {
  const { Icon, color } = META[slug] ?? FALLBACK;
  const iconSize = Math.round(size * 0.55);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-xl ${className}`}
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <Icon size={iconSize} strokeWidth={2} color="#ffffff" />
    </span>
  );
}

/** Small circular icon — for inline usage in pills and sidebar rows. */
export function CategoryDot({ slug, size = 20, className = "" }: IconProps) {
  const { Icon, color } = META[slug] ?? FALLBACK;
  const iconSize = Math.round(size * 0.6);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <Icon size={iconSize} strokeWidth={2.25} color="#ffffff" />
    </span>
  );
}

/** Pill: colored dot + label on a soft tinted background. Category tag on cards / lists. */
export function CategoryBadge({
  slug,
  label,
  className = "",
}: {
  slug: string;
  label: string;
  className?: string;
}) {
  const { Icon, color } = META[slug] ?? FALLBACK;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${className}`}
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
        color,
      }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {label}
    </span>
  );
}