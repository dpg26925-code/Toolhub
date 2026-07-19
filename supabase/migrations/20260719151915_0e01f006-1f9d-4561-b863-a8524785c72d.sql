
INSERT INTO public.categories (slug, name, description, icon) VALUES
  ('video', 'Video', 'Trim, compress, convert video and extract audio — all in-browser.', '🎬'),
  ('converter', 'Converters', 'Convert between file formats: images, data, spreadsheets, markdown.', '⇄')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tools (slug, name, short_description, category_id, icon, is_featured, is_free, credit_cost, client_side)
VALUES
  ('video-to-gif','Video to GIF','Convert a video clip into an animated GIF — trim range, fps and width.', (SELECT id FROM categories WHERE slug='video'),'🎞️',true,true,0,true),
  ('video-trimmer','Video Trimmer','Cut a section of any video without re-encoding — fast and lossless.', (SELECT id FROM categories WHERE slug='video'),'✂️',false,true,0,true),
  ('video-compressor','Video Compressor','Compress MP4/WebM video with quality control — right in your browser.', (SELECT id FROM categories WHERE slug='video'),'🗜️',true,true,0,true),
  ('audio-extractor','Audio Extractor','Extract the audio track from a video as MP3, WAV or AAC.', (SELECT id FROM categories WHERE slug='video'),'🎧',false,true,0,true),
  ('video-to-mp3','Video to MP3','Convert MP4, MOV or WebM videos to MP3 audio files.', (SELECT id FROM categories WHERE slug='video'),'🔊',true,true,0,true),
  ('grammar-checker','AI Grammar Checker','Fix grammar, spelling and punctuation with AI — keeps your original voice.', (SELECT id FROM categories WHERE slug='ai'),'✅',true,true,1,false),
  ('paragraph-generator','AI Paragraph Generator','Turn a topic or a few keywords into a well-structured paragraph.', (SELECT id FROM categories WHERE slug='ai'),'¶',false,true,1,false),
  ('email-writer','AI Email Writer','Draft professional, casual or persuasive emails from a short brief.', (SELECT id FROM categories WHERE slug='ai'),'✉️',true,true,1,false),
  ('blog-title-generator','Blog Title Generator','Generate 10 catchy, SEO-friendly blog titles from a topic or keyword.', (SELECT id FROM categories WHERE slug='ai'),'📝',false,true,1,false),
  ('content-expander','AI Content Expander','Expand short notes or bullet points into full, detailed content.', (SELECT id FROM categories WHERE slug='ai'),'📖',false,true,1,false),
  ('tone-changer','AI Tone Changer','Rewrite any text in a different tone: friendly, formal, witty, empathetic.', (SELECT id FROM categories WHERE slug='ai'),'🎭',false,true,1,false),
  ('image-converter','Image Format Converter','Convert between PNG, JPG, WEBP and AVIF — client-side, no upload.', (SELECT id FROM categories WHERE slug='converter'),'🖼️',true,true,0,true),
  ('markdown-to-html','Markdown ↔ HTML','Convert Markdown to HTML or clean HTML back to Markdown.', (SELECT id FROM categories WHERE slug='converter'),'M↓',false,true,0,true),
  ('yaml-json','YAML ↔ JSON','Convert between YAML and JSON with proper formatting.', (SELECT id FROM categories WHERE slug='converter'),'⇄',false,true,0,true),
  ('xml-json','XML ↔ JSON','Convert XML to JSON or JSON back to XML instantly.', (SELECT id FROM categories WHERE slug='converter'),'</>',false,true,0,true),
  ('toml-json','TOML ↔ JSON','Convert between TOML config and JSON — great for Rust/Cargo files.', (SELECT id FROM categories WHERE slug='converter'),'⇄',false,true,0,true),
  ('excel-to-csv','Excel to CSV','Convert .xlsx or .xls spreadsheets to CSV files — pick any sheet.', (SELECT id FROM categories WHERE slug='converter'),'📊',true,true,0,true)
ON CONFLICT (slug) DO NOTHING;
