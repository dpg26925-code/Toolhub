
INSERT INTO public.categories (slug, name, description, icon) VALUES
  ('affiliate', 'Affiliate', 'UTM builders, disclosures, commission calculators and link tools for affiliate marketers.', '🔗')
ON CONFLICT (slug) DO NOTHING;

WITH cat AS (SELECT id FROM public.categories WHERE slug='affiliate')
INSERT INTO public.tools (slug, name, short_description, category_id, icon, is_featured, is_free, is_published, credit_cost, client_side, status)
VALUES
  ('utm-builder','UTM Builder','Build tracked campaign URLs with UTM parameters and a downloadable QR code.',(SELECT id FROM cat),'🔗',true,true,true,0,true,'published'),
  ('disclosure-generator','Affiliate Disclosure Generator','Generate FTC-compliant affiliate disclosures for blog, YouTube, Instagram, TikTok and more.',(SELECT id FROM cat),'📄',false,true,true,0,true,'published'),
  ('commission-calculator','Commission Calculator','Calculate affiliate commissions, effective rates and bonus payouts.',(SELECT id FROM cat),'💰',false,true,true,0,true,'published'),
  ('link-expander','Link Expander','Expand shortened links and see the full redirect chain and final destination.',(SELECT id FROM cat),'🔎',false,true,true,0,true,'published'),
  ('campaign-url-builder','Campaign URL Builder','Build ready-to-share campaign URLs per platform with QR code.',(SELECT id FROM cat),'🎯',true,true,true,0,true,'published'),
  ('affiliate-income-calculator','Affiliate Income Calculator','Project monthly and yearly affiliate income from traffic, conversion rate and commission.',(SELECT id FROM cat),'📈',false,true,true,0,true,'published'),
  ('hashtag-generator','Hashtag Generator','Extract relevant hashtags from any text — sized for Instagram, Twitter/X and LinkedIn.',(SELECT id FROM cat),'#',false,true,true,0,true,'published'),
  ('affiliate-link-checker','Affiliate Link Checker','Batch-check affiliate URLs for broken, redirected or active status and export as CSV.',(SELECT id FROM cat),'✅',false,true,true,0,true,'published')
ON CONFLICT (slug) DO NOTHING;
