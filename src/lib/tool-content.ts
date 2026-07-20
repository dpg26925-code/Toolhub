import type { Tool } from "./tools-data";

export type Faq = { q: string; a: string };
export type ToolContent = {
  /** SEO title category label, e.g. "PDF Tool" */
  categoryLabel: string;
  /** 300-500 word body copy shown below the tool UI */
  longDescription: string;
  /** Step-by-step instructions */
  howToUse: string[];
  faqs: Faq[];
};

const CATEGORY_LABEL: Record<string, string> = {
  pdf: "PDF Tool",
  image: "Image Tool",
  video: "Video Tool",
  converter: "File Converter",
  ai: "AI Tool",
  developer: "Developer Tool",
  youtube: "YouTube Tool",
  affiliate: "Affiliate Marketing Tool",
  tiktok: "TikTok Creator Tool",
  trader: "Trader Tool",
  accounting: "Accounting Tool",
};

// Category-specific copy fragments used to weave tool-specific detail
// into the three default paragraphs and the default FAQ answers.
// Each field varies by category so two tools in different categories
// (and to a large extent, two tools within the same category — because
// tool.name and tool.shortDescription are threaded through) produce
// clearly distinct body copy for search engines and readers.
type CategoryCopy = {
  /** Who uses this and in what real workflow. */
  audience: string;
  /** The concrete input the tool consumes. */
  input: string;
  /** The concrete output the tool produces. */
  output: string;
  /** Related tools worth mentioning in the closing paragraph. */
  companions: string;
  /** Tool-category context for the "limits" FAQ. */
  limits: string;
  /** Tool-category context for the "commercial use" FAQ. */
  commercial: string;
  /** An extra category-specific Q&A appended to the default FAQ list. */
  extraFaq: (tool: Tool) => Faq;
};

