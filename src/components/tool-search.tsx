import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { TOOLS } from "@/lib/tools-data";

type Props = {
  className?: string;
  placeholder?: string;
};

export function ToolSearch({ className = "", placeholder = "Search tools…" }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.categorySlug.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      const target = results[active];
      if (target) {
        e.preventDefault();
        setOpen(false);
        setQuery("");
        navigate({ to: "/tools/$slug", params: { slug: target.slug } });
      } else if (query.trim()) {
        e.preventDefault();
        setOpen(false);
        navigate({ to: "/tools" });
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label="Search tools"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
      />
      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-auto rounded-md border border-border bg-popover shadow-lg">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">No tools match “{query}”.</div>
          ) : (
            <ul className="py-1">
              {results.map((t, i) => (
                <li key={t.slug}>
                  <Link
                    to="/tools/$slug"
                    params={{ slug: t.slug }}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex items-start gap-3 px-3 py-2 text-sm transition ${
                      i === active ? "bg-secondary" : "hover:bg-secondary/60"
                    }`}
                  >
                    <span className="mt-0.5 text-base">{t.icon}</span>
                    <span className="flex-1">
                      <span className="block font-medium text-foreground">{t.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {t.shortDescription}
                      </span>
                    </span>
                    <span className="mt-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t.categorySlug}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}