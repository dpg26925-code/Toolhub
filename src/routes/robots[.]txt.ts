import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const content = `User-agent: *
Allow: /

Disallow: /dashboard
Disallow: /admin
Disallow: /auth
Disallow: /reset-password

Sitemap: ${SITE_URL}/sitemap.xml
`;
        return new Response(content, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