const CATEGORY_COPY: Record<string, CategoryCopy> = {
  pdf: {
    audience: "Legal teams, students, accountants and support staff",
    input: "a PDF file (single or multi-page, up to the size limit shown in the form)",
    output: "a new PDF you can email, upload to a portal or archive",
    companions: "PDF Merge, PDF Split and PDF to Image",
    limits: "Free users can process files up to 50 MB per run. Sign in for higher per-day limits, or upgrade to Pro for batch processing.",
    commercial: "Yes — signed contracts, invoices and internal reports are exactly what this tool is built for. Nexatools grants a commercial-use licence on every plan.",
    extraFaq: (t) => ({
      q: `Will ${t.name} preserve fonts, forms and hyperlinks in my PDF?`,
      a: `Yes. ${t.name} operates on the PDF object stream directly, so embedded fonts, form fields, bookmarks and hyperlinks survive the round-trip. Scanned image-only PDFs behave like flat images — run OCR first if you need selectable text.`,
    }),
  },
  image: {
    audience: "Photographers, e-commerce sellers, designers and marketing teams",
    input: "a JPG, PNG or WebP image (up to the size limit shown in the form)",
    output: "a re-encoded image you can drop into a website, ad or product listing",
    companions: "Image Resizer, Remove Background and Image Compressor",
    limits: "Uploads are capped at 10 MB per image for the free tier. Signed-in users get higher daily quotas and Pro accounts unlock batch runs.",
    commercial: "Yes — commercial photography, product mockups and ad assets are covered by every plan's licence.",
    extraFaq: (t) => ({
      q: `Does ${t.name} strip EXIF metadata from my photo?`,
      a: `${t.name} preserves EXIF by default so cameras, colour profiles and orientation stay intact. If you want a clean file with metadata removed, run the EXIF Remover tool afterwards.`,
    }),
  },
  video: {
    audience: "Short-form creators, product marketers and support engineers",
    input: "an MP4, MOV or WebM clip (up to the size shown in the form)",
    output: "a smaller, re-encoded clip ready for social, docs or a support ticket",
    companions: "Video Compressor, Video to GIF and Audio Extractor",
    limits: "Client-side video tools cap uploads at 200 MB for the free tier because processing happens in your browser via FFmpeg WASM.",
    commercial: "Yes — YouTube uploads, paid ad creatives and client deliverables are all covered.",
    extraFaq: (t) => ({
      q: `Which codecs does ${t.name} accept?`,
      a: `${t.name} reads whatever the FFmpeg WebAssembly build supports — H.264/AVC and H.265/HEVC in MP4 or MOV, VP8/VP9 in WebM, plus AV1. Exotic containers or DRM-protected files won't decode.`,
    }),
  },
  converter: {
    audience: "Developers, data analysts and content teams",
    input: "your source data — a file upload or pasted text in the input box",
    output: "the same data in the target format, ready to copy or download",
    companions: "JSON Formatter, CSV to JSON and Markdown to HTML",
    limits: "There's no hard cap on paste-based conversions; file uploads follow the size shown in the form. Very large payloads (10 MB+) may slow the browser tab.",
    commercial: "Yes — build pipelines, migrate spreadsheets or ship converted assets to clients. Every plan includes commercial rights.",
    extraFaq: (t) => ({
      q: `Is the conversion in ${t.name} lossless?`,
      a: `Structural conversions (JSON ↔ CSV, YAML ↔ JSON, XML ↔ JSON) round-trip cleanly. When mapping to a less expressive format — like flattening nested JSON into CSV — ${t.name} shows a warning so you can decide whether the loss is acceptable.`,
    }),
  },
  ai: {
    audience: "Marketers, students, support agents and busy knowledge workers",
    input: "up to 20,000 characters of text — an article, transcript, chat log or draft",
    output: "AI-generated output you can copy straight into an email, doc or CMS",
    companions: "AI Summarizer, AI Translator and AI Rewriter",
    limits: "Each run costs 1 credit. Free accounts start with 10 credits, Pro accounts get 500/month plus API access for automation.",
    commercial: "Yes — you own the outputs and can publish or resell them. We don't train models on your inputs.",
    extraFaq: (t) => ({
      q: `Which model powers ${t.name}?`,
      a: `${t.name} runs on OpenRouter with a fast default model (Gemini 2.5 Flash class). Pro users can pin a specific model — Claude, GPT-4o or Llama — for consistent style across runs.`,
    }),
  },
  developer: {
    audience: "Backend and frontend developers, DevOps engineers and QA teams",
    input: "the text, token or payload you're inspecting — paste it into the input box",
    output: "a formatted, decoded or validated result you can copy back into your editor",
    companions: "JSON Formatter, JWT Decoder and Base64 Encoder",
    limits: "No hard limits for paste-based input. For very large payloads (5 MB+) the browser may lag briefly while the tool parses.",
    commercial: "Yes — use it inside client work, at your day job or on a public product. There's no attribution requirement.",
    extraFaq: (t) => ({
      q: `Can I automate ${t.name} from a script or CI job?`,
      a: `Pro accounts include an HTTP API that exposes the same functionality as ${t.name}. Generate an API key from the dashboard, then POST your payload — the response matches what you see in the UI.`,
    }),
  },
  youtube: {
    audience: "YouTubers, agencies and social media managers",
    input: "a YouTube URL or the raw text you want to format",
    output: "a snippet, description block, timestamp list or asset you can paste into YouTube Studio",
    companions: "YouTube Thumbnail Downloader, Chapter Generator and Hashtag Generator",
    limits: "Public YouTube metadata is fetched via the oEmbed and public thumbnail endpoints — no API key required and no per-day quota for reasonable use.",
    commercial: "Yes — use the outputs in monetised videos, sponsored posts or agency deliverables.",
    extraFaq: (t) => ({
      q: `Does ${t.name} work with unlisted or private videos?`,
      a: `Unlisted videos work when you have the direct URL, since YouTube exposes the same public metadata. Private videos require you to be signed into YouTube — ${t.name} can't bypass access controls.`,
    }),
  },
  affiliate: {
    audience: "Affiliate marketers, bloggers and creator-economy operators",
    input: "your tracking URL, commission numbers or campaign details",
    output: "a ready-to-share link, disclosure block or income projection",
    companions: "UTM Builder, Commission Calculator and Affiliate Link Checker",
    limits: "No credit cost and no per-day cap — every affiliate tool runs client-side, so you can build hundreds of links in a session.",
    commercial: "Yes — Amazon Associates, ShareASale, Impact and every major network are supported use cases.",
    extraFaq: (t) => ({
      q: `Does ${t.name} store the links or campaign data I enter?`,
      a: `No. ${t.name} runs entirely in your browser, so tracking IDs, sub-affiliate tags and commission figures never leave your device — safe to use with campaigns under NDA.`,
    }),
  },
  tiktok: {
    audience: "TikTok creators, TikTok Shop sellers and short-form ad buyers",
    input: "your script, caption, hashtag idea or product details",
    output: "a polished caption, hashtag set, checklist or calculation you can paste into TikTok",
    companions: "Hashtag Generator, Caption Writer and TikTok Shop tools",
    limits: "Local tools have no per-day cap; AI-assisted tools cost 1 credit each. Free accounts start with 10 credits.",
    commercial: "Yes — paid creator content, TikTok Shop listings and agency posts are all covered.",
    extraFaq: (t) => ({
      q: `Will ${t.name} respect TikTok's character and hashtag limits?`,
      a: `Yes. ${t.name} enforces TikTok's current caption limit (2,200 characters) and warns before you exceed the recommended 3–5 hashtags for engagement.`,
    }),
  },
  trader: {
    audience: "Retail forex, crypto and CFD traders",
    input: "your account size, entry, stop-loss and instrument details",
    output: "position size, risk figures and indicator readings you can act on",
    companions: "Position Size Calculator, Risk/Reward Calculator and Pip Calculator",
    limits: "No credit cost and no per-day cap — trading tools run 100% in your browser, so account balances and P/L never leave your device.",
    commercial: "Yes — use the outputs in prop-firm challenges, client portfolios or trading education. Results are informational, not financial advice.",
    extraFaq: (t) => ({
      q: `Which instruments does ${t.name} support?`,
      a: `${t.name} handles forex pairs, crypto (BTC, ETH and major alts), stock CFDs and index CFDs. Pip and lot values are computed from the quote currency you pick, so exotic pairs work as well as majors.`,
    }),
  },
  accounting: {
    audience: "Freelancers, small business owners and finance teams",
    input: "the invoice, salary, VAT or loan figures you're working with",
    output: "a calculated result or downloadable document (PDF invoice, receipt, schedule)",
    companions: "VAT Calculator, Invoice Generator and Loan Amortization",
    limits: "No credit cost. PDF exports are unlimited and there's no per-day cap — everything runs client-side.",
    commercial: "Yes — generated invoices, receipts and schedules are yours to send to real clients. Nexatools takes no branding cut on the output.",
    extraFaq: (t) => ({
      q: `Which currencies and tax rates does ${t.name} support?`,
      a: `${t.name} supports every currency ISO code and accepts any tax rate you type in, so it works for VAT (EU), GST (AU/CA/IN), sales tax (US) and any other regime. Formatting follows the locale you choose in the form.`,
    }),
  },
};

