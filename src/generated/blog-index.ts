// Auto-consumed static blog index. The JSON is regenerated at build time by
// scripts/build-blog-index.mjs (see the `prebuild` npm script). Editing the
// JSON directly is fine for local dev, but a fresh build will overwrite it.
import data from "./blog-posts.json";

export type StaticBlogPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const posts = ((data as { posts?: StaticBlogPost[] })?.posts ?? []) as StaticBlogPost[];

export const STATIC_BLOG_POSTS: StaticBlogPost[] = posts;

export function getStaticBlogPost(slug: string): StaticBlogPost | null {
  return posts.find((p) => p.slug === slug) ?? null;
}

export function listStaticBlogSlugs(): Array<{ slug: string; updated_at: string }> {
  return posts.map((p) => ({ slug: p.slug, updated_at: p.updated_at }));
}