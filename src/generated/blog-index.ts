// Static blog index. The companion module `blog-posts.ts` is regenerated at
// build time by scripts/build-blog-index.mjs (see the `prebuild` npm script).
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

import { STATIC_BLOG_POSTS } from "./blog-posts";
export { STATIC_BLOG_POSTS } from "./blog-posts";

export function getStaticBlogPost(slug: string): StaticBlogPost | null {
  return STATIC_BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

export function listStaticBlogSlugs(): Array<{ slug: string; updated_at: string }> {
  return STATIC_BLOG_POSTS.map((p) => ({ slug: p.slug, updated_at: p.updated_at }));
}