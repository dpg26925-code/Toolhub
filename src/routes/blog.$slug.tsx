import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Link2 } from "lucide-react";
import { toast } from "sonner";

import { SITE_URL } from "@/lib/site";
import { getPublishedBlogPost, type PublicBlogPost } from "@/lib/blog.functions";
const BASE = SITE_URL;

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
      html.push(`<h3>${inline(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      flushList();
      html.push(`<h2>${inline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      flushList();
      html.push(`<h2>${inline(trimmed.slice(2))}</h2>`);
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

const postQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const row = await getPublishedBlogPost({ data: { slug } });
      if (!row) throw notFound();
      return row as PublicBlogPost;
    },
  });

function truncate(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(postQueryOptions(params.slug)),
  head: ({ params, loaderData }) => {
    const post = loaderData as PublicBlogPost | undefined;
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
        }]
      : undefined;
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      ...(scripts ? { scripts } : {}),
    };
  },
  errorComponent: BlogPostError,
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
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQueryOptions(slug));
  const html = markdownToHtml(post.content ?? "");
  const url = `${BASE}/blog/${post.slug}`;

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

        <div
          className="mt-8 max-w-none text-base leading-7 text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mb-2 [&_p]:mb-5 [&_strong]:font-semibold [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: html }}
        />

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

function BlogPostError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Article temporarily unavailable</h1>
        <p className="mt-2 text-muted-foreground">We couldn't load this article right now.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </Button>
          <Button asChild variant="outline"><Link to="/blog">Back to blog</Link></Button>
        </div>
      </div>
    </SiteLayout>
  );
}