const DEFAULT_CATEGORY_COPY: CategoryCopy = {
  audience: "Product, engineering and operations teams",
  input: "the input shown in the form above (text, file or URL)",
  output: "a result you can copy or download in one click",
  companions: "the other utilities in the Nexatools directory",
  limits: "No hard limits on the free tier for reasonable use. Sign in for higher daily quotas and Pro accounts unlock batch runs and API access.",
  commercial: "Yes — every Nexatools plan grants a commercial-use licence over the output.",
  extraFaq: (t) => ({
    q: `What makes ${t.name} different from other online tools?`,
    a: `${t.name} is part of Nexatools — a single directory of 130+ purpose-built tools with a consistent interface, real internal linking between related tools and a privacy-first architecture (client-side where possible, no ad trackers on the tool pages).`,
  }),
};

function categoryCopy(tool: Tool): CategoryCopy {
  return CATEGORY_COPY[tool.categorySlug] ?? DEFAULT_CATEGORY_COPY;
}

function toolAction(tool: Tool): string {
  return tool.shortDescription.replace(/\.$/, "").replace(/^./, (c) => c.toLowerCase());
}

/** Default long description used when no override exists — keeps SEO body copy on every tool page.
 *  The copy is deliberately category- and tool-specific in every paragraph
 *  so two tool pages never share identical passages. */
function defaultLongDescription(tool: Tool): string {
  const c = categoryCopy(tool);
  const runtime = tool.clientSide
    ? `${tool.name} runs 100% inside your browser tab — nothing you paste or upload is sent to a server`
    : `${tool.name} runs on Nexatools' secure server infrastructure with per-session isolation and no long-term storage`;
  const action = toolAction(tool);

  const p1 = `${tool.name} is a purpose-built online tool that helps you ${action}. Instead of stitching together a spreadsheet, a CLI or a heavyweight desktop app, you get a focused single-page workflow that takes ${c.input} and returns ${c.output} in seconds.`;

  const p2 = `${c.audience} reach for ${tool.name} when they need a reliable answer fast — inside a support ticket, before a meeting, while shipping a release or between takes on a video shoot. ${runtime}, so the workflow stays private and portable across desktop, tablet and mobile browsers.`;

  const p3 = `${tool.name} is one of 130+ tools in the Nexatools directory. Pair it with ${c.companions} to build a full ${c.audience.toLowerCase().split(",")[0]} toolkit that lives in a single tab. Sign in for a free account to save history and favourites, or upgrade to Pro for API access, batch processing and higher daily quotas.`;

  return [p1, p2, p3].join("\n\n");
}

