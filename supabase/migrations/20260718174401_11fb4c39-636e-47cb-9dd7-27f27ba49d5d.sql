
-- =========================================================================
-- ROLES SYSTEM (separate table for security)
-- =========================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================================
-- SHARED updated_at TRIGGER
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================================
-- PROFILES
-- =========================================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  plan text NOT NULL DEFAULT 'free',
  credits int NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- CATEGORIES
-- =========================================================================
CREATE TABLE public.categories (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- TOOLS
-- =========================================================================
CREATE TABLE public.tools (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  short_description text NOT NULL,
  long_description text,
  category_id int REFERENCES public.categories(id) ON DELETE SET NULL,
  icon text,
  thumbnail text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  is_free boolean NOT NULL DEFAULT false,
  credit_cost int NOT NULL DEFAULT 1,
  input_schema jsonb,
  output_formats jsonb,
  api_endpoint text,
  client_side boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tools TO anon, authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published tools"
  ON public.tools FOR SELECT TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "Admins can view all tools"
  ON public.tools FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tools"
  ON public.tools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- TOOL_TRANSLATIONS
-- =========================================================================
CREATE TABLE public.tool_translations (
  id serial PRIMARY KEY,
  tool_id int REFERENCES public.tools(id) ON DELETE CASCADE NOT NULL,
  locale text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, locale)
);
GRANT SELECT ON public.tool_translations TO anon, authenticated;
GRANT ALL ON public.tool_translations TO service_role;
ALTER TABLE public.tool_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tool translations"
  ON public.tool_translations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage tool translations"
  ON public.tool_translations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- USAGE_LOGS
-- =========================================================================
CREATE TABLE public.usage_logs (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tool_id int REFERENCES public.tools(id) ON DELETE SET NULL,
  session_id text,
  credits_used int NOT NULL DEFAULT 0,
  ip_address text,
  user_agent text,
  processing_time_ms int,
  status text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.usage_logs TO authenticated;
GRANT ALL ON public.usage_logs TO service_role;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON public.usage_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all usage"
  ON public.usage_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- API_KEYS
-- =========================================================================
CREATE TABLE public.api_keys (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  key_hash text UNIQUE NOT NULL,
  key_prefix text NOT NULL,
  permissions jsonb,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own api keys"
  ON public.api_keys FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- CREDIT_TRANSACTIONS
-- =========================================================================
CREATE TABLE public.credit_transactions (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  amount int NOT NULL,
  payment_id text,
  tool_id int REFERENCES public.tools(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- SUBSCRIPTIONS
-- =========================================================================
CREATE TABLE public.subscriptions (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- BLOG_POSTS
-- =========================================================================
CREATE TABLE public.blog_posts (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  cover_image text,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  tags jsonb,
  meta_title text,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (published = true);
CREATE POLICY "Authors can view their own drafts"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (auth.uid() = author_id);
CREATE POLICY "Admins can view all posts"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage posts"
  ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- FAVORITE_TOOLS
-- =========================================================================
CREATE TABLE public.favorite_tools (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tool_id int REFERENCES public.tools(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorite_tools TO authenticated;
GRANT ALL ON public.favorite_tools TO service_role;
ALTER TABLE public.favorite_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
  ON public.favorite_tools FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- SEED CATEGORIES + 8 CLIENT-SIDE TOOLS
-- =========================================================================
INSERT INTO public.categories (slug, name, description, icon, display_order) VALUES
  ('developer', 'Developer', 'Tools for developers: formatters, encoders, generators', 'Code', 1),
  ('pdf', 'PDF', 'Compress, convert, merge, split PDFs', 'FileText', 2),
  ('image', 'Image', 'Resize, convert, compress, and edit images', 'Image', 3),
  ('ai', 'AI', 'AI-powered writing, summarization, and generation', 'Sparkles', 4);

INSERT INTO public.tools (slug, name, short_description, long_description, category_id, icon, is_featured, is_free, credit_cost, client_side, output_formats)
SELECT * FROM (VALUES
  ('json-formatter', 'JSON Formatter', 'Pretty print, minify, and validate JSON.', 'Format, minify, and validate JSON in your browser. No data ever leaves your device.', (SELECT id FROM public.categories WHERE slug='developer'), 'Braces', true, true, 0, true, '["json"]'::jsonb),
  ('base64', 'Base64 Encoder/Decoder', 'Encode and decode text or files to Base64.', 'Convert text and files to Base64 or decode Base64 strings back to their original form.', (SELECT id FROM public.categories WHERE slug='developer'), 'Binary', true, true, 0, true, '["text"]'::jsonb),
  ('url-encoder', 'URL Encoder/Decoder', 'Encode and decode URL strings.', 'Percent-encode and decode URLs and query strings.', (SELECT id FROM public.categories WHERE slug='developer'), 'Link', false, true, 0, true, '["text"]'::jsonb),
  ('jwt-decoder', 'JWT Decoder', 'Decode JWT tokens into header and payload.', 'Inspect JWT tokens by decoding the header and payload. Signature is not verified in V1.', (SELECT id FROM public.categories WHERE slug='developer'), 'KeyRound', true, true, 0, true, '["json"]'::jsonb),
  ('regex-tester', 'Regex Tester', 'Test regular expressions with live highlighting.', 'Write and test regular expressions with real-time match highlighting and capture groups.', (SELECT id FROM public.categories WHERE slug='developer'), 'Regex', false, true, 0, true, '["text"]'::jsonb),
  ('password-generator', 'Password Generator', 'Generate strong random passwords.', 'Create secure passwords with configurable length, character sets, and a strength meter.', (SELECT id FROM public.categories WHERE slug='developer'), 'Lock', true, true, 0, true, '["text"]'::jsonb),
  ('hash-generator', 'Hash Generator', 'MD5, SHA-1, SHA-256, SHA-512 hashes.', 'Compute cryptographic hashes of any text input in your browser.', (SELECT id FROM public.categories WHERE slug='developer'), 'Hash', false, true, 0, true, '["text"]'::jsonb),
  ('color-converter', 'Color Converter', 'Convert between HEX, RGB, HSL, HSV.', 'Pick a color and convert it between all common web color formats.', (SELECT id FROM public.categories WHERE slug='developer'), 'Palette', true, true, 0, true, '["text"]'::jsonb)
) AS t(slug, name, short_description, long_description, category_id, icon, is_featured, is_free, credit_cost, client_side, output_formats);
