import fs from "fs";
import path from "path";

const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="60%" stop-color="#0f1b3d" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="50%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#f97316" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background rounded card -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#38bdf8" stroke-opacity="0.25" stroke-width="6" />

  <g filter="url(#softGlow)">
    <!-- Dynamic stylized Nexatools "N" -->
    <!-- Left bar -->
    <path d="M120 144 C120 130.7 130.7 120 144 120 L176 120 C189.3 120 200 130.7 200 144 L200 368 C200 381.3 189.3 392 176 392 L144 392 C130.7 392 120 381.3 120 368 Z" fill="url(#orangeGrad)" />
    
    <!-- Diagonal bridge -->
    <path d="M180 136 L332 356 C340 368 358 368 366 356 L372 346 C380 334 380 318 372 306 L248 128 C240 116 222 116 214 128 Z" fill="url(#orangeGrad)" />

    <!-- Right bar -->
    <path d="M312 144 C312 130.7 322.7 120 336 120 L368 120 C381.3 120 392 130.7 392 144 L392 368 C392 381.3 381.3 392 368 392 L336 392 C322.7 392 312 381.3 312 368 Z" fill="url(#orangeGrad)" />

    <!-- AI Sparkle star -->
    <path d="M388 96 L398 124 L426 134 L398 144 L388 172 L378 144 L350 134 L378 124 Z" fill="url(#cyanGrad)" />
    <circle cx="156" cy="156" r="8" fill="#ffffff" opacity="0.6" />
  </g>
</svg>`;

// Write public/favicon.svg
fs.writeFileSync("public/favicon.svg", svgFavicon, "utf8");
console.log("Created public/favicon.svg");

// Write public/site.webmanifest
const manifest = {
  name: "Nexatools — Free Online Tools",
  short_name: "Nexatools",
  description: "390+ Free and Pro online tools for PDF, image, video, AI, and developer workflows.",
  start_url: "/",
  display: "standalone",
  background_color: "#0f172a",
  theme_color: "#0f172a",
  icons: [
    {
      src: "/favicon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any maskable"
    }
  ]
};

fs.writeFileSync("public/site.webmanifest", JSON.stringify(manifest, null, 2), "utf8");
console.log("Created public/site.webmanifest");