function defaultHowToUse(tool: Tool): string[] {
  const c = categoryCopy(tool);
  return [
    `Open the ${tool.name} page — no signup required to try it once.`,
    `Provide ${c.input} using the form above and adjust any options for your workflow.`,
    `Click the action button and download or copy ${c.output.replace(/^a(n)? /, "the ")}.`,
  ];
}

function defaultFaqs(tool: Tool): Faq[] {
  const c = categoryCopy(tool);
  const privacy = tool.clientSide
    ? `Nothing you paste or upload to ${tool.name} leaves your device. The tool runs in your browser via JavaScript and WebAssembly, so files, tokens and account numbers stay local — safe for confidential documents and internal data.`
    : `${tool.name} processes your input on Nexatools' servers with per-session isolation. Files are deleted immediately after your session ends and nothing is used to train models or sold to third parties.`;
  return [
    {
      q: `Is ${tool.name} really free?`,
      a: `Yes — ${tool.name} is free to use without an account. Signed-in users get higher daily limits and can save history and favourites; Pro accounts unlock API access and batch runs.`,
    },
    {
      q: `Does ${tool.name} store my files or data?`,
      a: privacy,
    },
    {
      q: `Are there limits on how much I can use ${tool.name}?`,
      a: c.limits,
    },
    {
      q: `Can I use ${tool.name} for commercial or client work?`,
      a: c.commercial,
    },
    c.extraFaq(tool),
  ];
}

