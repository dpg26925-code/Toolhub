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
  health: "Health Calculator",
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
  health: {
    audience: "Individuals tracking fitness, athletes, students and health-curious readers",
    input: "your height, weight, age, date or vitals as prompted in the form",
    output: "a calculated value, category label and short interpretation you can copy",
    companions: "BMI, BMR and TDEE Calculators",
    limits: "No credit cost and no per-day cap — health calculators run 100% in your browser, so nothing you enter is transmitted or stored.",
    commercial: "These calculators are for educational and informational purposes only and are not a substitute for professional medical advice, diagnosis or treatment.",
    extraFaq: (t) => ({
      q: `Can I rely on ${t.name} for medical decisions?`,
      a: `No. ${t.name} implements a widely published formula and is provided for general education. Always consult a qualified physician or health provider before making changes to diet, exercise, medication or a treatment plan.`,
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
    longDescription: "PDF compression is not one-size-fits-all: a scanned image-heavy PDF needs a different approach than a text-heavy form document. This tool analyzes the PDF structure first — counting vector objects, image resolutions, and embedded fonts — then applies the appropriate optimization path. Image-heavy PDFs go through downsampling and recompression; text-heavy PDFs keep text as text and remove redundant font subsets.\n\nThe result is a smaller file that remains searchable and selectable, rather than a flat rasterized blob. Common use cases include reducing file size for email attachments, meeting upload limits on government portals, and speeding up document previews on mobile.\n\nEverything runs in your browser, so sensitive contracts, medical records and internal reports never leave your device — pair it with PDF Split or PDF Unlock when you need to prep a document before compressing.",
    howToUse: [
      "Click the file picker and select the PDF you want to compress.",
      "Choose a compression preset — Low keeps images crisp, High squeezes hardest.",
      "Review the before/after size and click Download to save the compressed PDF.",
    ],
    faqs: [
      { q: "Will compression make my PDF unreadable?", a: "The default preset keeps text selectable and images legible. If you choose High compression, images may become noticeably pixelated. Preview the output before downloading." },
      { q: "Why is my compressed PDF still large?", a: "Scanned PDFs are often single large images per page. Compression helps, but the fundamental limit is image resolution. For best results, OCR the PDF first to separate text from images, then compress." },
      { q: "Does compression remove the password?", a: "No. If the PDF is protected, unlock it first using the PDF Unlock tool." },
      { q: "Can I compress multiple PDFs at once?", a: "Batch compression is coming soon. Currently, compress one PDF at a time." },
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
    longDescription: "A broken JSON config that reaches production is one of the most avoidable outages in modern web development. Unlike generic formatters, this tool validates against the ECMAScript standard while preserving your original data types — numbers stay numbers, booleans stay booleans, and nested objects maintain their structure.\n\nIt also flags common pitfalls: trailing commas, unquoted keys in JS mode, mixed quote styles, and deeply nested objects that exceed safe character limits. Use it before committing .json configs, API payloads, or environment variables.\n\nPair it with our JSON Validator to catch both syntax errors and schema violations before they hit CI/CD, and with JWT Decoder or Base64 when the JSON is wrapped inside an auth token or encoded field.",
    howToUse: [
      "Paste your raw JSON into the input box.",
      "Click Beautify to pretty-print, or Minify to collapse to a single line.",
      "Copy the result with the Copy button, or download it as a .json file.",
    ],
    faqs: [
      { q: "Does this tool handle JSON with comments or trailing commas?", a: "Yes. If your payload is JSON5 or includes comments, the formatter can auto-clean it to valid JSON. Trailing commas are removed automatically unless you explicitly enable JSON5 mode." },
      { q: "Will pretty-printing change my string contents?", a: "No. Only whitespace outside of string values changes. Numbers, booleans, nulls, and string content are preserved byte-for-byte during round-trip parsing." },
      { q: "Can I sort keys alphabetically?", a: "Yes. Use the Sort Keys option to reorder object keys alphabetically, which improves diff readability in version control." },
      { q: "What's the difference between this and Prettier?", a: "Prettier is a code formatter for source files; this tool focuses on data payload validation and preservation of data types, making it safer for API debugging and config files." },
      { q: "Does it work with large JSON files?", a: "Files up to 10 MB parse smoothly in-browser. For larger payloads, consider splitting or using the streaming JSON extractor." },
    ],
  },
  "base64": {
    longDescription: "Base64 encoding often gets misused as encryption or used for the wrong binary types. This tool handles both text-to-Base64 and Base64-to-text conversions with proper UTF-8 handling, meaning emoji, Chinese characters, and Vietnamese diacritics round-trip correctly — something naive implementations break by assuming ASCII-only input.\n\nIt also supports Base64 URL-safe encoding, which replaces + and / with - and _ for use in JWTs, data URLs, and URL parameters.\n\nCommon use cases include embedding SVG icons in CSS, constructing data: URLs for images, and decoding Base64 payloads from API logs or email attachments. Pair it with JWT Decoder for auth tokens and JSON Formatter for decoded payloads.",
    howToUse: [
      "Paste your text (to encode) or Base64 string (to decode) into the input box.",
      "Choose Encode or Decode — UTF-8 is handled automatically.",
      "Copy the result or download it as a text file.",
    ],
    faqs: [
      { q: "Is Base64 encryption?", a: "No. Base64 is an encoding format, not encryption. Anyone can decode it. For sensitive data, encrypt first using AES or RSA, then encode if needed." },
      { q: "What's the difference between standard and URL-safe Base64?", a: "Standard Base64 uses + and /; URL-safe replaces them with - and _. Use URL-safe for URLs, JWTs, and filenames." },
      { q: "Can I encode images with this tool?", a: "This tool encodes text. For images, use the Image to Base64 tool which accepts file uploads and outputs data URLs." },
      { q: "Why does my decoded text have weird characters?", a: "Most likely the original was not UTF-8. Try selecting UTF-16 or ISO-8859-1 as input encoding if you know the source format." },
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
    longDescription: "Password strength depends on two factors: entropy from the random source and length from the user. This tool uses crypto.getRandomValues() instead of Math.random() because the latter is predictable under certain browser states.\n\nEach generated password is derived from cryptographically secure random bytes, then filtered for ambiguous characters if requested — confusing l and 1, O and 0. Typical outputs exceed 60 bits of entropy at 16 characters, which meets NIST SP 800-63B guidelines for memorized secrets.\n\nUse it for API keys, database passwords, and temporary access codes, but pair generated passwords with a password manager for long-term storage.",
    howToUse: [
      "Set the desired length (12–64 characters recommended).",
      "Toggle character classes — uppercase, digits, symbols — to match the site's requirements.",
      "Click Generate and copy the password directly into your password manager.",
    ],
    faqs: [
      { q: "Is this password truly random?", a: "Yes. It uses the Web Crypto API (crypto.getRandomValues), which is cryptographically secure and not pseudo-random like Math.random." },
      { q: "Should I avoid ambiguous characters?", a: "Enabling \"Exclude ambiguous characters\" removes l, 1, O, 0, I, and | to prevent misreading. This slightly reduces entropy but improves usability." },
      { q: "What length is secure enough?", a: "12+ characters for general use, 16+ for admin or root accounts. This tool's default is 16 characters." },
      { q: "Can I generate pronounceable passwords?", a: "This version generates random strings only. For memorable passphrases, use a diceware-style word list in future updates." },
    ],
  },
  "image-resizer": {
    longDescription: "Resizing images for the web is not just about changing width and height — it is about preserving visual quality while reducing file size for faster page loads. This tool uses the Canvas API to resample images with bilinear interpolation, maintaining aspect ratio by default and supporting exact pixel dimensions, percentage scaling, and preset sizes for common use cases: social media posts (1080×1080), blog thumbnails (1200×630), and favicons.\n\nExport options include PNG for lossless graphics, JPG for photos with adjustable quality, and WebP for modern browsers seeking better compression ratios than both PNG and JPG.\n\nEverything runs on your device, so unreleased product shots and client work under NDA stay private. Pair it with Image Compressor and Remove Background for a full browser-based asset pipeline.",
    howToUse: [
      "Upload a JPG, PNG, WebP or GIF (up to 10 MB).",
      "Enter the target width or height — the other dimension follows automatically to preserve aspect ratio.",
      "Choose the output format and click Download.",
    ],
    faqs: [
      { q: "Will resizing reduce image quality?", a: "Scaling up always degrades quality. Scaling down preserves quality better if the original is at least 2× the target size. For best results, resize from the original source file, not from an already-compressed version." },
      { q: "What's the difference between JPG, PNG, and WebP output?", a: "PNG is lossless and ideal for diagrams or screenshots. JPG is lossy and better for photos. WebP typically yields 25–35% smaller files than JPG at the same perceived quality." },
      { q: "Can I resize multiple images at once?", a: "The current version processes one image at a time. Batch resizing is planned in a future update." },
      { q: "Does the tool preserve EXIF data?", a: "No. EXIF metadata is stripped during canvas processing for privacy. Use the EXIF Viewer tool if you need to inspect metadata before resizing." },
    ],
  },
  "image-compressor": {
    longDescription: "Image compression for the web is a trade-off between file size and perceptual quality, and the right balance depends on where the image will be used. This tool quantizes JPG and WebP images using perceptually-weighted chroma subsampling, which preserves skin tones and edges better than uniform quality reduction. For PNGs, it applies indexed-color quantization and optional Delta filtering.\n\nThe quality slider gives you real-time feedback on file size change, so you can visually compare compression artifacts before downloading.\n\nTypical use cases include reducing hero image weight for Core Web Vitals, preparing email attachments under size limits, and optimizing product photos for e-commerce.",
    howToUse: [
      "Upload a JPG, PNG or WebP image.",
      "Drag the quality slider and preview the before/after file size in real time.",
      "Download the compressed image — output format matches the input by default.",
    ],
    faqs: [
      { q: "How much can I compress without visible quality loss?", a: "For JPG, 70–80% quality is usually indistinguishable from original on standard displays. For PNG, use the \"Lossless PNG\" preset first; only enable lossy mode if file size is critical." },
      { q: "Does compression work on animated images?", a: "Not in this version. Animated GIF and WebP require frame-by-frame processing, which is planned for a later release." },
      { q: "Will compression remove transparency?", a: "PNG transparency is preserved. For JPG output, transparent areas are filled with white or a configurable background color because JPG does not support alpha channels." },
      { q: "Where is the best compression point for Core Web Vitals?", a: "Aim for images under 200 KB on mobile. Use WebP at 75% quality for most cases. Reserve PNG for text-heavy or logo graphics." },
    ],
  },
  "pdf-merge": {
    longDescription: "Merging PDFs client-side avoids upload delays and keeps sensitive documents off third-party servers, but browser-based merging has limits: page count, image resolution, and font embedding must be handled carefully to avoid corrupting the output. This tool uses pdf-lib to concatenate page streams while preserving embedded fonts, images, and annotations.\n\nIt supports drag-and-drop reordering before merge, so you can preview page thumbnails and swap sequence without re-uploading files.\n\nTypical use cases include combining split contract chapters, assembling multi-page invoices, and merging scanned documents into a single submission package.",
    howToUse: [
      "Drop in two or more PDF files from your device.",
      "Reorder the files by dragging them into the sequence you want.",
      "Click Merge and download the combined PDF.",
    ],
    faqs: [
      { q: "Does merging preserve form fields and annotations?", a: "Yes. Text fields, checkboxes, and comment annotations are carried into the merged document. Some interactive widgets may lose focus state after merge, which is a limitation of PDF page concatenation." },
      { q: "What's the maximum number of files I can merge?", a: "Up to 10 files or 100 pages in a single merge in this version. For larger batches, merge in stages." },
      { q: "Can I merge password-protected PDFs?", a: "You must unlock them first using the PDF Unlock tool, then re-merge." },
      { q: "Will the merged PDF be larger than the originals?", a: "Often slightly larger due to shared resource deduplication overhead, but usually within 5–10% of the total combined size." },
    ],
  },
  "pdf-split": {
    longDescription: "Splitting a large PDF into smaller documents is essential for email attachments, document management systems, and selective sharing. Unlike naive extractors that rely on page-range strings, this tool lets you choose pages visually or by number ranges, then exports each segment as an independent PDF with intact fonts and images.\n\nIt also supports batch extraction: extract every page into individual files in a single operation.\n\nThis is particularly useful for breaking up scanned contracts, distributing seminar slides, or separating invoices from bulk statements.",
    howToUse: [
      "Upload a PDF file from your device.",
      "Enter a page range (e.g. 1-3, 5, 8-10) or choose Split all pages.",
      "Click Split and download the resulting PDFs — one file per segment.",
    ],
    faqs: [
      { q: "Can I extract non-consecutive pages?", a: "Yes. Use the page-range syntax: 1-3, 5, 8-10. The tool parses multiple ranges in a single request." },
      { q: "Will splitting reduce file quality?", a: "No. Split pages are bit-for-bit identical to the source, so text sharpness, image resolution, and embedded fonts are preserved exactly." },
      { q: "Can I split all pages into separate files automatically?", a: "Yes. Select \"Split all pages\" to generate one PDF per page. For very large documents, this may take longer due to repeated stream copying." },
      { q: "Does splitting preserve bookmarks or outlines?", a: "Bookmarks tied to removed pages are removed. Bookmarks pointing to retained pages are preserved with updated page references." },
    ],
  },
  "word-counter": {
    longDescription: "Word count alone is misleading for modern content strategy. This tool breaks text into distinct metrics: total words, unique words, character count with and without spaces, sentence count, paragraph count, and estimated reading time based on 200–250 words per minute.\n\nIt also flags potential issues like excessive passive voice, long sentences over 30 words, and repeated words that could indicate weak phrasing.\n\nWriters use it for blog post length targets, editors use it for consistency checks, and SEO specialists use it to ensure meta descriptions and title tags fall within SERP display limits.",
    howToUse: [
      "Paste or type your text into the input box.",
      "Read the live metrics — words, characters, sentences, paragraphs and reading time.",
      "Copy the stats or the text back into your editor.",
    ],
    faqs: [
      { q: "How is reading time calculated?", a: "Based on average adult reading speed of 238 words per minute. For technical content, actual time will be higher." },
      { q: "Does it count hyphenated words as one or two?", a: "Hyphenated words like \"well-known\" count as one word. Compound words without hyphens count per space-separated segment." },
      { q: "Can I paste formatted text with HTML tags?", a: "Yes. The tool strips HTML and counts only visible text content." },
      { q: "Does it support Chinese or Japanese text?", a: "CJK characters are counted individually rather than by whitespace, which is standard for those languages." },
    ],
  },
  "case-converter": {
    longDescription: "Naming conventions are not just style preferences — they are communication protocols between developers. This tool converts text between uppercase, lowercase, title case, camelCase, PascalCase, snake_case, kebab-case, and dot.case, but it also handles edge cases that break naive converters: consecutive special characters, leading/trailing separators, mixed-case acronyms, and numbers embedded within words.\n\nUse it to normalize API endpoint strings, database column names, environment variable keys, or CSS class names.\n\nPair it with the Slug Generator when you need URL-safe output instead of programming-friendly output.",
    howToUse: [
      "Paste any text — a single string or a list, one per line.",
      "Every case variant is generated instantly in the grid below.",
      "Click Copy on the variant you want, or Copy all to grab every format at once.",
    ],
    faqs: [
      { q: "What's the difference between camelCase and PascalCase?", a: "camelCase starts with a lowercase letter (camelCase), while PascalCase starts with uppercase (PascalCase). Use camelCase for variables, PascalCase for class names in some languages." },
      { q: "Does it preserve numbers inside words?", a: "Yes. item2Name stays item2Name in camelCase and item_2_name in snake_case." },
      { q: "What is dot.case?", a: "Dot-separated lowercase: dot.case. Useful for CSS class names or configuration keys." },
      { q: "Can I convert a whole list at once?", a: "Paste each string on a new line; the converter processes all lines and preserves line breaks in the output." },
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