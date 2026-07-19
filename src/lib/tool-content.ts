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

/** Default long description used when no override exists — keeps SEO body copy on every tool page. */
function defaultLongDescription(tool: Tool): string {
  const runtime = tool.clientSide
    ? "runs entirely in your browser — your files and text never leave your device"
    : "is powered by our secure server infrastructure";
  const categoryContext: Record<string, string> = {
    pdf: `Common workflows include preparing contracts before emailing them to clients, reorganising scanned reports and getting PDFs down to a size that customer portals actually accept.`,
    image: `Photographers, marketers and product teams reach for this tool when they need a quick, format-consistent asset for a website, ad campaign or social post — without opening Photoshop.`,
    video: `Creators, marketers and support teams use this to prep video assets — cutting clips for social, shrinking screen recordings for support tickets and pulling audio from interviews — without installing any editing software.`,
    converter: `Developers, analysts and content creators use this converter to move data between formats — turning configs into APIs, spreadsheets into data pipelines and drafts into publish-ready markup.`,
    ai: `The underlying model is tuned for practical output: summaries you can send to a colleague, translations that read naturally and rewrites that preserve the meaning of the original text.`,
    developer: `It's the utility developers keep pinned in a tab — reach for it between commits, while reviewing an API response or when a teammate pastes something into Slack that needs decoding.`,
    tiktok: `TikTok creators, TikTok Shop sellers and short-form marketers use this to plan scripts, tune captions, size hashtags and price products — all inside the browser, so nothing you paste ever leaves your device.`,
    trader: `Retail forex, crypto and CFD traders use this to size positions correctly, respect risk-per-trade rules and sanity-check indicator readings — all client-side, so account numbers, prices and P/L never leave your device.`,
  };
  const useCase = categoryContext[tool.categorySlug] ?? `Teams across engineering, marketing and operations rely on ${tool.name} for one-off conversions and repeatable, script-friendly workflows.`;
  return [
    `The ${tool.name} is a free online utility that helps you ${tool.shortDescription.toLowerCase().replace(/\.$/, "")}. It ${runtime}, so you get instant results without installing software or creating an account.`,
    useCase,
    `${tool.name} is part of the Nexatools platform — a growing library of 30+ purpose-built utilities. Sign in for a free account to save history, mark favorites and get higher daily limits; upgrade to Pro when you need API access, batch processing and no ads.`,
  ].join("\n\n");
}

function defaultHowToUse(tool: Tool): string[] {
  return [
    `Open the ${tool.name} page — no signup required to get started.`,
    `Provide your input using the form above (paste text, upload a file or adjust the options).`,
    `Click the action button and download or copy the result instantly.`,
  ];
}

function defaultFaqs(tool: Tool): Faq[] {
  return [
    { q: `Is the ${tool.name} free?`, a: `Yes — the ${tool.name} is completely free to use. Signed-in users get higher limits and can save history and favorites.` },
    { q: `Do you store my files or data?`, a: tool.clientSide
      ? `No. This tool runs entirely in your browser, so nothing is ever uploaded to our servers.`
      : `Files are processed on our servers and deleted immediately after your session ends. We never share or sell your data.` },
    { q: `Can I use the ${tool.name} on mobile?`, a: `Yes. Every Nexatools tool works on desktop, tablet and mobile browsers — no app install needed.` },
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