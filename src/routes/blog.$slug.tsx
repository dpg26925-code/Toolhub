import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { marked } from "marked";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Link2 } from "lucide-react";
import { toast } from "sonner";

import { SITE_URL } from "@/lib/site";
const BASE = SITE_URL;

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Blog — Nexatools` },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${BASE}/blog/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/blog/${params.slug}` }],
  }),
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const q = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (q.isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </SiteLayout>
    );
  }

  if (!q.data) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p className="mt-2 text-muted-foreground">This article doesn't exist or hasn't been published.</p>
          <Button asChild className="mt-6"><Link to="/blog">Back to blog</Link></Button>
        </div>
      </SiteLayout>
    );
  }

  const post = q.data;
  const html = marked.parse(post.content ?? "", { async: false }) as string;
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
          className="prose prose-slate max-w-none mt-8 prose-headings:font-bold prose-a:text-primary"
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