/** Per-tool overrides. Add entries here to give featured tools bespoke copy. */
const OVERRIDES: Record<string, Partial<ToolContent>> = {
  "pdf-compressor": {
    longDescription: "PDF Compressor reduces the file size of your PDF documents so they're easier to email, upload or archive — without stripping out the content you need. Drop in a PDF up to 50 MB and it re-encodes the file's object streams in your browser, producing a smaller download you can share right away.\n\nThis is the go-to tool when a customer portal, application form or file-sharing service rejects your PDF for being too large. Common use cases include shrinking scanned contracts before emailing them, compressing image-heavy design decks for faster sharing and preparing PDFs for storage-limited archives. Because every step happens on your device, sensitive documents never leave your machine.\n\nCompression results vary by document — text-heavy PDFs typically shrink less than image-heavy ones. The tool displays the before/after size and the percentage saved so you can decide whether the trade-off is worth it before downloading.",
    howToUse: [
      "Click the file picker and select the PDF you want to compress.",
      "Wait a few seconds while your browser re-encodes the PDF locally.",
      "Review the size reduction and click Download to save the compressed file.",
    ],
    faqs: [
      { q: "How much can PDF Compressor shrink my file?", a: "Image-heavy PDFs often compress 30–70%. Text-only PDFs are already dense and typically only shrink 5–15%." },
      { q: "Will compression reduce the quality?", a: "No — this tool re-encodes object streams without recompressing images, so text and vector content stay pixel-perfect." },
      { q: "Is there a file-size limit?", a: "Up to 50 MB per file. For larger PDFs, sign up for a Pro account or use PDF Split first to break the document into sections." },
    ],
  },
  "remove-background": {
    longDescription: "Remove Image Background erases the background from any photo automatically, leaving you with a clean transparent PNG in seconds. Whether you're preparing product shots for an online store, cutting out a headshot for a resume or building a design collage, this tool skips the tedious manual masking in Photoshop and does the work in one click.\n\nUnder the hood, a neural network runs directly inside your browser using WebAssembly — no files are uploaded to any server, and processing works even when you're offline once the model has loaded. That means your photos stay completely private, which matters for personal photos, unreleased product imagery and anything under NDA.\n\nThe output is a transparent PNG that drops cleanly onto any background — solid color, gradient, another photo or a web page. Use the built-in before/after slider to preview the cut-out and re-run it if the edges need a second pass.",
    howToUse: [
      "Upload a JPG or PNG image (up to 10 MB).",
      "Wait for the background removal model to run — usually 5–20 seconds depending on your device.",
      "Preview the result with the before/after slider and download the transparent PNG.",
    ],
    faqs: [
      { q: "What image formats work?", a: "JPG, PNG and WEBP are supported. The output is always a transparent PNG." },
      { q: "Does this work on complex images with hair or fur?", a: "Yes — the AI model is trained on portraits, products and animals. Results are generally excellent, though very fine hair strands may need light manual cleanup." },
      { q: "Is my photo uploaded?", a: "No. The entire model runs in your browser via WebAssembly, so your image never leaves your device." },
    ],
  },
  "chat-pdf": {
    longDescription: "Chat with PDF turns any PDF document into a searchable, conversational knowledge base. Upload a report, textbook, research paper or contract, and ask questions in plain English — the AI reads through the document and answers with quotes and context, saving you hours of manual skimming.\n\nThis is perfect for students summarizing long readings, professionals reviewing lengthy contracts, researchers navigating dense papers and analysts pulling numbers from financial filings. Instead of Ctrl+F guessing at keywords, you ask questions the way you'd ask a colleague: 'What are the payment terms?' or 'Summarize section 3 in bullet points.'\n\nWe extract the PDF's text in your browser and send only the relevant portions to our AI provider (Google Gemini) alongside your question. Your document isn't stored on our servers and isn't used to train any models. Uploads are limited to 25 MB for now.",
    howToUse: [
      "Upload a PDF document (up to 25 MB).",
      "Wait a moment while we extract the text in your browser.",
      "Type any question about the document and press Send — the AI answers with context from your file.",
    ],
    faqs: [
      { q: "What kinds of PDFs work best?", a: "Text-based PDFs (reports, articles, contracts). Scanned image PDFs need to be OCR'd first — use the OCR tool then paste the result." },
      { q: "Is my document stored?", a: "No. Text is extracted locally and only the relevant chunks are sent to the AI provider for each question. Nothing is retained after your session." },
      { q: "Which AI model powers Chat PDF?", a: "Google Gemini 2.5 Flash via the Lovable AI Gateway — chosen for its long context window and fast response times." },
    ],
  },
  "summarize": {
    longDescription: "AI Text Summarizer condenses long articles, reports, meeting transcripts and research papers into clear, digestible summaries. Paste up to 20,000 characters, pick your preferred length (short, medium or long) and style (bulleted or paragraph), and the AI returns a summary that captures the key points without the fluff.\n\nUse it to prep for meetings by summarizing the brief in advance, to skim news articles in bullet form, to compress long email threads or to create study guides from lecture transcripts. Because the tool is powered by Google Gemini, it handles nuance and technical vocabulary well — you'll get concise summaries of legal, medical or engineering material without losing important qualifications.\n\nEvery run costs 1 credit. Free accounts get 10 credits on signup; Pro accounts get 500 credits per month plus API access to automate summarization in your own apps.",
    howToUse: [
      "Paste the text you want to summarize into the input box.",
      "Choose the desired summary length and style.",
      "Click Summarize — the result appears in seconds and can be copied with one click.",
    ],
    faqs: [
      { q: "What's the maximum input length?", a: "20,000 characters per request — roughly a 6-page article. For longer inputs, split the text into sections and summarize each." },
      { q: "How many credits does a summary cost?", a: "1 credit per summary, regardless of length or style." },
      { q: "Can I summarize in languages other than English?", a: "Yes — Gemini handles most major languages. Just paste text in the source language and the summary will match." },
    ],
  },
  "json-formatter": {
    longDescription: "JSON Formatter is a fast, browser-based utility for developers who spend their day reading and writing JSON. Paste any JSON payload — API responses, config files, log entries — and get an instantly formatted, syntax-highlighted output with the ability to pretty-print, minify or validate the structure.\n\nEvery developer's toolkit needs a reliable JSON formatter, and this one runs 100% client-side so you can safely paste sensitive API responses without worrying about them being logged or sent anywhere. It's also fast enough to handle payloads several megabytes in size without stalling the page.\n\nCombine this with the other developer tools on Nexatools — JWT Decoder for inspecting auth tokens, Base64 for encoded fields, Regex Tester for pattern matching and CSV to JSON for data conversion — and you have a full browser-based debugging workbench without ever leaving the tab.",
    howToUse: [
      "Paste your raw JSON into the input box.",
      "Click Format to pretty-print, or Minify to collapse to a single line.",
      "Copy the result with the Copy button, or download it as a .json file.",
    ],
    faqs: [
      { q: "Does the JSON Formatter validate my input?", a: "Yes — if your JSON is malformed, the tool highlights the exact position of the syntax error." },
      { q: "Is my JSON sent anywhere?", a: "No. Formatting happens entirely in your browser, so paste sensitive payloads with confidence." },
      { q: "What's the maximum size?", a: "There's no hard limit, but very large payloads (10 MB+) may slow down your browser tab." },
    ],
  },
  "base64": {
    longDescription: "Base64 Encoder / Decoder converts text and binary data between raw form and the Base64 text encoding used all over the web — Basic Auth headers, JWT payloads, data: URLs, email attachments and embedded images in CSS. Paste in either direction and get an instant, faithful result you can copy straight into your code.\n\nEncoding runs entirely in your browser using the native TextEncoder and btoa/atob APIs, so credentials and tokens you're debugging never touch a server. The tool handles UTF-8 correctly — no more mangled characters when your input contains emoji, accents or non-Latin scripts — and supports URL-safe variants for JWT-style payloads.\n\nPair Base64 with JWT Decoder to inspect auth tokens, JSON Formatter to pretty-print decoded payloads, or Hash Generator when you need to fingerprint the encoded output.",
    howToUse: [
      "Paste your text (to encode) or Base64 string (to decode) into the input box.",
      "Choose Encode or Decode — UTF-8 is handled automatically.",
      "Copy the result or download it as a text file.",
    ],
    faqs: [
      { q: "Does this handle UTF-8 and emoji?", a: "Yes — the tool encodes via TextEncoder, so multi-byte characters round-trip correctly instead of getting mangled by naive btoa()." },
      { q: "Can I decode URL-safe Base64 (JWTs)?", a: "Yes. The decoder accepts both standard and URL-safe alphabets and pads missing '=' characters automatically." },
      { q: "Is my input sent to a server?", a: "No — all encoding and decoding happens in your browser tab." },
    ],
  },
  "jwt-decoder": {
    longDescription: "JWT Decoder inspects the header, payload and signature of any JSON Web Token so you can see exactly what a client or backend is sending. Paste a token and the tool splits it, Base64URL-decodes each segment, pretty-prints the JSON and highlights standard claims like iss, sub, aud, exp and iat with human-readable expiry dates.\n\nThis is the fastest way to debug auth issues — expired tokens, wrong audience, missing scopes, misconfigured issuer — without spinning up a debugger or writing a script. Everything happens in your browser, so production tokens stay on your machine and are never logged.\n\nJWT Decoder does not verify signatures against a secret or JWKS — for that, wire your library of choice into your test environment. It's designed for quick inspection, not authentication.",
    howToUse: [
      "Paste a JWT (three dot-separated Base64URL segments) into the input.",
      "Read the decoded header and payload side by side, with expiry claims formatted as dates.",
      "Copy any field or the full decoded JSON with the Copy button.",
    ],
    faqs: [
      { q: "Does the tool verify the JWT signature?", a: "No. Signature verification requires the signing secret or JWKS, which we intentionally never ask for. Use your language's JWT library for verification." },
      { q: "Is the token sent to a server?", a: "No — parsing happens in your browser, so it's safe to paste production tokens." },
      { q: "Which algorithms are supported for reading?", a: "Any JWT with a standard three-segment structure — HS256, RS256, ES256 and others. Only the payload is decoded; the signature is displayed but not verified." },
    ],
  },
  "password-generator": {
    longDescription: "Password Generator creates strong, cryptographically random passwords tuned to the requirements of the site or system you're signing up for. Set the length, toggle uppercase, digits and symbols, and generate a new password with one click — or a batch of them if you're onboarding a team.\n\nUnlike naive JavaScript Math.random() generators, this tool uses the browser's Web Crypto API (crypto.getRandomValues) so the output is genuinely unpredictable and safe for use as an account password, API secret, database seed or one-time code. Nothing is transmitted or stored — the password only exists in your clipboard until you paste it into a password manager.\n\nFor sensitive accounts, pair the generated password with a passphrase manager like 1Password, Bitwarden or your browser's built-in vault. For system secrets, drop the output straight into your .env file or CI secret store.",
    howToUse: [
      "Set the desired length (12–64 characters recommended).",
      "Toggle character classes — uppercase, digits, symbols — to match the site's requirements.",
      "Click Generate and copy the password directly into your password manager.",
    ],
    faqs: [
      { q: "How random are the passwords?", a: "The generator uses crypto.getRandomValues from the Web Crypto API — the same source browsers use for TLS keys. Output is suitable for account passwords and API secrets." },
      { q: "Are passwords sent or logged?", a: "No. Generation runs in your browser and no password ever leaves the page." },
      { q: "What length should I use?", a: "16 characters is a safe default for most accounts. Use 24+ for high-value accounts and 32+ for machine-to-machine secrets." },
    ],
  },
  "image-resizer": {
    longDescription: "Image Resizer scales JPG, PNG, WebP and GIF files to exact pixel dimensions or a percentage of the original, keeping the aspect ratio locked by default. It's the quickest way to prep hero images for a website, avatars for a social profile, or thumbnails for a product listing — without opening a full image editor.\n\nResizing runs in your browser using the Canvas API, so your photos never upload to a server. That matters for personal photos, unreleased product shots and client work under NDA. Output is re-encoded in the format of your choice, so you can also convert a PNG to a smaller JPG or WebP as part of the same step.\n\nFor batch workflows or transparent-background cutouts, combine Image Resizer with Remove Background and Image Compressor to build a complete asset-prep pipeline that never leaves the tab.",
    howToUse: [
      "Upload a JPG, PNG, WebP or GIF (up to 10 MB).",
      "Enter the target width or height — the other dimension follows automatically to preserve aspect ratio.",
      "Choose the output format and click Download.",
    ],
    faqs: [
      { q: "Does resizing lose quality?", a: "Downscaling looks great. Upscaling beyond the original resolution will inevitably look soft — for enlargement, use an AI upscaler." },
      { q: "Are my images uploaded?", a: "No. Resizing runs entirely in your browser via the Canvas API." },
      { q: "Can I convert between formats?", a: "Yes — pick JPG, PNG or WebP as the output format regardless of the input format." },
    ],
  },
  "translate": {
    longDescription: "AI Translator converts text between 100+ languages while preserving tone, idiom and technical vocabulary far better than word-for-word tools. Paste up to 10,000 characters, pick the source and target languages (or leave source on Auto-detect), and get a translation that reads naturally to a native speaker.\n\nPowered by Google Gemini, this translator handles nuance that classic MT engines miss: idioms are localised rather than translated literally, honorifics adapt to the target culture, and code snippets or product names are preserved verbatim. It's ideal for translating marketing copy, support emails, documentation and short-form content that will be read by humans, not just crawled by search engines.\n\nEvery translation costs 1 credit. Free accounts get 10 credits on signup; Pro accounts get 500 credits per month plus API access to embed translation directly into your product.",
    howToUse: [
      "Paste the text you want to translate into the input box.",
      "Pick the source language (or Auto-detect) and the target language.",
      "Click Translate — the result appears in seconds and can be copied with one click.",
    ],
    faqs: [
      { q: "How many languages are supported?", a: "100+ — including all major European, Asian, Middle Eastern and African languages that Gemini supports." },
      { q: "How does this compare to Google Translate?", a: "The underlying model is designed for context-aware output, so idioms and tone typically read more naturally, especially for longer passages." },
      { q: "How many credits does a translation cost?", a: "1 credit per translation, regardless of length or language pair." },
    ],
  },
};

export function getToolContent(tool: Tool): ToolContent {
  const override = OVERRIDES[tool.slug] ?? {};
  return {
    categoryLabel: CATEGORY_LABEL[tool.categorySlug] ?? "Online Tool",
    longDescription: override.longDescription ?? defaultLongDescription(tool),
    howToUse: override.howToUse ?? defaultHowToUse(tool),
    faqs: override.faqs ?? defaultFaqs(tool),
  };
}

export function toolPageTitle(tool: Tool): string {
  const label = CATEGORY_LABEL[tool.categorySlug] ?? "Online Tool";
  return `${tool.name} — Free Online ${label} | Nexatools`;
}

export function toolMetaDescription(tool: Tool): string {
  const base = tool.shortDescription.replace(/\.$/, "");
  const suffix = " Free, fast, no signup needed.";
  const max = 155;
  const full = `${base}.${suffix}`;
  return full.length > max ? full.slice(0, max - 1).trimEnd() + "…" : full;
}