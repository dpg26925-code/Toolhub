import { createFileRoute } from "@tanstack/react-router";

const ADS_TXT_CONTENT = `google.com, pub-7347008033628572, DIRECT, f08c47fec0942fa0\n`;

export const Route = createFileRoute("/ads.txt")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(ADS_TXT_CONTENT, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
