// Build-time fetch of published blog posts.
// Writes src/generated/blog-posts.json so the runtime (Cloudflare Workers)
// never has to hit Supabase for blog reads.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/generated/blog-posts.json");

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function writeOut(posts) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), posts }, null, 2));
  console.log(`[build-blog] wrote ${posts.length} posts -> ${OUT}`);
}

if (!url || !key) {
  console.warn("[build-blog] Supabase env vars missing — writing empty index");
  writeOut([]);
  process.exit(0);
}

const select =
  "slug,title,excerpt,content,cover_image,meta_title,meta_description,published_at,created_at,updated_at";
const endpoint =
  `${url}/rest/v1/blog_posts?select=${encodeURIComponent(select)}` +
  `&published=eq.true&order=published_at.desc.nullslast`;

try {
  const res = await fetch(endpoint, {
    headers: { apikey: key, Accept: "application/json" },
  });
  if (!res.ok) {
    console.warn(`[build-blog] Supabase ${res.status} — writing empty index`);
    writeOut([]);
    process.exit(0);
  }
  const posts = await res.json();
  writeOut(Array.isArray(posts) ? posts : []);
} catch (err) {
  console.warn("[build-blog] fetch failed — writing empty index:", err?.message || err);
  writeOut([]);
}
