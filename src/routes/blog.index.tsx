import { createFileRoute, Link } from "@tanstack/react-router";
import { abs } from "@/lib/site";
import { SiteLayout } from "@/components/site-layout";
import { STATIC_BLOG_POSTS } from "@/generated/blog-index";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Product Updates, Tips & Tutorials | Nexatools" },
      { name: "description", content: "Product updates, tips and tutorials from the Nexatools team." },
      { property: "og:title", content: "Blog — Product Updates, Tips & Tutorials | Nexatools" },
      { property: "og:description", content: "Product updates, tips and tutorials." },
      { property: "og:url", content: abs("/blog") },
    ],
    links: [{ rel: "canonical", href: abs("/blog") }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = STATIC_BLOG_POSTS;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">The Nexatools blog</h1>
          <p className="mt-2 text-muted-foreground">Tutorials, product updates, and tips for creators & developers.</p>
        </header>

        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="hover-lift group flex flex-col rounded-2xl border bg-card overflow-hidden"
              >
                {p.cover_image ? (
                  <img src={p.cover_image} alt={p.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-gradient-to-br from-indigo-500 to-violet-600" />
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="font-semibold text-lg group-hover:text-primary">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(p.published_at ?? p.created_at).toLocaleDateString()}</span>
                    <span>{Math.max(1, Math.round((p.content?.length ?? 0) / 1000))} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No posts yet. Check back soon.</p>
        )}
      </div>
    </SiteLayout>
  );
}