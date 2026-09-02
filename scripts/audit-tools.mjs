import fs from "fs";
import path from "path";

// 1. Read tools data
const dataContent = fs.readFileSync("src/lib/tools-data.ts", "utf8");
const toolsDataMatches = [...dataContent.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);
const categorySlugs = [
  "pdf", "image", "video", "youtube", "affiliate", "tiktok", "converter", "ai", 
  "developer", "trader", "accounting", "health", "education", "real-estate", 
  "legal", "units", "fun", "social", "travel", "science", "language", 
  "date-time", "betting", "security", "games"
];
const toolSlugs = Array.from(new Set(toolsDataMatches.filter(s => !categorySlugs.includes(s))));

// 2. Read registry
const regContent = fs.readFileSync("src/tools/registry.ts", "utf8");
const regMatches = [...regContent.matchAll(/["']([^"']+)["']:\s*lazy\(\(\)\s*=>\s*import\(["']\.\/([^"']+)["']\)\)/g)];
const regMap = new Map();
for (const [_, slug, filePath] of regMatches) {
  regMap.set(slug, filePath);
}

// 3. Scan all tool files in src/tools
const toolsDir = "src/tools";
const allFiles = fs.readdirSync(toolsDir).filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));

console.log(`Total unique tool slugs in tools-data.ts: ${toolSlugs.length}`);
console.log(`Total entries in TOOL_REGISTRY: ${regMap.size}`);
console.log(`Total tool files in src/tools: ${allFiles.length}`);

const missingFromRegistry = [];
const missingFiles = [];
const smallOrStubFiles = [];
const analysis = [];

for (const slug of toolSlugs) {
  const fileTarget = regMap.get(slug);
  if (!fileTarget) {
    missingFromRegistry.push(slug);
    continue;
  }
  
  const tsxPath = path.join(toolsDir, `${fileTarget}.tsx`);
  const tsPath = path.join(toolsDir, `${fileTarget}.ts`);
  let filePath = "";
  if (fs.existsSync(tsxPath)) filePath = tsxPath;
  else if (fs.existsSync(tsPath)) filePath = tsPath;
  else {
    missingFiles.push({ slug, fileTarget });
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const stats = fs.statSync(filePath);
  
  const hasButton = /<Button|button\b/i.test(content);
  const hasInputOrTextarea = /<Input|<Textarea|<select|<Slider|<input|<textarea/i.test(content);
  const hasStateOrMemo = /useState|useMemo|useReducer|useCallback|useEffect/i.test(content);
  const hasCopy = /clipboard|copy/i.test(content);
  const hasDownloadOrAction = /download|Blob|URL\.createObjectURL|export|save/i.test(content);
  const isSmall = stats.size < 600;

  if (isSmall || (!hasButton && !hasInputOrTextarea)) {
    smallOrStubFiles.push({
      slug,
      file: fileTarget,
      size: stats.size,
      lines: content.split("\n").length,
      hasButton,
      hasInputOrTextarea,
      hasStateOrMemo
    });
  }

  analysis.push({
    slug,
    file: fileTarget,
    size: stats.size,
    lines: content.split("\n").length,
    hasButton,
    hasInputOrTextarea,
    hasStateOrMemo,
    hasCopy,
    hasDownloadOrAction
  });
}

console.log("\n--- AUDIT RESULTS ---");
console.log(`Missing from registry: ${missingFromRegistry.length}`, missingFromRegistry);
console.log(`Missing files on disk: ${missingFiles.length}`, missingFiles);
console.log(`Potential stubs or very small files (<600 bytes or no interactive buttons/inputs): ${smallOrStubFiles.length}`);

for (const s of smallOrStubFiles) {
  console.log(`- Slug: ${s.slug} | File: ${s.file} | Size: ${s.size}B | Lines: ${s.lines} | hasButton: ${s.hasButton} | hasInput: ${s.hasInputOrTextarea}`);
}

const withoutButtons = analysis.filter(a => !a.hasButton);
console.log(`\nTools without buttons: ${withoutButtons.length}`);
for (const wb of withoutButtons) {
  console.log(`- ${wb.slug} (${wb.file})`);
}

const withoutInputs = analysis.filter(a => !a.hasInputOrTextarea && !a.hasButton);
console.log(`\nTools without input and without button: ${withoutInputs.length}`);
