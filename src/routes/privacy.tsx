import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Nexatools" },
      { name: "description", content: "How Nexatools collects, stores, and protects your data — cookies, analytics, account information, client-side processing, and your privacy rights." },
      { property: "og:title", content: "Privacy Policy — Nexatools" },
      { property: "og:description", content: "Learn how Nexatools handles cookies, analytics, account data, client-side tool processing, and your rights over the information we store." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-muted-foreground">
          <p>This Privacy Policy explains what personal information Nexatools ("we", "us", "our") collects when you use nexatools.cloud (the "Service"), why we collect it, how we store it, and the rights you have over it. By using the Service you agree to this policy.</p>

          <h2 className="text-xl font-semibold text-foreground">1. Information we collect</h2>
          <p><strong>Account data.</strong> When you sign up we store your email address, hashed password (via Supabase Auth), display name, avatar URL if provided, and your plan/credit balance.</p>
          <p><strong>Usage data.</strong> We log which tool was invoked, timestamp, credit cost, request size, and whether the request succeeded. We do not log the contents of your input or output.</p>
          <p><strong>Payment data.</strong> Payments are processed by LemonSqueezy. We only receive the subscription status, plan, and last-four of the card — never the full card number.</p>
          <p><strong>Analytics.</strong> We use Google Analytics 4 (measurement ID G-E57495G278) to understand aggregate traffic. GA sets first-party cookies; you can opt out with any standard browser DNT or ad-blocker.</p>
          <p><strong>Cookies.</strong> We set a session cookie for authentication and a preference cookie for theme. No third-party advertising cookies.</p>

          <h2 className="text-xl font-semibold text-foreground">2. Client-side tools</h2>
          <p>Tools marked "Client-side" (JSON Formatter, Base64, Image Resizer, PDF Merge, etc.) process files entirely inside your browser using WebAssembly or JavaScript. Your files never leave your device and are never uploaded to our servers.</p>

          <h2 className="text-xl font-semibold text-foreground">3. Server-side and AI tools</h2>
          <p>Tools marked with a credit cost (Summarize, Translate, Chat PDF, OCR, Remove Background) send your input over TLS 1.3 to our processing servers or to our AI provider (Google Gemini via Lovable AI Gateway). Data is processed in memory and discarded within 60 seconds of your request completing. We do not use your inputs to train any model.</p>

          <h2 className="text-xl font-semibold text-foreground">4. How long we keep data</h2>
          <p>Account data is kept for the life of your account. Usage logs are kept for 90 days for abuse prevention and analytics, then anonymised. You can request full deletion at any time — see Section 6.</p>

          <h2 className="text-xl font-semibold text-foreground">5. Sharing</h2>
          <p>We share data only with the sub-processors required to run the Service: Supabase (database & auth), LemonSqueezy (payments), Google (Gemini AI, Analytics), and Cloudflare (edge hosting). We never sell personal data.</p>

          <h2 className="text-xl font-semibold text-foreground">6. Your rights</h2>
          <p>You may access, export, correct, or delete your personal data at any time from Dashboard → Settings. GDPR and CCPA requests can also be sent to privacy@nexatools.cloud and are answered within 30 days.</p>

          <h2 className="text-xl font-semibold text-foreground">7. Security</h2>
          <p>All traffic is HTTPS. Passwords are hashed with bcrypt. API keys are stored as SHA-256 hashes. Database access uses row-level security so users can only read their own rows.</p>

          <h2 className="text-xl font-semibold text-foreground">8. Children</h2>
          <p>Nexatools is not directed at children under 13 and we do not knowingly collect data from them.</p>

          <h2 className="text-xl font-semibold text-foreground">9. Changes</h2>
          <p>Material changes will be announced by email at least 14 days before taking effect.</p>

          <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
          <p>Questions? Email <a href="mailto:privacy@nexatools.cloud" className="text-primary">privacy@nexatools.cloud</a>.</p>
        </div>
      </article>
    </SiteLayout>
  ),
});