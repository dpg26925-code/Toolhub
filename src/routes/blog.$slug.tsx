import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Link2 } from "lucide-react";
import { toast } from "sonner";

import { SITE_URL } from "@/lib/site";
import { getStaticBlogPost, type StaticBlogPost } from "@/generated/blog-index";
import { TOOLS, type Tool } from "@/lib/tools-data";
const BASE = SITE_URL;

const slugifyHeading = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function extractToc(markdown: string) {
  const items: { level: 2 | 3; text: string; id: string }[] = [];
  const used = new Map<string, number>();
  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;
    const level = (m[1].length === 2 ? 2 : 3) as 2 | 3;
    const text = m[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim();
    let id = slugifyHeading(text) || `section-${items.length + 1}`;
    const n = used.get(id) ?? 0;
    if (n > 0) id = `${id}-${n}`;
    used.set(id, n + 1);
    items.push({ level, text, id });
  }
  return items;
}

function markdownToHtml(markdown: string) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const inline = (value: string) =>
    escapeHtml(value)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let list: string[] = [];
  const used = new Map<string, number>();
  const headingId = (text: string) => {
    let id = slugifyHeading(text) || `section-${used.size + 1}`;
    const n = used.get(id) ?? 0;
    if (n > 0) id = `${id}-${n}`;
    used.set(id, n + 1);
    return id;
  };

  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      const t = trimmed.slice(4);
      html.push(`<h3 id="${headingId(t)}">${inline(t)}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      flushList();
      const t = trimmed.slice(3);
      html.push(`<h2 id="${headingId(t)}">${inline(t)}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      flushList();
      const t = trimmed.slice(2);
      html.push(`<h2 id="${headingId(t)}">${inline(t)}</h2>`);
    } else if (/^-\s+/.test(trimmed)) {
      list.push(trimmed.replace(/^-\s+/, ""));
    } else if (/^\d+\.\s+/.test(trimmed)) {
      list.push(trimmed.replace(/^\d+\.\s+/, ""));
    } else {
      flushList();
      html.push(`<p>${inline(trimmed)}</p>`);
    }
  }
  flushList();
  return html.join("\n");
}

function truncate(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

function findRelatedTools(text: string, max = 4): Tool[] {
  const hay = text.toLowerCase();
  const scored = TOOLS.map((t) => {
    const name = t.name.toLowerCase();
    const slug = t.slug.toLowerCase().replace(/-/g, " ");
    let score = 0;
    if (hay.includes(name)) score += 3;
    if (hay.includes(slug)) score += 2;
    for (const word of name.split(/\s+/)) {
      if (word.length > 4 && hay.includes(word)) score += 1;
    }
    return { t, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.t);
  return scored;
}

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getStaticBlogPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Article temporarily unavailable</h1>
        <p className="mt-2 text-muted-foreground">{error?.message || "Please try again shortly."}</p>
        <Button asChild className="mt-6"><Link to="/blog">Back to blog</Link></Button>
      </div>
    </SiteLayout>
  ),
  head: ({ params, loaderData }) => {
    const post = loaderData as StaticBlogPost | undefined;
    const url = `${BASE}/blog/${params.slug}`;
    const title = post?.meta_title || post?.title || "Blog — Nexatools";
    const rawDesc = post?.meta_description || post?.excerpt || (post?.content ? truncate(post.content) : "");
    const description = rawDesc && rawDesc.length >= 50 ? rawDesc : (rawDesc ? `${rawDesc} — read the full article on the Nexatools blog.` : "Read the latest guides, tutorials, and product updates from the Nexatools team.");
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:card", content: post?.cover_image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    if (post?.cover_image) {
      meta.push({ property: "og:image", content: post.cover_image });
      meta.push({ name: "twitter:image", content: post.cover_image });
    }
    const scripts = post
      ? [{
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description,
            image: post.cover_image ? [post.cover_image] : undefined,
            datePublished: post.published_at ?? post.created_at,
            dateModified: post.updated_at,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: { "@type": "Organization", name: "Nexatools" },
            publisher: { "@type": "Organization", name: "Nexatools", url: BASE },
          }),
        }, {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          }),
        }]
      : undefined;
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      ...(scripts ? { scripts } : {}),
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <p className="mt-2 text-muted-foreground">This article doesn't exist or hasn't been published.</p>
        <Button asChild className="mt-6"><Link to="/blog">Back to blog</Link></Button>
      </div>
    </SiteLayout>
  ),
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();
  const html = markdownToHtml(post.content ?? "");
  const toc = extractToc(post.content ?? "");
  const url = `${BASE}/blog/${post.slug}`;
  const related = findRelatedTools(`${post.title}\n${post.content ?? ""}`);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link to="/blog" className="hover:text-primary">← Blog</Link>
        </nav>
        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="mb-6 w-full rounded-xl border object-cover" />
        )}
        <h1 className="text-4xl font-extrabold tracking-tight">{post.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : new Date(post.created_at).toLocaleDateString()}</span>
          <span>·</span>
          <span>{Math.max(1, Math.round((post.content?.length ?? 0) / 1000))} min read</span>
        </div>

        {toc.length >= 3 && (
          <nav aria-label="Table of contents" className="mt-8 rounded-xl border bg-muted/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Table of contents</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {toc.map((it, i) => (
                <li key={it.id} className={it.level === 3 ? "ml-5" : ""}>
                  <a href={`#${it.id}`} className="text-foreground/80 hover:text-primary hover:underline">
                    {it.level === 2 ? `${i + 1}. ` : ""}{it.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div
          className="mt-8 max-w-none text-base leading-7 text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mb-2 [&_p]:mb-5 [&_strong]:font-semibold [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {related.length > 0 && (
          <section aria-labelledby="related-tools" className="mt-12 rounded-2xl border bg-muted/20 p-6">
            <h2 id="related-tools" className="text-xl font-bold tracking-tight">Related tools</h2>
            <p className="mt-1 text-sm text-muted-foreground">Try these tools mentioned in this article.</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((t) => (
                <li key={t.slug}>
                  <Link
                    to="/tools/$slug"
                    params={{ slug: t.slug }}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/40"
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span>
                      <span className="block font-medium text-foreground">{t.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">{t.shortDescription}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 flex items-center gap-2 border-t pt-6">
          <span className="text-sm text-muted-foreground mr-2">Share:</span>
          <Button size="sm" variant="outline" asChild>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer">
              <Twitter className="h-4 w-4 mr-1" /> Twitter
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">
              <Linkedin className="h-4 w-4 mr-1" /> LinkedIn
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied"); }}>
            <Link2 className="h-4 w-4 mr-1" /> Copy
          </Button>
        </div>
      </article>
    </SiteLayout>
  );
}