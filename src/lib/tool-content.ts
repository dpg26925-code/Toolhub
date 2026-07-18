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
  ai: "AI Tool",
  developer: "Developer Tool",
};

/** Default long description used when no override exists — keeps SEO body copy on every tool page. */
function defaultLongDescription(tool: Tool): string {
  const runtime = tool.clientSide
    ? "runs entirely in your browser — your files and text never leave your device"
    : "is powered by our secure server infrastructure";
  return [
    `The ${tool.name} is a free online utility that helps you ${tool.shortDescription.toLowerCase().replace(/\.$/, "")}. It ${runtime}, so you get instant results without installing software or creating an account.`,
    `Built for creators, developers and everyday professionals, this tool is part of the ToolHub AI platform — a growing library of 30+ purpose-built utilities. Whether you're preparing files for a client, cleaning up data before analysis or just need a quick one-off conversion, the ${tool.name} handles the heavy lifting so you can stay focused on the work that matters.`,
    `Everything is designed around three principles: speed, privacy and simplicity. Load the page, drop in your input and get a shareable result in seconds. There are no upsells, no watermarks and no confusing settings — just the tool you came for. Advanced users can unlock higher limits, batch processing and API access with a free ToolHub AI account.`,
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
    { q: `Can I use the ${tool.name} on mobile?`, a: `Yes. Every ToolHub AI tool works on desktop, tablet and mobile browsers — no app install needed.` },
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
    longDescription: "JSON Formatter is a fast, browser-based utility for developers who spend their day reading and writing JSON. Paste any JSON payload — API responses, config files, log entries — and get an instantly formatted, syntax-highlighted output with the ability to pretty-print, minify or validate the structure.\n\nEvery developer's toolkit needs a reliable JSON formatter, and this one runs 100% client-side so you can safely paste sensitive API responses without worrying about them being logged or sent anywhere. It's also fast enough to handle payloads several megabytes in size without stalling the page.\n\nCombine this with the other developer tools on ToolHub AI — JWT Decoder for inspecting auth tokens, Base64 for encoded fields, Regex Tester for pattern matching and CSV to JSON for data conversion — and you have a full browser-based debugging workbench without ever leaving the tab.",
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
  return `${tool.name} — Free Online ${label} | ToolHub AI`;
}

export function toolMetaDescription(tool: Tool): string {
  const base = tool.shortDescription.replace(/\.$/, "");
  const suffix = " Free, fast, no signup needed.";
  const max = 155;
  const full = `${base}.${suffix}`;
  return full.length > max ? full.slice(0, max - 1).trimEnd() + "…" : full;
}