
INSERT INTO public.categories (slug, name, description, icon) VALUES
  ('youtube', 'YouTube', 'Free YouTube helpers: thumbnails, embeds, chapters, hashtags — 100% in-browser.', '▶️')
ON CONFLICT (slug) DO NOTHING;

WITH cat AS (SELECT id FROM public.categories WHERE slug='youtube')
INSERT INTO public.tools (slug, name, short_description, category_id, icon, is_featured, is_free, is_published, credit_cost, client_side, status)
VALUES
  ('yt-thumbnail','YouTube Thumbnail Downloader','Grab a YouTube video''s thumbnail in every available resolution.',(SELECT id FROM cat),'🖼️',true,true,true,0,true,'published'),
  ('yt-embed','YouTube Embed Code Generator','Build an iframe embed with autoplay, loop, controls and start-time options.',(SELECT id FROM cat),'</>',false,true,true,0,true,'published'),
  ('yt-timestamp','YouTube Timestamp Link','Generate a deep link that jumps to a specific moment in a YouTube video.',(SELECT id FROM cat),'⏱️',false,true,true,0,true,'published'),
  ('yt-chapters','YouTube Chapter Generator','Format timestamps into a valid YouTube chapters description block.',(SELECT id FROM cat),'📑',false,true,true,0,true,'published'),
  ('yt-hashtags','YouTube Hashtag Generator','Extract keyword-based hashtags from a video title and description.',(SELECT id FROM cat),'#',false,true,true,0,true,'published'),
  ('yt-title-formatter','YouTube Title & Description Formatter','Turn a rough idea into a title-cased SEO title, tags and description template.',(SELECT id FROM cat),'✍️',false,true,true,0,true,'published')
ON CONFLICT (slug) DO NOTHING;
