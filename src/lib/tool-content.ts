import type { Tool } from "./tools-data";

export type Faq = { q: string; a: string };
export type ToolContent = {
  /** SEO title category label, e.g. "PDF Tool" */
  categoryLabel: string;
  /** Meta description for SEO (150-160 chars) */
  metaDescription?: string;
  /** 400-600 word body copy shown below the tool UI */
  longDescription: string;
  /** Specific real-world scenarios for the tool */
  useCases?: string[];
  /** Step-by-step instructions (5-7 steps) */
  howToUse: string[];
  faqs: Faq[];
  /** Manually curated related tool slugs */
  relatedTools?: string[];
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
  education: "Education Tool",
  units: "Unit Converter",
  fun: "Random & Fun Tool",
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
  education: {
    audience: "High-school, undergraduate and graduate students, plus teachers and tutors",
    input: "your courses, grades, essay text or study preferences",
    output: "a calculated grade, formatted citation, essay report or focus schedule",
    companions: "GPA Calculator, Essay Word Count and Study Timer",
    limits: "No credit cost and no per-day cap — every education tool runs 100% in your browser, so grades, essays and citation data stay on your device.",
    commercial: "Yes — tutors, teachers and course creators can use the outputs in paid lessons, worksheets and reports without attribution.",
    extraFaq: (t) => ({
      q: `Does ${t.name} store my grades or essay text?`,
      a: `No. ${t.name} runs entirely in your browser. Anything that persists between visits (GPA history, focus time) is kept in your browser's localStorage and never uploaded to Nexatools.`,
    }),
  },
  "real-estate": {
    audience: "Home buyers, renters, real estate agents and personal finance planners",
    input: "the home price, income, rate and term figures for your scenario",
    output: "a monthly payment, affordability range or comparison chart you can save",
    companions: "Mortgage Calculator, Rent vs Buy and Loan Amortization",
    limits: "No credit cost and no per-day cap — every real estate calculator runs 100% in your browser, so income, price and loan details never leave your device.",
    commercial: "Yes — agents, lenders and financial coaches can use the outputs in client conversations. Results are estimates, not a loan offer or financial advice.",
    extraFaq: (t) => ({
      q: `Does ${t.name} account for taxes, insurance and HOA?`,
      a: `Where the field is offered, ${t.name} includes property tax, home insurance, HOA dues and PMI (when down payment is under 20%). Local tax rates vary — use the Property Tax Calculator for a city-level estimate.`,
    }),
  },
  legal: {
    audience: "Founders, bloggers, freelancers and small business owners",
    input: "your business details, jurisdiction and the sections that apply to you",
    output: "a ready-to-publish policy, disclosure or PDF invoice you can copy or download",
    companions: "Privacy Policy Generator, Terms of Service Generator and Invoice Generator",
    limits: "No credit cost and no per-day cap — every legal & business generator runs 100% in your browser, so business details never leave your device.",
    commercial: "Yes — the generated text and documents are yours to publish, send to clients or use in commercial products. Templates are provided as-is and are not a substitute for legal advice.",
    extraFaq: (t) => ({
      q: `Is ${t.name} a substitute for a lawyer?`,
      a: `No. ${t.name} produces a solid starting template based on common industry practice, but every jurisdiction and business is different. For binding contracts, disputes or regulated industries (health, finance, children's services), have a qualified attorney review the document before publishing.`,
    }),
  },
  units: {
    audience: "Engineers, scientists, students, travellers and remote teams",
    input: "a numeric value and the source and target units",
    output: "an exact converted value with the formula and a real-world comparison",
    companions: "Length Converter, Weight Converter and Time Zone Converter",
    limits: "No credit cost and no per-day cap — every unit converter runs 100% in your browser using exact SI conversion factors, so numbers never leave your device.",
    commercial: "Yes — engineers, teachers and content creators can use the converted values and formulas in reports, worksheets and commercial products without attribution.",
    extraFaq: (t) => ({
      q: `How accurate is ${t.name}?`,
      a: `${t.name} uses the exact SI/NIST conversion factors (for example 1 inch = 25.4 mm and 1 pound = 0.45359237 kg), so results are precise to JavaScript's 15–17 significant digits — well beyond any real-world measurement.`,
    }),
  },
  fun: {
    audience: "Gamers, teachers, streamers, TTRPG groups and anyone who needs a quick random pick",
    input: "your parameters — dice count, coin flips, number range, name origin or text",
    output: "a cryptographically random result plus a visual preview and optional history",
    companions: "Dice Roller, Coin Flip, Random Number Generator and QR Code Generator",
    limits: "No credit cost and no per-day cap — every random & fun tool runs 100% in your browser using the Web Crypto API, so nothing you enter or generate is transmitted or stored.",
    commercial: "Yes — the generated names, numbers, QR codes and ASCII art are yours to use in streams, videos, games and commercial projects without attribution.",
    extraFaq: (t) => ({
      q: `Is the randomness in ${t.name} truly random?`,
      a: `${t.name} uses the browser's Web Crypto API (crypto.getRandomValues) which provides cryptographically strong pseudo-random numbers — the same source used for password and key generation. This is dramatically better than Math.random() and suitable for games, giveaways and draws.`,
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

  const p1 = `${tool.name} is a professional-grade online tool designed to help you ${action} with precision and ease. Whether you are a developer, business owner, or student, this utility streamlines your workflow by taking ${c.input} and returning ${c.output} in seconds. No more complex software installations or manual calculations.`;

  const p2 = `### Key Features of ${tool.name}:
- **Instant Processing**: Get results in real-time as you type or upload.
- **Privacy First**: ${runtime}, ensuring your sensitive data stays secure.
- **Mobile Friendly**: Access the full power of ${tool.name} on any device, from desktop to smartphone.
- **Commercial Use**: Every result is yours to use in professional, client, or personal projects.`;

  const p3 = `### How it works:
Behind the scenes, ${tool.name} uses advanced algorithms to process your input. For developer tools, we use standard libraries to ensure compliance with modern protocols. For calculators, we implement the latest formulas (like the 2024 tax rules or financial interest equations) to give you accurate results every time.`;

  const p4 = `### Why this tool matters:
In today's fast-paced environment, ${c.audience} need tools that just work. ${tool.name} eliminates the friction of switching between heavy applications. For example, a developer can use it to quickly debug a payload before a stand-up meeting, or a small business owner can calculate margins on the fly while negotiating with a supplier.

${tool.name} is one of 130+ tools in the Nexatools directory. Pair it with ${c.companions} to build a full ${c.audience.toLowerCase().split(",")[0]} toolkit that lives in a single tab. Sign in for a free account to save history and favourites, or upgrade to Pro for API access and batch processing.`;

  return [p1, p2, p3, p4].join("\n\n");
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
    metaDescription: "Compress PDF files online for free. Reduce PDF size in-browser without uploading. Keep text selectable. High-quality compression for any document.",
    longDescription: `PDF compression is not one-size-fits-all: a scanned image-heavy PDF needs a different approach than a text-heavy form document. This tool analyzes the PDF structure first — counting vector objects, image resolutions, and embedded fonts — then applies the appropriate optimization path. Image-heavy PDFs go through downsampling and recompression; text-heavy PDFs keep text as text and remove redundant font subsets.

The result is a smaller file that remains searchable and selectable, rather than a flat rasterized blob. Common use cases include reducing file size for email attachments, meeting upload limits on government portals, and speeding up document previews on mobile.

Everything runs in your browser, so sensitive contracts, medical records and internal reports never leave your device — pair it with PDF Split or PDF Unlock when you need to prep a document before compressing.`,
    useCases: [
      "For email: Send large reports as smaller attachments without losing clarity.",
      "For portals: Meet strict upload file-size limits on government or bank websites.",
      "For mobile: Speed up mobile previews of long manuals and research papers.",
    ],
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
    relatedTools: ["pdf-merge", "pdf-split", "pdf-unlock"],
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
    metaDescription: "Format and validate JSON online for free. Beautify, minify, and fix JSON syntax errors instantly in your browser. Secure and private.",
    longDescription: `A broken JSON config that reaches production is one of the most avoidable outages in modern web development. Unlike generic formatters, this tool validates against the ECMAScript standard while preserving your original data types — numbers stay numbers, booleans stay booleans, and nested objects maintain their structure.

It also flags common pitfalls: trailing commas, unquoted keys in JS mode, mixed quote styles, and deeply nested objects that exceed safe character limits. Use it before committing .json configs, API payloads, or environment variables.

Pair it with our JSON Validator to catch both syntax errors and schema violations before they hit CI/CD, and with JWT Decoder or Base64 when the JSON is wrapped inside an auth token or encoded field.`,
    useCases: [
      "For developers: Beautify messy API responses for easier debugging and readability.",
      "For DevOps: Minify configuration files to reduce payload size in production environments.",
      "For QA: Validate JSON syntax and catch trailing commas or missing quotes before testing.",
    ],
    howToUse: [
      "Paste your raw JSON into the input box or upload a .json file.",
      "Click 'Beautify' to pretty-print or 'Minify' to compress the text.",
      "Fix any highlighted syntax errors reported by the real-time validator.",
      "Use 'Sort Keys' if you need a deterministic object structure for git diffs.",
      "Copy the result or download it as a new JSON file.",
    ],
    faqs: [
      { q: "Does this tool handle JSON with comments or trailing commas?", a: "Yes. If your payload is JSON5 or includes comments, the formatter can auto-clean it to valid JSON. Trailing commas are removed automatically unless you explicitly enable JSON5 mode." },
      { q: "Will pretty-printing change my string contents?", a: "No. Only whitespace outside of string values changes. Numbers, booleans, nulls, and string content are preserved byte-for-byte during round-trip parsing." },
      { q: "Can I sort keys alphabetically?", a: "Yes. Use the Sort Keys option to reorder object keys alphabetically, which improves diff readability in version control." },
      { q: "What's the difference between this and Prettier?", a: "Prettier is a code formatter for source files; this tool focuses on data payload validation and preservation of data types, making it safer for API debugging and config files." },
      { q: "Does it work with large JSON files?", a: "Files up to 10 MB parse smoothly in-browser. For larger payloads, consider splitting or using the streaming JSON extractor." },
    ],
    relatedTools: ["csv-to-json", "xml-to-json", "jwt-decoder"],
  },
  "base64": {
    metaDescription: "Encode and decode Base64 text online for free. Support for UTF-8 and URL-safe formats. Secure, fast, and private in-browser tool.",
    longDescription: `Base64 encoding is an essential method for converting binary data into an ASCII string format, allowing it to be safely transmitted over media that only support text. However, many tools fail when dealing with non-ASCII characters. Our Base64 tool handles both text-to-Base64 and Base64-to-text conversions with full UTF-8 support, ensuring that emojis, international characters, and specialized symbols round-trip correctly every time.

Beyond standard encoding, we support Base64 URL-safe mode, which is critical for developers building JWTs, OAuth implementations, or embedding data in URL parameters without needing additional URL encoding. 

Use this tool for embedding small assets like SVGs into CSS, creating data URLs for images, or inspecting encoded payloads from server logs and email headers. Everything runs client-side, so your sensitive API tokens and encoded secrets never leave your browser.`,
    useCases: [
      "For developers: Decode Base64-encoded strings from logs or API responses instantly.",
      "For designers: Convert small SVG icons to Data URLs for embedding directly into CSS files.",
      "For security researchers: Inspect encoded payloads in JWTs or web requests safely.",
    ],
    howToUse: [
      "Paste the text or Base64 string you want to convert into the input box.",
      "Choose 'Encode' to generate Base64 or 'Decode' to get the original text back.",
      "Toggle 'URL Safe' if you need the result to be compatible with URL paths.",
      "Copy the output to your clipboard for use in your code or documentation.",
    ],
    faqs: [
      { q: "Is Base64 a form of encryption?", a: "No. Base64 is an encoding scheme, not encryption. Anyone who sees a Base64 string can decode it instantly. Never use it to secure sensitive information without actual encryption." },
      { q: "Does this tool support emojis and special characters?", a: "Yes. We use UTF-8 encoding/decoding, which ensures that all Unicode characters, including emojis and non-Latin scripts, are preserved correctly." },
      { q: "What is 'URL-safe' Base64?", a: "Standard Base64 uses '+' and '/' characters, which have special meanings in URLs. URL-safe Base64 replaces them with '-' and '_' and often omits the '=' padding." },
      { q: "Can I encode large files?", a: "This tool is optimized for text and small assets (up to 5 MB). For very large files, a dedicated binary encoder is recommended to avoid browser memory issues." },
    ],
    relatedTools: ["jwt-decoder", "json-formatter", "url-encoder"],
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
  "word-counter": {
    metaDescription: "Count words, characters, and reading time online for free. Track word frequency and density for SEO optimization. Real-time text analysis.",
    longDescription: `Precision in writing starts with understanding the scale and structure of your content. The Word Counter is a comprehensive text analysis engine designed for content creators, students, and SEO professionals. Unlike basic word counts in word processors, this tool provides a real-time breakdown of character counts (with and without spaces), sentence counts, and estimated reading time at different speeds.

For SEO enthusiasts, we go a step further by calculating keyword frequency and density. This allows you to identify if you're overusing certain terms or missing out on key phrases needed for search engine ranking. The tool also provides insights into text readability and average word length, helping you tailor your voice to your target audience.

Whether you're writing a meta description within a 160-character limit, drafting a blog post to meet a 2,000-word goal, or analyzing a competitors' content, this utility provides the data you need instantly. Everything happens in your browser, keeping your drafts completely private and secure.`,
    useCases: [
      "For copywriters: Ensure your social media captions and meta descriptions fit within character limits.",
      "For SEO specialists: Analyze keyword density to avoid keyword stuffing and optimize for ranking.",
      "For students: Track essay length to meet specific word count requirements for assignments.",
      "For public speakers: Estimate speech duration based on average speaking speeds.",
    ],
    howToUse: [
      "Paste your text into the analysis box or start typing directly.",
      "Review the word, character, and sentence counts displayed at the top.",
      "Check the 'Keyword Density' panel to see your most frequently used terms.",
      "Use the 'Reading Time' estimate to gauge the length of your content for users.",
      "Click 'Clear' to start fresh with a new piece of text.",
    ],
    faqs: [
      { q: "How is reading time calculated?", a: "We assume an average reading speed of 225 words per minute. For technical content, you may want to adjust your estimate downward to around 180 words per minute." },
      { q: "Does it count spaces as characters?", a: "Yes. The tool provides two character counts: one including spaces and one excluding them, so you can meet any specific requirement." },
      { q: "Is keyword density important for SEO?", a: "Yes. While there's no 'perfect' percentage, keeping your primary keywords between 1-2% density is generally considered safe and effective for modern SEO." },
      { q: "Can I analyze text in different languages?", a: "Absolutely. Our word counter works by identifying whitespace and punctuation boundaries, which is compatible with most Latin-based and many non-Latin languages." },
    ],
    relatedTools: ["case-converter", "lorem-ipsum-generator", "slug-generator"],
  },
  "password-generator": {
    metaDescription: "Generate secure, random passwords online for free. Cryptographically strong, customizable, and 100% private in-browser generator.",
    longDescription: `In an era of increasing data breaches, a weak password is the single largest security risk for any user. Our Password Generator uses the Web Crypto API (crypto.getRandomValues()) to ensure that every character is chosen using a cryptographically strong random source, making them immune to the predictability issues of standard pseudo-random number generators.

The tool provides granular control over password complexity. You can toggle uppercase letters, lowercase letters, numbers, and special symbols to meet the specific requirements of any website. We also include a 'Exclude Ambiguous Characters' option, which removes confusing characters like 'l' and '1', or 'O' and '0', ensuring you never misread a generated secret.

Use these passwords for new accounts, API keys, or securing local database instances. Because the generation happens entirely in your browser, the passwords never traverse the internet and are never logged on our servers. For maximum security, we recommend using these generated passwords in conjunction with a dedicated password manager.`,
    useCases: [
      "For new accounts: Generate unique, complex passwords for every website you visit.",
      "For developers: Create high-entropy API keys and secret tokens for your applications.",
      "For IT admins: Generate temporary, secure passwords for user onboarding.",
      "For home users: Secure your Wi-Fi router and IoT devices with strong, random credentials.",
    ],
    howToUse: [
      "Select the desired password length (16+ characters is recommended for high security).",
      "Toggle the character types (Uppercase, Numbers, Symbols) you wish to include.",
      "Enable 'Exclude Ambiguous' if you plan to type the password manually.",
      "Click 'Generate' to create a new unique password string.",
      "Click the 'Copy' button to save it to your clipboard for instant use.",
    ],
    faqs: [
      { q: "Is this password truly random?", a: "Yes. It uses the Web Crypto API (crypto.getRandomValues), which is cryptographically secure and not pseudo-random like Math.random." },
      { q: "Should I avoid ambiguous characters?", a: "Enabling \"Exclude ambiguous characters\" removes l, 1, O, 0, I, and | to prevent misreading. This slightly reduces entropy but improves usability." },
      { q: "What length is secure enough?", a: "12+ characters for general use, 16+ for admin or root accounts. This tool's default is 16 characters." },
      { q: "Can I generate pronounceable passwords?", a: "This version generates random strings only. For memorable passphrases, use a diceware-style word list in future updates." },
    ],
    relatedTools: ["jwt-decoder", "base64", "hash-generator"],
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
    metaDescription: "Merge PDF files online for free. Combine multiple PDFs into one document securely in your browser. Reorder pages and files instantly.",
    longDescription: `Combining multiple documents into a single, cohesive PDF is a frequent requirement for legal submissions, academic projects, and business reporting. However, uploading sensitive contracts to cloud-based mergers poses a significant privacy risk. Our PDF Merge tool solves this by performing the entire operation client-side using WebAssembly and the pdf-lib library. 

The tool doesn't just stick files together; it intelligently merges page streams while preserving embedded fonts, high-resolution images, and interactive annotations. You can drag and drop files to reorder them before merging, ensuring your table of contents or cover page is exactly where it needs to be.

Whether you're assembling a multi-part contract from different departments, combining scanned receipts for an expense report, or merging chapters for an ebook, this tool delivers professional results without the wait time of traditional server-side processing. Your documents never leave your device, ensuring total privacy.`,
    useCases: [
      "For legal professionals: Combine multiple contract chapters and exhibits into a single submission file.",
      "For students: Merge individual assignment pages and research citations into one final project PDF.",
      "For HR managers: Compile employee onboarding documents, IDs, and signed forms into a single digital folder.",
      "For business owners: Aggregate monthly invoices and project reports into one comprehensive client update.",
    ],
    howToUse: [
      "Select two or more PDF files from your computer or mobile device.",
      "Drag the file thumbnails to arrange them in your preferred reading order.",
      "Click the 'Merge' button to initiate the local concatenation process.",
      "Review the combined file size and download the new PDF instantly.",
      "Clear the queue to start a new merge operation immediately.",
    ],
    faqs: [
      { q: "Does merging preserve form fields and annotations?", a: "Yes. Text fields, checkboxes, and comment annotations are carried into the merged document. Some interactive widgets may lose focus state after merge, which is a limitation of PDF page concatenation." },
      { q: "What's the maximum number of files I can merge?", a: "Up to 10 files or 100 pages in a single merge in this version. For larger batches, merge in stages." },
      { q: "Can I merge password-protected PDFs?", a: "You must unlock them first using the PDF Unlock tool, then re-merge." },
      { q: "Will the merged PDF be larger than the originals?", a: "Often slightly larger due to shared resource deduplication overhead, but usually within 5–10% of the total combined size." },
    ],
    relatedTools: ["pdf-split", "pdf-compressor", "pdf-to-word"],
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
  "url-encoder": {
    longDescription: "URL encoding trips up more APIs than any other single formatting rule — a stray space, plus sign or unicode character is enough to break OAuth callbacks, tracking parameters and REST endpoints. This tool applies RFC 3986 percent-encoding correctly, treating reserved characters (: / ? # [ ] @ ! $ & ' ( ) * + , ; =) differently from unreserved ones, and preserving UTF-8 byte sequences for non-ASCII input.\n\nIt supports both encode and decode modes with a query-component switch so you can encode a single parameter value without escaping the & separators that make up the query string. That distinction matters when composing dynamic URLs in code, building Google Analytics campaign links, or debugging redirect chains that mangle non-Latin characters.\n\nPair it with the UTM Builder for campaign links and Base64 when a payload is Base64-then-URL wrapped.",
    howToUse: [
      "Paste the string or URL fragment you want to convert.",
      "Choose Encode or Decode — Query mode escapes = and & inside parameter values.",
      "Copy the result straight into your code, browser bar or config file.",
    ],
    faqs: [
      { q: "Why does + become %2B when I encode?", a: "In URL query strings, + is interpreted as a literal space. If your value legitimately contains a plus sign it must be encoded as %2B or receiving servers will read it back as a space." },
      { q: "Does the tool handle emoji and non-Latin characters?", a: "Yes. Input is first converted to UTF-8 bytes, then percent-encoded — so 東京 and 🎉 round-trip cleanly through encode → decode." },
      { q: "What is the difference between encodeURI and encodeURIComponent?", a: "encodeURI leaves reserved URL characters like : / ? # alone (for full URLs), while encodeURIComponent escapes them (for a single parameter value). Query mode in this tool mirrors encodeURIComponent." },
      { q: "Can I decode a whole log line at once?", a: "Yes. Paste the entire line and the decoder will replace every percent-encoded sequence in place, leaving the surrounding text untouched." },
    ],
  },
  "hash-generator": {
    longDescription: "A hash function turns any input into a fixed-length fingerprint — useful for file integrity checks, deduplication and password storage strategies, but easy to misuse. This tool computes MD5, SHA-1, SHA-256, SHA-384 and SHA-512 digests entirely in your browser using the Web Crypto API, so files and secrets are never uploaded.\n\nUse SHA-256 or SHA-512 for anything security-relevant: MD5 and SHA-1 remain in the UI because you still need to verify legacy artefacts (older Linux ISOs, git object IDs), but they are considered broken for authentication and should not protect new systems. For passwords, hash alone is not enough — you need a slow, salted KDF like bcrypt, scrypt or Argon2.\n\nEverything runs client-side, so it is safe to hash internal build artefacts, license keys and access tokens without exposing them to a third-party service.",
    howToUse: [
      "Paste text or drop a file into the input area.",
      "All five digests (MD5, SHA-1, SHA-256, SHA-384, SHA-512) are computed instantly.",
      "Copy any digest for verification, or download the checksum list as a .txt.",
    ],
    faqs: [
      { q: "Is MD5 still safe to use?", a: "Only for non-security purposes such as file deduplication or ETag generation. MD5 is not collision-resistant and must not be used for signatures, authentication or password storage." },
      { q: "Are my files uploaded when I hash them?", a: "No. Hashing runs in your browser via the SubtleCrypto API — the file bytes never leave your device." },
      { q: "Which algorithm should I use for a password?", a: "Do not use a raw hash. Passwords need a slow, salted key-derivation function like bcrypt, scrypt or Argon2. Use SHA-256 only inside a proper KDF or HMAC construction." },
      { q: "Why do my SHA-256 digests differ between tools?", a: "Different tools may add or trim trailing newlines, or use different text encodings. This tool hashes the exact UTF-8 bytes you paste, without adding a trailing newline." },
    ],
  },
  "uuid-generator": {
    longDescription: "UUIDs (also called GUIDs) give distributed systems a way to mint identifiers without a central authority. This tool generates v4 UUIDs using crypto.getRandomValues() — 122 bits of entropy, effectively zero collision risk for any real-world workload — and also supports v1 (timestamp + node) and v7 (timestamp-ordered, ideal for database indexes) for teams that need sortable IDs.\n\nBatch mode outputs up to 1,000 UUIDs at a time in your choice of formatting: standard (with hyphens), no-hyphen compact, Base64URL, uppercase, or wrapped as SQL VALUES for direct paste into a seed script.\n\nUse it to bootstrap primary keys, generate correlation IDs for logs, seed test fixtures, or mint idempotency keys for API calls. Everything runs in your browser — no telemetry, no server round-trip.",
    howToUse: [
      "Choose the UUID version (v4 is the safe default for most apps).",
      "Set how many UUIDs to generate and pick a formatting style.",
      "Click Generate, then Copy all — the batch is ready to paste into your database seed, config or test fixture.",
    ],
    faqs: [
      { q: "When should I pick v7 over v4?", a: "v7 encodes a millisecond timestamp in the leading bits, so IDs are naturally sorted by creation time. That improves B-tree index locality in databases like Postgres and MySQL. Use v4 when you need unpredictability instead of ordering." },
      { q: "Are v4 UUIDs really unique?", a: "The collision probability is astronomically small — roughly 1 in a billion after 103 trillion UUIDs. For every practical workload you can treat them as globally unique without coordination." },
      { q: "Can I use UUIDs as public URL slugs?", a: "You can, but they are long. For public URLs prefer short, human-readable slugs or shortIDs (like NanoID) and keep UUIDs as internal primary keys." },
      { q: "What is the difference between UUID and GUID?", a: "GUID is Microsoft's name for the same 128-bit identifier standard. The generated bytes are interchangeable — only the surrounding brace notation sometimes differs." },
    ],
  },
  "regex-tester": {
    longDescription: "Regex is a compact language for pattern matching, and it earns its reputation for being cryptic when you write it without a live sandbox. This tool runs your pattern against sample text in real time, highlighting every match and capture group inline, so you can iterate on a rule without a compile-test-fail loop.\n\nIt supports the JavaScript flavour (compatible with most modern languages), all standard flags (g, i, m, s, u, y), named capture groups and backreferences. A cheat-sheet panel documents the character classes and quantifiers you reach for most often, and a shareable link encodes both the pattern and the test string in the URL for pairing with a colleague.\n\nAll matching happens in your browser — logs, PII sample data and internal identifiers stay on your device.",
    howToUse: [
      "Type your regular expression into the pattern box and pick the flags you need.",
      "Paste sample text — matches and capture groups are highlighted instantly.",
      "Copy the pattern, the extracted matches or the shareable URL when you're happy with the result.",
    ],
    faqs: [
      { q: "Which regex flavour does this use?", a: "The JavaScript RegExp engine, which is close to PCRE. Lookbehinds, named groups (?<name>...) and unicode property escapes (\\p{...}) are supported in modern browsers." },
      { q: "Why does my pattern match too much?", a: "Quantifiers like * and + are greedy by default. Add ? (for example .*?) to make them non-greedy, or anchor the pattern with ^ and $ to constrain the match." },
      { q: "Can I test against multi-line input?", a: "Yes. Enable the m (multiline) flag so ^ and $ match line boundaries instead of the whole string." },
      { q: "Does the tool save my patterns?", a: "Only in your browser (via the shareable URL parameter). Nothing is stored on our servers." },
    ],
  },
  "csv-to-json": {
    longDescription: "CSV is the lingua franca of spreadsheets and exports, but every downstream API expects JSON. This converter parses CSV strictly — quoted fields, embedded commas, escaped quotes, CRLF line endings — and emits either an array of objects (using the header row as keys) or a plain array of arrays for schemaless data.\n\nType inference is opt-in: numbers, booleans and ISO dates are detected and converted automatically, or you can force every field to stay as strings when you need lossless round-tripping. A live preview shows the first ten records so you can catch header typos or off-by-one shifts before exporting the full file.\n\nEverything happens locally — perfect for internal exports, personal finance CSVs and one-off data-migration jobs that must never touch a third-party server.",
    howToUse: [
      "Paste your CSV or drop the .csv file into the upload area.",
      "Choose the delimiter (comma, semicolon or tab) and whether to treat the first row as headers.",
      "Copy the resulting JSON or download it as a .json file.",
    ],
    faqs: [
      { q: "Does the tool handle semicolon-separated files from European Excel?", a: "Yes. Set the delimiter to semicolon; the parser also handles the UTF-8 BOM that Excel prepends to exported files." },
      { q: "How are dates handled?", a: "By default dates are kept as strings. Enable Type inference to convert ISO 8601 date strings into JSON date-formatted strings; other formats stay as strings to avoid ambiguous coercions." },
      { q: "What happens to empty fields?", a: "Empty fields become an empty string by default, or null when Type inference is on. Rows with a mismatched column count are flagged in the preview so you can fix the source file." },
      { q: "Is there a file-size limit?", a: "In-browser parsing is comfortable up to about 20 MB of CSV. For larger exports, split the file first with a text editor or process it in your own script." },
    ],
  },
  "markdown-to-html": {
    longDescription: "This converter turns Markdown into clean, semantic HTML you can paste into a CMS, an email template or a component library. It supports CommonMark plus GitHub Flavoured Markdown extensions — tables, task lists, strikethrough, fenced code blocks with language hints and auto-linked URLs — and escapes raw HTML by default so pasting untrusted input can't produce a stored XSS.\n\nThe output is deliberately minimal: no inline styles, no wrapper div, no editor-specific class names. That makes it easy to drop into any design system, style with your own CSS or hand to a static-site generator.\n\nA live split-pane preview updates as you type, and a Copy HTML button gives you the raw markup for pasting into WordPress, Notion, Ghost or your own React components.",
    howToUse: [
      "Type or paste Markdown into the left pane.",
      "The right pane shows the rendered HTML preview in real time.",
      "Click Copy HTML for the source markup, or Copy rendered to grab the styled output.",
    ],
    faqs: [
      { q: "Which Markdown dialect is supported?", a: "CommonMark plus GitHub Flavoured Markdown extensions — tables, task lists, strikethrough, fenced code blocks and auto-linking." },
      { q: "Is raw HTML inside the Markdown preserved?", a: "By default it is escaped for safety. Enable the Allow HTML toggle only if the input comes from a trusted source." },
      { q: "Does the tool add CSS classes to the output?", a: "No. Output is semantic HTML with no inline styles and no custom classes, so you can style it with your own design system." },
      { q: "How do I get syntax highlighting on code blocks?", a: "The Markdown fenced-code language hint (```ts, ```python) is preserved as a class on the <code> element. Pair the output with a highlighter such as Prism or Shiki in your target page." },
    ],
  },
  "invoice-generator": {
    longDescription: "Freelancers and small businesses lose real money to missing tax fields, unclear payment terms and unprofessional PDFs. This invoice generator produces a clean, print-ready PDF with the fields accountants actually look for: seller and buyer details, unique invoice number, issue and due dates, itemised lines with quantity and unit price, tax rate, subtotal, tax amount and grand total.\n\nYou can upload a logo, pick from major currencies (USD, EUR, GBP, JPY, AUD, CAD, VND and more), add payment instructions or bank details, and mark an invoice as paid. Everything is saved as a local draft, so a browser refresh will not lose work in progress, and no invoice data is uploaded anywhere.\n\nUse it for one-off freelance projects, recurring retainers, deposit invoices and credit notes. Pair it with the Receipt Generator when a client asks for a formal paid receipt after payment clears.",
    howToUse: [
      "Fill in your business details, the client's details and the invoice number.",
      "Add line items with quantity, description and unit price — subtotal and tax update automatically.",
      "Preview the PDF and click Download to save it, or Copy invoice as a shareable link.",
    ],
    faqs: [
      { q: "Is the invoice legally valid?", a: "The output includes every field required by most jurisdictions (seller, buyer, invoice number, dates, itemised amounts and tax). Check your local tax authority for country-specific requirements like a VAT number or e-invoicing schema." },
      { q: "Can I save an invoice for later?", a: "Yes. Drafts are stored in your browser's local storage, so you can close the tab and return later. Nothing is uploaded to a server." },
      { q: "Which currencies are supported?", a: "USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, INR, VND, SGD, HKD and 20+ more — with correct symbol placement and locale-aware number formatting." },
      { q: "Can I add my logo?", a: "Yes. Upload a PNG or JPG logo (up to 2 MB) and it will be embedded in the PDF header. The image is resized locally in your browser." },
    ],
  },
  "mortgage-calculator": {
    longDescription: "A mortgage payment is more than principal and interest — property tax, homeowners insurance and PMI can add hundreds of dollars a month and change what you can actually afford. This calculator uses the standard amortization formula (M = P × r(1+r)^n / ((1+r)^n − 1)) and lets you layer in taxes, insurance and HOA fees to show a realistic monthly PITI figure.\n\nThe amortization schedule breaks down every payment into principal and interest, so you can see when you cross the tipping point where most of each payment starts building equity. Extra-payment scenarios show how one extra payment per year can shave years off a 30-year loan.\n\nEverything runs in your browser — no lead-capture form, no sales calls, and you can save scenarios as shareable URLs to compare offers with a partner or agent.",
    howToUse: [
      "Enter the home price, down payment, loan term and interest rate.",
      "Optionally add property tax, insurance, HOA and extra monthly payments.",
      "Review the monthly payment, total interest and full amortization schedule — download it as CSV if you need to share.",
    ],
    faqs: [
      { q: "Does this account for PMI?", a: "Yes. When your down payment is less than 20%, the calculator adds an estimated private mortgage insurance premium (typically 0.5–1.5% of the loan annually). You can override the default rate if your lender quoted a specific figure." },
      { q: "How much can extra payments really save?", a: "One extra monthly payment per year on a 30-year fixed loan typically shortens the term by 4–6 years and cuts total interest by 15–25%, depending on the rate. The scenario panel shows exact numbers for your inputs." },
      { q: "Is the amortization schedule accurate for adjustable-rate loans?", a: "The schedule assumes a fixed rate for the full term. For an ARM, calculate the initial period with the intro rate, then re-run the tool for the remaining balance at the adjusted rate." },
      { q: "Are my inputs saved or shared?", a: "No. Everything is calculated in your browser. Scenario links only encode the inputs in the URL you choose to copy." },
    ],
  },
  "qr-code-generator": {
    longDescription: "A QR code is a two-dimensional barcode that any modern phone camera can scan without a dedicated app. This generator produces standards-compliant QR codes for URLs, plain text, Wi-Fi credentials, vCards and calendar events, with configurable error-correction level (L, M, Q, H) so the code keeps scanning even when part of it is obscured by a logo, sticker or print smudge.\n\nYou can adjust size, foreground and background colours to match a brand — just keep the contrast ratio above 3:1 or the code will fail to scan on older phones. Add a centred logo (up to 25% of the code's area) at error-correction level H and the redundant data blocks compensate for the covered pixels.\n\nEverything runs locally, so you can safely encode private Wi-Fi passwords, staff-only URLs and internal document links without exposing them to a third party. Download as PNG or SVG for print, packaging, business cards and signage.",
    howToUse: [
      "Pick the content type (URL, text, Wi-Fi, vCard) and fill in the fields.",
      "Optionally tweak size, colours and add a centre logo — error-correction jumps to H automatically.",
      "Download the QR as a PNG or SVG, or copy the image directly to your clipboard.",
    ],
    faqs: [
      { q: "What error-correction level should I pick?", a: "Level M (15% recovery) is a safe default for screen and clean print. Bump to Q or H when you add a logo or when the code will be printed on packaging that may crease, scuff or reflect." },
      { q: "Are there character limits for a QR code?", a: "Yes. A single QR can hold up to roughly 4,296 alphanumeric characters at the largest size and lowest error-correction level. For URLs, keep them short — long URLs increase the density and reduce scan reliability at small print sizes." },
      { q: "Can I track scans of a QR code?", a: "The QR itself is static. To track scans, encode a URL that goes through a link shortener or campaign redirect you control (pair with the UTM Builder tool)." },
      { q: "Is the Wi-Fi QR safe to print for guests?", a: "Yes — it just embeds the SSID, encryption type and password in a standard string. Anyone with the QR can join the network, so treat the printout with the same care as the password itself." },
    ],
  },
  "image-converter": {
    longDescription: "Every format is a trade-off between file size, quality and browser support: JPG is best for photos, PNG for graphics with sharp edges or transparency, WebP for the best of both on modern browsers, and AVIF for the smallest files where support allows. This converter transcodes between JPG, PNG, WebP and AVIF entirely in your browser using the Canvas API and native codecs.\n\nQuality is adjustable for lossy formats (JPG, WebP, AVIF), and PNG conversion preserves transparency losslessly. A live before/after size readout lets you dial in the sweet spot between file weight and visual quality for Core Web Vitals.\n\nNo image is uploaded anywhere, which matters for unreleased product shots, personal photos and any asset under NDA. Pair with Image Compressor when you already have the right format but need to shave more kilobytes.",
    howToUse: [
      "Drop one or more images into the upload area.",
      "Pick the target format and (for lossy formats) a quality level.",
      "Preview the before/after size and download each converted image.",
    ],
    faqs: [
      { q: "Which format should I convert my photos to?", a: "WebP is the current sweet spot — 25–35% smaller than JPG at the same quality, and supported by every modern browser. Reach for AVIF when file size is critical and your audience is on up-to-date devices." },
      { q: "Does converting from JPG to PNG improve quality?", a: "No. PNG only preserves what is already in the source. Since JPG is lossy, the artefacts baked in during the original compression stay in the PNG — you just get a larger file." },
      { q: "Is transparency preserved?", a: "Yes when the target format supports it (PNG, WebP, AVIF). Converting to JPG fills transparent pixels with a solid colour (default white) because JPG has no alpha channel." },
      { q: "Are my images uploaded to a server?", a: "No. Conversion runs in your browser via the Canvas API — the file bytes never leave your device." },
    ],
  },
  "utm-builder": {
    metaDescription: "Build UTM tracking URLs online for free. Support for Google Analytics, Meta, and social campaigns. Consistent, URL-safe, and secure builder.",
    longDescription: `UTM parameters are the backbone of digital marketing attribution, allowing platforms like Google Analytics, Mixpanel, and Amplitude to identify exactly which campaign, ad, or link drove a user to your site. Without consistent UTM tagging, your marketing data becomes fragmented and unreliable. Our UTM Builder is designed to enforce consistency across your entire team.

The tool automatically normalizes your inputs, converting spaces to underscores and forcing lowercase by default to prevent 'Facebook' and 'facebook' from appearing as separate sources in your reports. It supports all five standard parameters — Source, Medium, Campaign, Term, and Content — providing real-time URL previews so you can catch encoding errors before you go live.

Whether you're managing complex paid social campaigns on Meta and TikTok, tracking clicks from email newsletters, or measuring the impact of influencer partnerships, this builder ensures every link is correctly formatted. For print and offline campaigns, you can instantly generate a QR code for your tagged URL directly within the interface.`,
    useCases: [
      "For marketers: Create consistent tracking links for multi-channel social media campaigns.",
      "For email managers: Tag newsletter links to see which content drives the most engagement.",
      "For business owners: Use UTM-tagged URLs in QR codes to track offline-to-online conversions.",
    ],
    howToUse: [
      "Paste the destination URL you want to track into the 'Website URL' field.",
      "Enter the Source (e.g., newsletter), Medium (e.g., email), and Campaign Name.",
      "Optionally add Term and Content fields for more granular A/B testing data.",
      "Review the generated URL and click 'Copy' to use it in your campaign.",
      "Generate a QR code if you need to use the link on physical marketing materials.",
    ],
    faqs: [
      { q: "What's the difference between utm_source and utm_medium?", a: "Source identifies WHERE the visit came from (facebook, newsletter, partner_x). Medium identifies HOW (cpc, email, referral, social). Keep both consistent across campaigns for clean reporting." },
      { q: "Should UTM values be lowercase?", a: "Yes. Analytics tools are case-sensitive, so 'Facebook' and 'facebook' become two separate rows in your reports. This tool lowercases values by default; disable that toggle only if a downstream system requires camelCase." },
      { q: "Do UTM parameters affect SEO?", a: "No — search engines ignore UTM parameters when consolidating link equity, and Google Search Console de-duplicates them in performance reports. Just avoid using them on internal links, which would overwrite the original attribution." },
      { q: "How long can a UTM-tagged URL be?", a: "Practical limit is around 2,000 characters (browser and server URL limits). Keep individual UTM values under 50 characters for readability in reports." },
    ],
    relatedTools: ["qr-code-generator", "slug-generator", "word-counter"],
  },
  "13th-month-pay-calculator": {
    categoryLabel: "Accounting Tool",
    metaDescription: "Calculate 13th month pay Philippines for free. Prorated bonus calculator for employees. Instant, accurate, and updated for 2024 tax rules.",
    longDescription: `The 13th month pay is a mandatory benefit in the Philippines, as stipulated under Presidential Decree No. 851. It is equivalent to one-twelfth (1/12) of the total basic salary earned by an employee within a calendar year. All rank-and-file employees who have worked for at least one month are eligible to receive this benefit, regardless of their employment status. 

Our Philippines 13th Month Pay Calculator helps you estimate your year-end bonus by accounting for your monthly basic salary, regular allowances, and any unpaid absences. Under the current BIR (Bureau of Internal Revenue) rules, the 13th month pay and other benefits are tax-exempt up to PHP 90,000. Any amount exceeding this threshold is considered part of your taxable income. The benefit must be paid to employees no later than December 24 of each year.

Key Features:
- Prorated calculation for employees who started mid-year.
- Tax-exempt threshold tracking (up to ₱90,000).
- Unpaid absence deduction logic.
- Support for regular monthly allowances.

How it works:
The tool takes your total basic earnings for the year and divides it by 12. It automatically handles the math for partial years and deducts unpaid leave based on your daily rate (Basic Monthly Salary / 22 or 26 days depending on your work week).

Why this tool matters:
For employees, it provides peace of mind and help with holiday budgeting. For HR and small business owners, it ensures compliant payroll processing without manual spreadsheet errors.`,
    useCases: [
      "For employees: Estimate your holiday bonus to plan gifts and travel expenses.",
      "For HR managers: Quickly double-check manual payroll calculations for new hires.",
      "For resignees: Calculate the prorated 13th month pay included in your final pay.",
    ],
    howToUse: [
      "Enter your monthly basic salary in Philippine Pesos (₱).",
      "Specify the number of months you worked during the current calendar year.",
      "Input any unpaid absences (days) to deduct from the base calculation.",
      "Add any regular monthly allowances that form part of your basic pay.",
      "Click Calculate to see your gross and estimated net 13th month pay.",
    ],
    faqs: [
      {
        q: "How is 13th month pay calculated in the Philippines?",
        a: "It is calculated by taking the total basic salary earned during the calendar year and dividing it by 12. It is essentially prorated based on the number of months you worked."
      },
      {
        q: "Is 13th month pay taxable?",
        a: "The first PHP 90,000 of the 13th month pay and other productivity benefits are tax-exempt. Any amount above this threshold is added to your taxable income for the year."
      },
      {
        q: "What if I resigned before December?",
        a: "You are still entitled to a prorated 13th month pay. It should be paid as part of your final pay/backpay, proportional to the time you worked that year."
      },
      {
        q: "Are bonuses and overtime included in the 13th month pay?",
        a: "No. According to labor laws, the 13th month pay is based on the 'basic salary', which excludes overtime pay, night shift differentials, and holiday pay."
      }
    ],
    relatedTools: ["sss-contribution-calculator", "philhealth-calculator", "bir-withholding-tax-calculator"],
  },
  "pag-ibig-contribution-calculator": {
    categoryLabel: "Accounting Tool",
    longDescription: "The Pag-IBIG Contribution Calculator helps Filipino employees and employers estimate their mandatory monthly contributions to the Home Development Mutual Fund (HDMF). Based on the 2024 contribution schedule, it calculates both the employee and employer shares, ensuring you stay compliant with national housing fund requirements.",
    howToUse: [
      "Enter your Monthly Basic Salary in PHP.",
      "Select your Employment Type (Private or Government).",
      "Choose your Membership Type (New or Old).",
      "View the breakdown of employee and employer shares.",
      "Copy or print the summary for your records."
    ],
    faqs: [
      { q: "What is the maximum contribution for Pag-IBIG in 2024?", a: "As of 2024, the monthly salary ceiling for Pag-IBIG contributions is PHP 10,000, resulting in a maximum contribution of PHP 200 for the employee and PHP 200 for the employer." },
      { q: "How are the contribution rates determined?", a: "For those earning PHP 1,500 and below, the employee rate is 1%. For those earning above PHP 1,500, it is 2%. Employers always contribute 2%." },
      { q: "Is this calculator official?", a: "This is a reference tool for estimation. Always verify your actual deductions with your HR department or the Pag-IBIG Fund office." },
      { q: "Does employment type affect the amount?", a: "The basic calculation remains the same for most sectors, but specific government agencies may have internal variations." }
    ]
  },
  "sss-contribution-calculator": {
    categoryLabel: "Accounting Tool",
    longDescription: "Stay on top of your Social Security System (SSS) contributions with this specialized calculator for Philippine workers. It incorporates the 2024 contribution brackets, including the mandatory provident fund (WISP) and the Employees' Compensation Commission (ECC) shares. Perfect for freelancers, HR staff, and business owners.",
    howToUse: [
      "Input your Monthly Basic Salary.",
      "Select your status: Employed, Self-Employed, or OFW.",
      "Check the calculated shares for SSS and ECC.",
      "See which salary bracket you fall into.",
      "Copy the results for your payroll documentation."
    ],
    faqs: [
      { q: "What is the SSS contribution rate for 2024?", a: "The current total contribution rate is 14% of the monthly salary credit, with the employer paying 9.5% and the employee paying 4.5%." },
      { q: "What is WISP?", a: "WISP stands for Workers' Investment and Savings Program, a mandatory provident fund for SSS members with a monthly salary credit exceeding PHP 20,000." },
      { q: "Do self-employed members pay both shares?", a: "Yes, self-employed and voluntary members are responsible for the full 14% contribution as they act as both employer and employee." },
      { q: "How often do SSS rates change?", a: "SSS rates are subject to periodic increases based on the Social Security Act of 2018. The current schedule reflects the 2024 update." }
    ]
  },
  "philhealth-calculator": {
    categoryLabel: "Accounting Tool",
    longDescription: "The PhilHealth Calculator provides an instant estimate of your monthly health insurance premiums in the Philippines. Using the 5.5% premium rate for 2024, it helps you understand the split between your personal contribution and your employer's share, ensuring you are prepared for universal healthcare coverage.",
    howToUse: [
      "Enter your Monthly Basic Salary.",
      "The tool automatically applies the floor (PHP 10k) and ceiling (PHP 100k) limits.",
      "Review the employee and employer shares (2.75% each).",
      "Check your annual total health insurance cost.",
      "Download or print the summary if needed."
    ],
    faqs: [
      { q: "What is the PhilHealth rate for 2024?", a: "The premium rate is 5.5% of the monthly basic salary, split equally (2.75% each) between the employee and the employer." },
      { q: "What is the maximum PhilHealth contribution?", a: "With a salary ceiling of PHP 100,000, the maximum total monthly premium is PHP 5,500 (PHP 2,750 each)." },
      { q: "Does this apply to OFWs?", a: "Yes, though the payment frequency and specific rules for Overseas Filipino Workers may differ. Consult PhilHealth for official OFW guidelines." },
      { q: "Is the calculation based on gross or basic pay?", a: "PhilHealth contributions are generally calculated based on the Monthly Basic Salary (MBS)." }
    ]
  },
  "bir-withholding-tax-calculator": {
    categoryLabel: "Accounting Tool",
    longDescription: "Calculate your take-home pay with precision using the BIR Withholding Tax Calculator. Built for the Philippine 2024 tax regime, this tool accounts for the revised TRAIN law tax brackets. It factors in your gross income and mandatory deductions to estimate exactly how much will be withheld by the Bureau of Internal Revenue.",
    howToUse: [
      "Enter your Gross Monthly Salary.",
      "Subtract mandatory deductions (SSS, PhilHealth, Pag-IBIG).",
      "Input any other tax-exempt benefits if applicable.",
      "View your annual taxable income and monthly tax due.",
      "Compare your gross vs. net pay."
    ],
    faqs: [
      { q: "Who is exempt from withholding tax in the PH?", a: "Individuals with an annual taxable income of PHP 250,000 or below are exempt from paying personal income tax." },
      { q: "How accurate is this tax calculator?", a: "It uses the official 2024 BIR withholding tax tables. However, year-end adjustments (taxization) may vary results slightly." },
      { q: "Does it include the 13th month pay?", a: "13th month pay is tax-exempt up to PHP 90,000 (standard) or PHP 300,000 as specified in certain contexts. This tool focuses on monthly salary withholding." },
      { q: "What are the tax brackets for 2024?", a: "Brackets range from 0% for those under 250k, up to 35% for those earning over 8 million PHP annually." }
    ]
  },
  "overtime-calculator-philippines": {
    categoryLabel: "Accounting Tool",
    longDescription: "Accurately compute your extra earnings with the Philippines Overtime Calculator. This tool follows the Philippine Labor Code, applying the correct multipliers for ordinary days, rest days, and holidays. It also includes the Night Shift Differential (NSD) for work performed during the graveyard shift.",
    howToUse: [
      "Enter your Hourly Rate (Monthly Basic / 176 or similar).",
      "Select the Day Type (Ordinary, Rest Day, Holiday).",
      "Input the number of Overtime Hours worked.",
      "Add any hours worked between 10 PM and 6 AM for Night Differential.",
      "Review the total overtime compensation."
    ],
    faqs: [
      { q: "What is the OT rate for an ordinary day?", a: "Overtime work on a regular workday is paid at an additional 25% of the hourly rate (1.25x)." },
      { q: "How much is holiday overtime?", a: "Work on a regular holiday is paid at 200% of the daily rate. Overtime on that day adds another 30% of that 200% rate." },
      { q: "When does Night Shift Differential apply?", a: "NSD applies to work performed between 10:00 PM and 6:00 AM, providing an additional 10% premium on the hourly rate." },
      { q: "Is rest day pay different from holiday pay?", a: "Yes. Rest day work is generally paid at 130% of the daily rate, while regular holiday work is 200%." }
    ]
  },
  "holiday-pay-calculator-ph": {
    categoryLabel: "Accounting Tool",
    longDescription: "The Holiday Pay Calculator for the Philippines simplifies the complex rules of 'No Work, No Pay' and premium rates. Whether it is a Regular Holiday or a Special Non-Working Day, this tool helps employees and HR professionals calculate the correct daily compensation based on the latest DOLE guidelines.",
    howToUse: [
      "Input your Daily Rate.",
      "Specify the number of Regular Holidays in the period.",
      "Add Special Non-Working Days or Rest Days worked.",
      "The tool calculates the total holiday premiums.",
      "View your effective daily rate for the period."
    ],
    faqs: [
      { q: "What is the difference between Regular and Special holidays?", a: "Regular holidays are paid even if you don't work (100%), and 200% if you do. Special holidays follow 'no work, no pay' but provide a 30% premium if worked." },
      { q: "What happens if a holiday falls on my rest day?", a: "If you work on a regular holiday that is also your rest day, you are entitled to an additional 30% premium on top of the 200% holiday pay (total 260%)." },
      { q: "Do I get paid if I am absent before a holiday?", a: "Under DOLE rules, you must be present or on leave with pay on the workday immediately preceding a regular holiday to be entitled to holiday pay." },
      { q: "Are all workers entitled to holiday pay?", a: "Most private sector employees are, but exceptions include managerial staff, government employees, and those in small retail/service establishments with fewer than 10 workers." }
    ]
  },
  "night-shift-differential-calculator": {
    categoryLabel: "Accounting Tool",
    longDescription: "Designed for BPO workers and night-shift employees, the Night Shift Differential Calculator ensures you are getting paid fairly for your graveyard hours. It computes the mandatory 10% premium for every hour worked between 10 PM and 6 AM, including multipliers for holidays and rest days.",
    howToUse: [
      "Enter your regular Hourly Rate.",
      "Input the total number of hours worked within the 10 PM to 6 AM window.",
      "Select if the work was on a regular day, rest day, or holiday.",
      "Check the calculated premium amount.",
      "Copy the result for your payslip verification."
    ],
    faqs: [
      { q: "What are the night shift hours in the Philippines?", a: "By law, the night shift differential applies to work performed between 10:00 PM and 6:00 AM." },
      { q: "How much is the night shift premium?", a: "The minimum night shift differential is 10% of the employee's regular hourly rate." },
      { q: "Does it apply to overtime?", a: "Yes. If you work overtime during the 10 PM - 6 AM window, the NSD is calculated based on your overtime hourly rate." },
      { q: "Who is exempt from Night Shift Differential?", a: "Exemptions include government employees, domestic helpers, and managerial employees." }
    ]
  },
  "tiktok-shop-fee-calculator": {
    categoryLabel: "TikTok Shop Tool",
    longDescription: `A Calculadora de Taxas TikTok Shop Brasil é a ferramenta definitiva para vendedores que desejam entender a rentabilidade real de seus produtos na plataforma. O TikTok Shop expandiu rapidamente no Brasil, trazendo uma estrutura de taxas competitiva, mas que exige atenção aos detalhes para não comprometer a margem de lucro. Esta ferramenta permite simular vendas considerando a comissão por categoria (que varia entre 5% e 8%), as taxas fixas de transação (2%) e processamento de pagamento (2.5%), além de custos logísticos e taxas de saque.

Vender no TikTok exige uma estratégia clara de precificação. Ao utilizar nossa calculadora, você pode comparar cenários com e sem frete grátis subsidiado, entender o impacto de cupons de desconto e visualizar exatamente quanto sobrará em sua conta após todos os descontos da plataforma. A transparência nos custos é o primeiro passo para escalar um negócio saudável no e-commerce social, evitando surpresas no fechamento do mês.

Nossa interface intuitiva e gráficos em tempo real ajudam você a tomar decisões rápidas sobre quais produtos promover e qual o desconto máximo permitido para manter uma margem efetiva saudável. Seja você um grande lojista ou um criador começando agora, dominar as taxas do TikTok Shop é essencial para o sucesso a longo prazo no mercado brasileiro.`,
    howToUse: [
      "Insira o preço de venda do seu produto no campo 'Preço do Produto'.",
      "Informe o custo de aquisição ou fabricação para calcular sua margem real.",
      "Selecione a categoria correta (Moda, Beleza, Eletrônicos, etc.) para aplicar a comissão exata.",
      "Ative a opção de 'Frete Grátis' se você for oferecer esse benefício e insira o custo do envio.",
      "Escolha o seu método de saque preferido (PIX, TED ou Internacional) para incluir essa taxa fixa.",
      "Analise o gráfico de pizza e o detalhamento lateral para ver o valor líquido final e a margem de lucro percentual."
    ],
    faqs: [
      { q: "Quais são as taxas do TikTok Shop Brasil em 2024?", a: "A estrutura básica inclui comissão por categoria (5-8%), taxa de transação (2%) e taxa de processamento de pagamento (2.5%)." },
      { q: "Como calcular o valor líquido de uma venda no TikTok?", a: "Subtraia do preço bruto a comissão da categoria, a taxa de transação, o processamento, custos de frete (se aplicável) e a taxa de saque." },
      { q: "O frete grátis no TikTok Shop é pago pelo vendedor?", a: "Depende da campanha. Em muitos casos, o vendedor subsidia o frete para atrair mais clientes. Nossa calculadora permite simular esse custo." },
      { q: "Vale a pena vender no TikTok Shop?", a: "Sim, especialmente para produtos com alto apelo visual e viral. No entanto, é crucial monitorar a margem efetiva para garantir que o volume de vendas compense as taxas." }
    ]
  },
  "calculadora-margem-lucro": {
    categoryLabel: "Calculadora de E-commerce",
    longDescription: `A Calculadora de Margem de Lucro para E-commerce é uma ferramenta indispensável para lojistas que buscam precisão financeira. No comércio eletrônico, a diferença entre o sucesso e o fracasso muitas vezes reside em poucos pontos percentuais de margem. Esta calculadora permite inserir não apenas o custo do produto e o preço de venda, mas também fretes, impostos e custos fixos proporcionais, fornecendo uma visão clara da saúde financeira de cada item em seu catálogo.

Entender a diferença entre margem bruta e margem líquida é crucial. Enquanto a margem bruta foca na relação entre custo e preço de venda, a margem líquida revela o que realmente sobra após todas as deduções operacionais. Com esta ferramenta, você também pode calcular o Markup, um multiplicador essencial para definir preços competitivos mantendo a sustentabilidade do negócio.

Utilize os gráficos integrados para visualizar o peso de cada custo em sua operação. Identificar que os impostos ou o frete estão consumindo uma fatia muito grande da sua margem permite ajustes estratégicos rápidos, como a troca de fornecedores, alteração da transportadora ou renegociação de taxas com marketplaces.`,
    howToUse: [
      "Insira o preço de venda final que você pretende cobrar do cliente.",
      "Adicione o custo unitário de aquisição ou produção do produto.",
      "Informe o custo médio de frete por unidade vendida.",
      "Coloque a alíquota de impostos (ex: Simples Nacional) que incide sobre a nota fiscal.",
      "Inclua outros custos variáveis, como embalagem ou taxas de cartão.",
      "Visualize instantaneamente sua margem líquida e lucro em reais."
    ],
    faqs: [
      { q: "Qual é a margem de lucro ideal para e-commerce?", a: "Embora varie por nicho, uma margem líquida entre 10% e 20% é considerada saudável para a maioria das operações brasileiras." },
      { q: "Qual a diferença entre margem e markup?", a: "Margem é a porcentagem do preço de venda que é lucro. Markup é quanto você adiciona ao custo para chegar ao preço de venda." },
      { q: "Como a calculadora trata impostos?", a: "Os impostos são calculados sobre o preço de venda bruto, que é a regra geral para a maioria dos regimes tributários no Brasil." },
      { q: "Custos de frete devem entrar no cálculo de margem?", a: "Sim, se você oferece frete grátis ou subsidia parte dele, esse valor é um custo variável que reduz diretamente seu lucro." }
    ]
  },
  "calculadora-frete-gratis": {
    categoryLabel: "Estratégia de Logística",
    longDescription: `Oferecer frete grátis é uma das táticas mais poderosas para reduzir o abandono de carrinho e aumentar as vendas, mas pode ser perigoso para o lucro se não for bem calculado. A Calculadora de Frete Grátis ajuda você a encontrar o "equilíbrio mágico": o preço mínimo de venda necessário para absorver o custo de envio sem sacrificar sua margem de lucro desejada.

Esta ferramenta é essencial para lojistas no Mercado Livre, Shopee e sites próprios que desejam ser competitivos. Ela simula o impacto do frete em diferentes níveis de preço, permitindo que você decida se deve aumentar o valor do produto, criar combos para aumentar o ticket médio ou restringir o benefício a certas faixas de preço.

O frete no Brasil tem custos variados devido à dimensão continental do país. Usar esta calculadora permite definir políticas de frete regionalizadas ou nacionais com muito mais segurança, garantindo que o crescimento no volume de vendas venha acompanhado de crescimento na rentabilidade.`,
    howToUse: [
      "Insira o preço atual ou planejado do seu produto.",
      "Informe o custo médio de frete que você precisará pagar à transportadora.",
      "Defina qual a margem de lucro mínima que você aceita ter neste item.",
      "Analise o preço sugerido pela calculadora para manter essa rentabilidade com frete grátis.",
      "Use as dicas estratégicas abaixo dos resultados para refinar sua política de envio."
    ],
    faqs: [
      { q: "Vale a pena oferecer frete grátis para todo o Brasil?", a: "Geralmente não. É mais seguro oferecer para regiões próximas (ex: Sul/Sudeste) e estabelecer um valor mínimo de compra para outras regiões." },
      { q: "Como o frete grátis afeta a conversão?", a: "Estudos mostram que o frete grátis pode aumentar a taxa de conversão em até 30%, pois elimina a 'surpresa' negativa no checkout." },
      { q: "Devo subir o preço do produto para dar frete grátis?", a: "Sim, em muitos casos essa é a estratégia correta. O cliente prefere pagar R$ 100 com frete grátis do que R$ 80 + R$ 20 de frete." },
      { q: "O que é 'Frete Grátis acima de R$ X'?", a: "É uma técnica para aumentar o Ticket Médio, onde o cliente adiciona mais itens ao carrinho para não pagar o envio." }
    ]
  },
  "calculadora-cupom-desconto": {
    categoryLabel: "Marketing de Vendas",
    longDescription: `Promoções e cupons são a alma do marketing digital, mas sem cálculo, podem levar ao prejuízo. A Calculadora de Cupom de Desconto permite simular qualquer oferta — seja ela um valor fixo em reais ou uma porcentagem — e visualizar instantaneamente como isso afeta seu lucro final e sua margem.

Esta ferramenta é perfeita para planejar campanhas de Black Friday, promoções de influenciadores ou cupons de primeira compra. Ela ajuda a definir o "teto de desconto", garantindo que, mesmo em promoção, sua loja continue sendo um negócio lucrativo.

Muitos lojistas esquecem que o desconto incide sobre o faturamento, mas o custo do produto permanece o mesmo. Isso faz com que a margem caia de forma desproporcional. Nossa calculadora evidencia esse efeito, ajudando você a tomar decisões baseadas em dados, não apenas em intuição.`,
    howToUse: [
      "Insira o preço original do produto sem descontos.",
      "Adicione o custo unitário (compra + taxas) para sabermos a base de lucro.",
      "Selecione se o desconto será em Porcentagem (%) ou Valor Fixo (R$).",
      "Informe o valor do desconto planejado.",
      "Confira o preço final, o lucro restante e se a margem ainda é aceitável."
    ],
    faqs: [
      { q: "Qual o desconto máximo que posso dar?", a: "O limite é o seu lucro bruto. Nunca dê um desconto que resulte em lucro zero ou negativo, a menos que seja uma estratégia de aquisição de clientes." },
      { q: "Desconto em reais ou porcentagem: qual o melhor?", a: "Depende do preço. Para itens caros, porcentagem soa melhor. Para itens baratos, um valor fixo (ex: R$ 10 OFF) costuma converter mais." },
      { q: "Como cupons afetam a margem de lucro?", a: "Eles reduzem a margem de forma agressiva. Um desconto de 20% no preço pode significar uma redução de 50% ou mais no seu lucro líquido." },
      { q: "Devo dar cupom de primeira compra?", a: "Sim, é uma ótima ferramenta de aquisição. Calcule o desconto como um custo de marketing para trazer o cliente para sua base." }
    ]
  },
  "calculadora-ponto-equilibrio": {
    categoryLabel: "Gestão Financeira",
    longDescription: `O Ponto de Equilíbrio, ou Break-Even Point, é o número mágico que todo empresário deve conhecer. Ele representa o momento exato em que suas vendas igualam seus custos — a partir desse ponto, cada venda adicional gera lucro real. Esta calculadora simplifica o processo, permitindo que você visualize quanto precisa vender mensalmente para manter as portas abertas.

Entender seus custos fixos (aluguel, sistemas, salários) e seus custos variáveis (impostos, custos do produto) é o primeiro passo para uma gestão profissional. A calculadora fornece não apenas o número de unidades, mas também o faturamento necessário e um gráfico intuitivo que mostra o cruzamento das linhas de custo e receita.

Use esta ferramenta para planejar expansões, contratações ou para entender a viabilidade de um novo nicho. Se o seu ponto de equilíbrio está muito alto, você sabe que precisa aumentar seus preços, reduzir custos fixos ou buscar produtos com maior margem de contribuição.`,
    howToUse: [
      "Informe a soma de todos os seus custos fixos mensais.",
      "Insira o preço médio de venda dos seus produtos.",
      "Adicione o custo variável médio (produto + impostos + taxas por venda).",
      "Analise o resultado em unidades e faturamento total.",
      "Observe o gráfico para entender a distância entre sua situação atual e o lucro."
    ],
    faqs: [
      { q: "O que é Ponto de Equilíbrio?", a: "É o nível de vendas onde a receita total é igual à soma de todos os custos fixos e variáveis. É o ponto de lucro zero." },
      { q: "Como reduzir o ponto de equilíbrio?", a: "Você pode reduzir custos fixos, diminuir o custo de aquisição dos produtos ou aumentar o preço de venda." },
      { q: "Por que o ponto de equilíbrio é importante?", a: "Ele ajuda a definir metas de vendas realistas e a entender o risco do negócio em meses de baixa demanda." },
      { q: "O que é Margem de Contribuição?", a: "É o valor que sobra de cada venda após pagar os custos variáveis, que será usado para cobrir os custos fixos e gerar lucro." }
    ]
  },
  "calculadora-roi-marketing": {
    categoryLabel: "Marketing Digital",
    longDescription: `No marketing digital para e-commerce, o ROI (Retorno sobre Investimento) e o ROAS (Retorno sobre Gasto em Anúncios) são os indicadores que separam amadores de profissionais. Nossa calculadora de ROI permite que você vá além das métricas de vaidade das plataformas de anúncios e veja o lucro real que sobrou no bolso após considerar todos os custos operacionais.

Muitas vezes, uma campanha com ROAS alto no Facebook ou Google pode estar dando prejuízo se a margem do produto for baixa ou se o frete for caro. Esta ferramenta consolida investimento, faturamento e custos de produto, fornecendo uma visão 360º da performance das suas campanhas pagas.

Calcular o ROI permite que você decida com segurança onde investir mais dinheiro e quais canais de aquisição devem ser pausados. É a ferramenta base para escalar seu tráfego pago de forma lucrativa e sustentável no mercado brasileiro.`,
    howToUse: [
      "Insira o valor total investido em anúncios no período.",
      "Informe o faturamento total gerado diretamente por essas campanhas.",
      "Adicione o custo dos produtos vendidos e outras taxas variáveis.",
      "Informe o número de conversões (vendas) para calcular o CPA.",
      "Confira o ROI percentual, o ROAS e o lucro líquido da campanha."
    ],
    faqs: [
      { q: "Qual a diferença entre ROI e ROAS?", a: "O ROAS foca apenas no faturamento bruto sobre o gasto. O ROI considera todos os custos, revelando o lucro líquido real." },
      { q: "O que é um ROI positivo?", a: "Qualquer ROI acima de 0% significa que você não perdeu dinheiro, mas idealmente você busca valores significativamente maiores para cobrir sua estrutura." },
      { q: "Como calcular o CPA (Custo por Aquisição)?", a: "Divida o investimento total pelo número de vendas geradas pela campanha." },
      { q: "Qual o ROAS ideal para e-commerce?", a: "Depende da margem. Para produtos com margem de 50%, um ROAS acima de 2x já começa a dar lucro. Para margens menores, o ROAS precisa ser maior." }
    ]
  },
  "calculadora-estoque-minimo": {
    categoryLabel: "Gestão de Estoque",
    longDescription: `A falta de produto no estoque (ruptura) é uma das maiores causas de perda de vendas e queda de reputação em marketplaces. A Calculadora de Estoque Mínimo e Ponto de Reposição ajuda você a manter o equilíbrio perfeito: nem estoque demais (dinheiro parado), nem estoque de menos (venda perdida).

Considerando sua demanda diária, o tempo que o fornecedor leva para entregar (Lead Time) e uma margem de segurança para imprevistos, nossa ferramenta diz exatamente quando você deve emitir um novo pedido de compra. É a ciência da logística aplicada ao seu pequeno ou médio e-commerce.

Uma gestão de estoque eficiente libera fluxo de caixa para você investir em marketing e novos produtos. Use esta calculadora para seus itens mais vendidos (Curva A) e garanta que sua operação nunca pare por falta de mercadoria.`,
    howToUse: [
      "Insira a média de unidades vendidas por mês deste produto.",
      "Informe quantos dias o fornecedor leva para entregar após o pedido.",
      "Defina quantos dias de segurança você deseja ter (ex: 5 ou 10 dias).",
      "Confira o Ponto de Reposição: quando seu estoque bater este número, peça mais.",
      "Veja também o estoque de segurança, que é o seu limite crítico."
    ],
    faqs: [
      { q: "O que é Ponto de Reposição?", a: "É o nível de estoque que, ao ser atingido, dispara a necessidade de um novo pedido de compra para que a mercadoria chegue antes do estoque acabar." },
      { q: "O que é Lead Time?", a: "É o tempo total decorrido entre o pedido ao fornecedor e a entrada física do produto no seu estoque." },
      { q: "Como definir o estoque de segurança?", a: "Depende da confiabilidade do fornecedor e da estabilidade da demanda. Para fornecedores instáveis, use um estoque de segurança maior." },
      { q: "Dinheiro parado no estoque é prejuízo?", a: "Sim. Ter estoque excessivo aumenta seus custos de armazenagem e impede que esse dinheiro seja usado para gerar mais vendas em outras áreas." }
    ]
  },
  "calculadora-preco-venda": {
    categoryLabel: "Precificação de E-commerce",
    longDescription: `Definir o preço de um produto no e-commerce brasileiro é um desafio que envolve múltiplas variáveis: custos de aquisição, frete, impostos em cascata e taxas agressivas de marketplaces. A Calculadora de Preço de Venda Sugerido resolve essa equação para você, garantindo que o preço final cubra todos os custos e ainda entregue a margem de lucro que seu negócio precisa.

Utilizando a técnica de Markup baseada na margem desejada, a ferramenta projeta o preço ideal. Ela é fundamental para quem vende em canais como Mercado Livre, Amazon e Shopee, onde as taxas podem chegar a 20% ou mais do valor da venda. Sem um cálculo preciso, é fácil vender muito e acabar com saldo negativo.

Ao simular diferentes cenários, você pode descobrir se um produto é viável para o mercado ou se o preço necessário para ter lucro está muito acima da concorrência, permitindo ajustes no seu modelo de negócio antes de investir em estoque.`,
    howToUse: [
      "Insira o custo de compra do produto.",
      "Defina a margem de lucro líquida que você deseja ter sobre o preço final.",
      "Informe a porcentagem de impostos que sua empresa paga sobre a venda.",
      "Adicione a comissão cobrada pelo marketplace ou canal de venda.",
      "Inclua o custo de frete que será embutido no preço.",
      "Confira o preço de venda sugerido e o lucro real em reais."
    ],
    faqs: [
      { q: "Como definir o preço de venda no e-commerce?", a: "O preço deve ser a soma do custo do produto, frete, impostos e taxas, dividida pelo complemento da margem de lucro desejada." },
      { q: "O que fazer se o preço sugerido for maior que a concorrência?", a: "Você precisará reduzir seus custos (negociar com fornecedores), baixar sua margem de lucro ou agregar mais valor ao produto." },
      { q: "Impostos incidem sobre o lucro ou faturamento?", a: "No e-commerce brasileiro, a maioria dos impostos (como o Simples Nacional) incide sobre o faturamento bruto." },
      { q: "O que é Markup?", a: "É um índice aplicado sobre o custo do produto para formar o preço de venda. Ele deve ser suficiente para cobrir despesas e gerar o lucro desejado." }
    ]
  }
};

export function getToolContent(tool: Tool): ToolContent {
  const override = OVERRIDES[tool.slug] ?? {};
  return {
    categoryLabel: override.categoryLabel ?? (CATEGORY_LABEL[tool.categorySlug] ?? "Online Tool"),
    metaDescription: override.metaDescription,
    longDescription: override.longDescription ?? defaultLongDescription(tool),
    useCases: override.useCases,
    howToUse: override.howToUse ?? defaultHowToUse(tool),
    faqs: override.faqs ?? defaultFaqs(tool),
    relatedTools: override.relatedTools,
  };
}



export function toolPageTitle(tool: Tool): string {
  const label = CATEGORY_LABEL[tool.categorySlug] ?? "Online Tool";
  return `${tool.name} — Free Online ${label} | Nexatools`;
}

export function toolMetaDescription(tool: Tool): string {
  const content = getToolContent(tool);
  if (content.metaDescription) return content.metaDescription;
  
  const base = tool.shortDescription.replace(/\.$/, "");
  const suffix = " Free, fast, no signup needed.";
  const max = 155;
  const full = `${base}.${suffix}`;
  return full.length > max ? full.slice(0, max - 1).trimEnd() + "…" : full;
}