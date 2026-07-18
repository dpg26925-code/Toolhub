# ToolHub AI — Phased V1 Plan

Stack adjustments from the spec (required by this environment):
- **TanStack Start** (not Next.js) with file-based routing under `src/routes/`.
- **Lovable Cloud** (Supabase under the hood) for DB, auth, storage, server functions. No LemonSqueezy in V1 (payments skipped per your answer).
- **Stripe** available later if/when you want to add subscriptions.
- Blog stored in Postgres (not MDX files) so admins can edit from the dashboard.
- Heavy Python worker (Modal/Railway) is out-of-scope for V1 — tools will be either client-side or run inside TanStack server functions.

---

## Phase 1 — Design system + public shell
- Indigo/violet design tokens in `src/styles.css` (primary `#6366f1`, slate neutrals, `#f8fafc` bg, radius 12–16, subtle shadows, hover lift utility, fade-in animation).
- Load Inter via `<link>` in `__root.tsx` head; set real title/description/OG metadata ("ToolHub AI — The Ultimate AI-Powered Online Tool Platform").
- Public layout: top nav (logo, Tools, Pricing, Blog, About, Sign in / Sign up), footer.
- Pages: `/` (hero + featured tools + categories + stats + CTA), `/tools` (search + category filter grid), `/categories/$slug`, `/pricing`, `/about`, `/faq`, `/terms`, `/privacy`.
- Categories/tools rendered from seed data (Phase 2 wires them to DB).
- `sitemap.xml` + `robots.txt`.

## Phase 2 — Cloud + schema + auth
- Enable Lovable Cloud.
- Migration creates all tables from the spec: `profiles`, `categories`, `tools`, `tool_translations`, `usage_logs`, `api_keys`, `credit_transactions`, `subscriptions`, `blog_posts`, `favorite_tools`. Plus `app_role` enum + `user_roles` table + `has_role()` security-definer function (roles live in a separate table, not on `profiles`).
- RLS on every table, with `GRANT`s per public-schema rules.
- Trigger `handle_new_user` auto-creates a `profiles` row on signup (10 free credits, plan='free').
- Seed 4 categories (PDF, Image, AI, Developer) and the 8 client-side tools.
- Auth pages: `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/callback`. Email/password + magic link. No Google in V1.
- Root `onAuthStateChange` subscriber wired per Supabase integration rules; sign-in affordance in nav reflects session.
- `_authenticated/` layout gate (managed by integration).

## Phase 3 — ToolShell + 8 client-side tools
- Reusable `<ToolShell>` component (idle / processing / success / error / guest-locked states, three-column layout, credit counter, favorite/report/API-endpoint chips).
- Guest quota via localStorage: 3 free runs then sign-up wall.
- Implement the 8 client-side tools listed (JSON Formatter, Base64, URL Encoder, JWT Decoder, Regex Tester, Password Generator, Hash Generator, Color Converter). Each is a route `/tools/$slug` that reads the tool row from DB and mounts the matching handler component.
- `usage_logs` inserted on each successful run (via server fn for signed-in users; skipped for guests).
- Favorite toggle wired to `favorite_tools`.

## Phase 4 — User dashboard
- `/dashboard` (credit balance, recently used, favorites, quick actions).
- `/dashboard/history` (paginated `usage_logs`, filters).
- `/dashboard/favorites`.
- `/dashboard/api-keys` (create/copy-once/revoke; server fn hashes key, stores prefix).
- `/dashboard/settings` (name, email, password change).
- `/dashboard/subscription` shows "Free plan — upgrades coming soon" placeholder (payments deferred).

## Phase 5 — Admin
- Admin gate via `has_role(uid, 'admin')` in a nested `_authenticated/_admin` layout.
- `/admin` overview stats.
- `/admin/tools` CRUD (name, slug, category, description, icon, thumbnail, credit cost, client_side toggle, JSON-schema editor for `input_schema`, publish/feature toggles).
- `/admin/categories` CRUD.
- `/admin/users` (search, filter by plan, grant credits via `credit_transactions`, change plan/role).
- `/admin/blog` CRUD with publish toggle.
- `/admin/analytics` (tool usage trends, user growth).
- `/admin/logs`, `/admin/settings`, and placeholder pages for Ads/Affiliates.

## Phase 6 — Blog
- `/blog` listing (published only), `/blog/$slug` post view (Markdown rendered).
- SEO metadata per post via route `head()` from loader data (title, description, og:image = cover).

---

## Technical notes
- All Supabase writes/reads that need auth go through `createServerFn` with `requireSupabaseAuth`; public reads (tools list, blog) use a server publishable client with narrow `TO anon` SELECT policies so SSR works.
- Never store service-role keys or import `client.server` from route/component code.
- `credit_transactions` is append-only and is the source of truth; `profiles.credits` is denormalized and updated by a trigger on transaction insert.
- API keys stored as SHA-256 hash + first-8-char prefix; raw key shown once on creation.
- Payments (Stripe) and heavy AI tools (OpenAI/Gemini + Python worker) are explicitly out of V1 — schema fields exist so we can plug them in later without migrations.

## Out of scope for V1 (per your answers)
- Payments / subscriptions billing flow (Stripe integration).
- i18n runtime (`tool_translations` table exists; UI is English-only).
- Heavy server-side tools requiring a Python worker.
- Google OAuth.

Ready to start Phase 1 on approval.
