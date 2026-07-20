## Affiliate Program (Referral) — Plan

Goal: mỗi user có 1 mã referral. Ai đăng ký qua link đó và mua Pro → user gốc được cộng hoa hồng. Admin duyệt payout.

### 1) Database (migration)

- `profiles`:
  - `referral_code text unique` — tự sinh khi tạo profile (trigger `handle_new_user`).
  - `referred_by uuid null references profiles(id)` — set khi signup có `?ref=`.
- `referrals` (một dòng / referred user):
  - `referrer_id`, `referred_user_id unique`, `status` (`pending` | `converted` | `paid` | `void`),
  - `commission_cents int default 0`, `subscription_id`, `converted_at`, `paid_at`.
- `referral_payouts`:
  - `referrer_id`, `amount_cents`, `method` (paypal/bank/other), `payout_reference`, `status` (`pending`/`paid`), `notes`, `paid_at`.
- RLS:
  - Referrer đọc `referrals` của mình + payouts của mình.
  - Admin đọc/ghi tất cả (`has_role(auth.uid(),'admin')`).
  - Ghi từ webhook dùng `service_role` (bypass RLS).
- Trigger cập nhật `handle_new_user`: sinh `referral_code` random 8-char base36 unique.

Commission: **30% one-time** của lần thanh toán đầu tiên Pro ($20 → 600 cents). Config qua env `REFERRAL_COMMISSION_PCT` (default 30).

### 2) Capture referral trên client

- `src/routes/__root.tsx` (client-only): đọc `?ref=CODE` từ URL, lưu vào `localStorage` (`nexa_ref`) + cookie 60 ngày.
- `src/routes/auth.signup.tsx`: khi submit signup gọi server fn `attachReferral({ code })` sau khi user đã có session → set `profiles.referred_by` nếu chưa có.

### 3) Ghi nhận commission

Trong `src/routes/api/public/webhooks/lemonsqueezy.ts`, khi event `subscription_created` hoặc `order_created` cho user có `referred_by` và chưa có bản ghi `referrals`:
- Tính `commission_cents = round(total_cents * pct / 100)`.
- Insert `referrals` (status=`converted`, converted_at=now).

### 4) Dashboard user — `/dashboard/referrals`

- Hiển thị: referral link (`https://nexatools.cloud/?ref=CODE`) + copy, tổng số click (bỏ qua v1), số signup, số converted, tổng earned, tổng đã paid, danh sách referrals, danh sách payouts.
- Thêm mục "Referrals" vào `dashboard-shell.tsx` sidebar.

### 5) Admin — `/admin/referrals`

- Bảng tất cả referrals (filter status).
- Bảng payouts + form "Create payout" (chọn referrer, số tiền, method, reference) → set các referrals liên quan sang `paid`.
- Thêm mục "Referrals" vào `admin-shell.tsx`.

### 6) Trang landing `/affiliates`

Marketing page ngắn: how it works, 30% commission, cookie 60 ngày, CTA "Sign in to get your link". Thêm link footer.

### 7) Files sẽ tạo/sửa

- Migration mới (schema + trigger + RLS).
- `src/lib/referrals.functions.ts` — `getMyReferralStats`, `attachReferral`.
- `src/routes/dashboard.referrals.tsx`.
- `src/routes/admin.referrals.tsx`.
- `src/routes/affiliates.tsx`.
- Sửa: `__root.tsx` (capture ref), `auth.signup.tsx` (attach sau signup), `api/public/webhooks/lemonsqueezy.ts` (ghi commission), `dashboard-shell.tsx` + `admin-shell.tsx` (menu), `site-footer.tsx` (link Affiliates).

### Ngoài phạm vi v1

- Click tracking chi tiết, multi-tier, hoa hồng recurring, tự động payout qua Stripe/PayPal API.

Nếu OK mình bắt đầu bằng migration.