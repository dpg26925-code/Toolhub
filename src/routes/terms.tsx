import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Nexatools" },
      { name: "description", content: "Terms of service for using Nexatools." },
      { property: "og:title", content: "Terms of Service — Nexatools" },
      { property: "og:description", content: "Terms of service for using Nexatools." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-muted-foreground">
          <p>These Terms of Service ("Terms") govern your use of nexatools.cloud and the tools, APIs and content available through it (the "Service"), operated by Nexatools ("we", "us"). By creating an account or using the Service, you agree to these Terms.</p>

          <h2 className="text-xl font-semibold text-foreground">1. Eligibility</h2>
          <p>You must be at least 13 years old to use Nexatools. By using the Service you represent that you meet this age requirement and that your use complies with all laws applicable to you.</p>

          <h2 className="text-xl font-semibold text-foreground">2. Accounts</h2>
          <p>You are responsible for keeping your credentials secure and for all activity under your account. Notify us at <a href="mailto:support@nexatools.cloud" className="text-primary">support@nexatools.cloud</a> as soon as you suspect unauthorised access.</p>

          <h2 className="text-xl font-semibold text-foreground">3. Plans, credits and billing</h2>
          <p>Free accounts receive 10 credits refilled daily. Pro subscriptions ($20 / month) unlock unlimited AI usage, API access with a 100 req/min rate limit, and remove ads. Billing is handled by LemonSqueezy; charges recur monthly until you cancel. Subscriptions come with a 14-day money-back guarantee.</p>

          <h2 className="text-xl font-semibold text-foreground">4. Acceptable use</h2>
          <p>You may not use the Service to (a) process content that is illegal, infringing or abusive, (b) attempt to break, overload or reverse-engineer the Service, (c) resell API access without a written agreement, or (d) circumvent the credit and rate-limit systems. We may suspend accounts that violate this section.</p>

          <h2 className="text-xl font-semibold text-foreground">5. User content</h2>
          <p>You retain all rights to content you submit ("Input") and to output the tools generate for you ("Output"). You grant us a limited licence to process Input solely to provide the Service. We do not use Input to train AI models. See our <a href="/privacy" className="text-primary">Privacy Policy</a> for retention details.</p>

          <h2 className="text-xl font-semibold text-foreground">6. Intellectual property</h2>
          <p>The Nexatools brand, website design and source code are owned by us. Open-source components remain under their respective licences.</p>

          <h2 className="text-xl font-semibold text-foreground">7. AI output disclaimer</h2>
          <p>AI-generated Output may contain errors or omissions. You are responsible for reviewing Output before relying on or publishing it. We provide no warranty as to accuracy, completeness or fitness for a particular purpose.</p>

          <h2 className="text-xl font-semibold text-foreground">8. Termination</h2>
          <p>You may close your account at any time from Dashboard → Settings. We may suspend or terminate accounts that breach these Terms, with a reasonable opportunity to cure where practical.</p>

          <h2 className="text-xl font-semibold text-foreground">9. Warranty disclaimer</h2>
          <p>The Service is provided "as is" without warranty of any kind. To the maximum extent permitted by law we disclaim all implied warranties of merchantability, fitness for purpose and non-infringement.</p>

          <h2 className="text-xl font-semibold text-foreground">10. Limitation of liability</h2>
          <p>To the maximum extent permitted by law our aggregate liability for any claim arising out of these Terms is limited to the fees you paid us in the 12 months preceding the claim.</p>

          <h2 className="text-xl font-semibold text-foreground">11. Changes</h2>
          <p>We may update these Terms from time to time. Material changes will be announced by email at least 14 days before they take effect.</p>

          <h2 className="text-xl font-semibold text-foreground">12. Governing law</h2>
          <p>These Terms are governed by the laws of the jurisdiction in which Nexatools is established, without regard to conflict-of-laws rules.</p>

          <h2 className="text-xl font-semibold text-foreground">13. Contact</h2>
          <p>Questions about these Terms? Email <a href="mailto:support@nexatools.cloud" className="text-primary">support@nexatools.cloud</a>.</p>
        </div>
      </article>
    </SiteLayout>
  ),
});