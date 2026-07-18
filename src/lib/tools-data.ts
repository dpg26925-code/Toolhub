export type ToolCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};

export type Tool = {
  slug: string;
  name: string;
  shortDescription: string;
  categorySlug: string;
  icon: string;
  isFeatured?: boolean;
  isFree?: boolean;
  creditCost: number;
  clientSide: boolean;
};

export const CATEGORIES: ToolCategory[] = [
  { slug: "pdf", name: "PDF", description: "Compress, convert, merge, split and edit PDF files.", icon: "📄" },
  { slug: "image", name: "Image", description: "Resize, convert, compress and enhance images.", icon: "🖼️" },
  { slug: "ai", name: "AI", description: "AI-powered writing, summarising and generation tools.", icon: "✨" },
  { slug: "developer", name: "Developer", description: "Everyday utilities for developers — formatters, encoders, testers.", icon: "🧑‍💻" },
];

export const TOOLS: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    shortDescription: "Pretty print, minify and validate JSON in your browser.",
    categorySlug: "developer",
    icon: "{ }",
    isFeatured: true,
    isFree: true,
    creditCost: 0,
    clientSide: true,
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    shortDescription: "Encode and decode Base64 text — locally, never uploaded.",
    categorySlug: "developer",
    icon: "B64",
    isFeatured: true,
    isFree: true,
    creditCost: 0,
    clientSide: true,
  },
  {
    slug: "url-encoder",
    name: "URL Encoder / Decoder",
    shortDescription: "Percent-encode or decode URL strings and query params.",
    categorySlug: "developer",
    icon: "%",
    isFree: true,
    creditCost: 0,
    clientSide: true,
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    shortDescription: "Inspect JWT header, payload and signature — client-side only.",
    categorySlug: "developer",
    icon: "🔐",
    isFeatured: true,
    isFree: true,
    creditCost: 0,
    clientSide: true,
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    shortDescription: "Test regular expressions with live match highlighting.",
    categorySlug: "developer",
    icon: ".*",
    isFree: true,
    creditCost: 0,
    clientSide: true,
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    shortDescription: "Generate strong, cryptographically random passwords.",
    categorySlug: "developer",
    icon: "🔑",
    isFeatured: true,
    isFree: true,
    creditCost: 0,
    clientSide: true,
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    shortDescription: "MD5, SHA-1, SHA-256 and SHA-512 hashes for any text.",
    categorySlug: "developer",
    icon: "#",
    isFree: true,
    creditCost: 0,
    clientSide: true,
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    shortDescription: "Convert between HEX, RGB, HSL and HSV with a live picker.",
    categorySlug: "developer",
    icon: "🎨",
    isFeatured: true,
    isFree: true,
    creditCost: 0,
    clientSide: true,
  },
];

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const toolsInCategory = (slug: string) => TOOLS.filter((t) => t.categorySlug === slug);
export const featuredTools = () => TOOLS.filter((t) => t.isFeatured);