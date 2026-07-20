## Admin Panel Build Plan for Nexatools

Build a complete `/admin/*` panel reusing existing Supabase auth + `user_roles` table (role = 'admin'). Keep public pages untouched.

### Auth model
- Reuse Supabase Auth. Admin check = row in `public.user_roles` with `role='admin'` (already exists — do NOT add `profiles.role`, project already uses proper `user_roles` pattern per security guidance).
- Optional email allowlist (`@nexatools.cloud`) enforced via a new trigger `grant_admin_for_verified_domain` on `auth.users` insert/verify (only for confirmed emails).
- `/admin/login` = dedicated page. On success, verify user has admin role via `has_role` RPC; if not, sign out + error.
- Existing `AdminShell` already gates via `useRoles()`. Extend to redirect to `/admin/login` (not `/`) when unauthenticated/non-admin.

### Routes to build/update
1. **`/admin/login`** (new, public) — email/password + Google, verifies admin role post-login, redirect `/admin/dashboard`.
2. **`/admin/dashboard`** (rename of existing `/admin`) — stats cards (users, tools, blog posts, MTD revenue from `subscriptions`), recent subscriptions table, recent signups, quick links.
3. **`/admin/blog`** (rewrite existing) — list table with Edit/Delete/Toggle publish actions.
4. **`/admin/blog/new`** + **`/admin/blog/$id/edit`** — dedicated create/edit forms (split out from current inline editor). Keep existing AI Blog Writer panel on new.
5. **`/admin/tools`** (extend existing) — add create/edit form + delete + toggle featured; page `/admin/tools/new` and `/admin/tools/$id/edit`.
6. **`/admin/users`** (extend) — search, view detail drawer, add/subtract credits, change role (grant/revoke admin via `user_roles`), delete user (admin RPC).
7. **`/admin/payments`** (new) — read from `subscriptions` table, filter by status, expandable row for raw JSON.
8. **`/admin/settings`** (rewrite) — form persisted in new `site_settings` table (single-row key/value JSON).

### Backend changes (single migration)
- Create `site_settings` table (id=1 singleton, `data jsonb`, RLS: admins read/write via `has_role`).
- Add SECURITY DEFINER RPCs (all check `has_role(auth.uid(),'admin')`):
  - `admin_adjust_credits(_user_id, _delta)`
  - `admin_set_role(_user_id, _role, _grant boolean)`
  - `admin_delete_user(_user_id)` — deletes from `auth.users` cascade.
- Trigger `grant_admin_for_verified_domain` on `@nexatools.cloud` verified emails (per email-domain-role-assignment guidance).
- GRANTs on new table + RPCs.

### UI/Layout
- Keep existing `AdminShell` (already has sidebar with correct nav items). Add: dashboard renamed, Payments item, top-bar search + theme toggle + admin email + notification bell (static), breadcrumbs component.
- Mobile hamburger already handled by `SidebarProvider` + `SidebarTrigger`.
- All shadcn components, existing design tokens — no color/font changes.

### Files
- New: `src/routes/admin.login.tsx`, `src/routes/admin.dashboard.tsx`, `src/routes/admin.blog.new.tsx`, `src/routes/admin.blog.$id.edit.tsx`, `src/routes/admin.tools.new.tsx`, `src/routes/admin.tools.$id.edit.tsx`, `src/routes/admin.payments.tsx`, `src/components/admin-topbar.tsx`, `src/components/admin-breadcrumb.tsx`.
- Update: `src/components/admin-shell.tsx` (redirect target, top bar, Payments nav, dashboard link), `src/routes/admin.index.tsx` (redirect to `/admin/dashboard`), `src/routes/admin.blog.tsx` (list-only), `src/routes/admin.tools.tsx` (add actions), `src/routes/admin.users.tsx` (search + actions), `src/routes/admin.settings.tsx` (real form).
- Migration: `site_settings` + admin RPCs + domain trigger.

### Not changed
Homepage, `/tools`, `/pricing`, `/blog`, `/faq`, `/auth/*`, `/dashboard/*`. No color/typography changes.

### Order
1. Migration (RPCs + `site_settings` + domain trigger).
2. `/admin/login` + updated `AdminShell` redirect + `/admin/index` → dashboard redirect.
3. `/admin/dashboard`.
4. Blog list + new + edit.
5. Tools list + new + edit.
6. Users + actions.
7. Payments.
8. Settings.
