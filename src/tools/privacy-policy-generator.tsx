import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Biz = "blog" | "ecommerce" | "saas" | "app";
type Jurisdiction = "us" | "eu" | "vn" | "other";

const DATA_ITEMS = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email address" },
  { id: "payment", label: "Payment / billing info" },
  { id: "analytics", label: "Analytics & usage" },
  { id: "cookies", label: "Cookies" },
  { id: "location", label: "IP / approximate location" },
];

const SERVICES = [
  "Google Analytics",
  "Stripe",
  "PayPal",
  "Facebook Pixel",
  "Google Ads",
  "Mailchimp",
  "Cloudflare",
  "OpenAI",
];

const JURISDICTION_CLAUSE: Record<Jurisdiction, string> = {
  us: "This policy is written to align with the California Consumer Privacy Act (CCPA/CPRA) and the FTC Act. California residents have additional rights described in the \"Your rights\" section below.",
  eu: "This policy is written to align with the EU General Data Protection Regulation (GDPR) and the UK Data Protection Act 2018. The legal bases for processing include consent, contract performance and legitimate interest.",
  vn: "This policy is written to align with Vietnam's Personal Data Protection Decree (13/2023/NĐ-CP) and the Law on Cyber Information Security.",
  other: "This policy is written using widely accepted international data-protection principles. Users in other jurisdictions may have additional statutory rights.",
};

export default function PrivacyPolicyGenerator() {
  const [name, setName] = useState("Acme Inc.");
  const [url, setUrl] = useState("https://example.com");
  const [biz, setBiz] = useState<Biz>("saas");
  const [juris, setJuris] = useState<Jurisdiction>("us");
  const [email, setEmail] = useState("privacy@example.com");
  const [dataSel, setDataSel] = useState<string[]>(["name", "email", "analytics", "cookies"]);
  const [services, setServices] = useState<string[]>(["Google Analytics", "Stripe"]);
  const [effective, setEffective] = useState(new Date().toISOString().slice(0, 10));

  const toggle = <T,>(arr: T[], v: T) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const policy = useMemo(() => buildPolicy({ name, url, biz, juris, email, dataSel, services, effective }), [name, url, biz, juris, email, dataSel, services, effective]);

  const download = () => {
    const blob = new Blob([policy], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "privacy-policy.txt";
    a.click();
    toast.success("Downloaded");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Business name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
        <div><Label>Website URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1" /></div>
        <div>
          <Label>Business type</Label>
          <Select value={biz} onValueChange={(v) => setBiz(v as Biz)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="blog">Blog / content site</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="saas">SaaS / web app</SelectItem>
              <SelectItem value="app">Mobile app</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Jurisdiction</Label>
          <Select value={juris} onValueChange={(v) => setJuris(v as Jurisdiction)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States (CCPA)</SelectItem>
              <SelectItem value="eu">European Union / UK (GDPR)</SelectItem>
              <SelectItem value="vn">Vietnam</SelectItem>
              <SelectItem value="other">Other / International</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Contact email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
        <div><Label>Effective date</Label><Input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} className="mt-1" /></div>
      </div>

      <div>
        <Label>Data you collect</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {DATA_ITEMS.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={dataSel.includes(d.id)} onCheckedChange={() => setDataSel(toggle(dataSel, d.id))} />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Third-party services</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-4">
          {SERVICES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm">
              <Checkbox checked={services.includes(s)} onCheckedChange={() => setServices(toggle(services, s))} />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Generated privacy policy</Label>
        <Textarea readOnly value={policy} className="mt-1 min-h-[400px] font-mono text-xs" />
        <div className="mt-2 flex gap-2">
          <Button onClick={() => { navigator.clipboard.writeText(policy); toast.success("Copied"); }}>Copy</Button>
          <Button variant="outline" onClick={download}>Download .txt</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Disclaimer:</strong> This template is not legal advice. Have a qualified attorney review the policy before publishing, especially if you handle children's data, health data, financial data or operate in a regulated industry.
      </div>
    </div>
  );
}

function buildPolicy(p: {
  name: string; url: string; biz: Biz; juris: Jurisdiction; email: string;
  dataSel: string[]; services: string[]; effective: string;
}): string {
  const dataLabels = DATA_ITEMS.filter((d) => p.dataSel.includes(d.id)).map((d) => d.label);
  const bizLabel = { blog: "content website", ecommerce: "online store", saas: "software-as-a-service platform", app: "mobile application" }[p.biz];

  const rightsBlock = p.juris === "eu"
    ? "Under GDPR you have the right to: access your data, rectify inaccurate data, request erasure (\"right to be forgotten\"), restrict processing, data portability, object to processing, and lodge a complaint with your local supervisory authority."
    : p.juris === "us"
    ? "California residents (CCPA/CPRA) have the right to: know what personal information is collected, delete personal information, correct inaccurate information, opt out of the sale or sharing of personal information, and limit use of sensitive personal information. We do not sell your personal information."
    : p.juris === "vn"
    ? "You have the right to be informed about processing, access your data, request correction or deletion, withdraw consent, object to processing, and file a complaint with the Ministry of Public Security."
    : "You have the right to request access to, correction of, or deletion of your personal data. You may also object to certain processing and, where applicable, request data portability.";

  return `PRIVACY POLICY

Effective date: ${p.effective}

This Privacy Policy describes how ${p.name} ("we", "us", "our") collects, uses and shares information when you use our ${bizLabel} at ${p.url} (the "Service"). ${JURISDICTION_CLAUSE[p.juris]}

1. INFORMATION WE COLLECT

We collect the following categories of information:
${dataLabels.map((l) => `  • ${l}`).join("\n")}

We collect this information when you: create an account, contact us, subscribe to a newsletter, make a purchase, or interact with the Service.

2. HOW WE USE INFORMATION

We use the information we collect to:
  • Operate, maintain and improve the Service
  • Process transactions and send related information
  • Respond to inquiries and provide customer support
  • Send administrative information and, where you have opted in, marketing communications
  • Detect, investigate and prevent fraudulent or unauthorized activity
  • Comply with legal obligations

3. HOW WE SHARE INFORMATION

We do not sell your personal information. We share information only with:
  • Service providers that help us operate the Service (hosting, analytics, payment processing, email delivery)
  • Government authorities when required by law, subpoena or court order
  • A successor entity in the event of a merger, acquisition or sale of assets

The third-party services we currently use include: ${p.services.length ? p.services.join(", ") : "none"}. Each provider processes data under its own privacy policy.

4. COOKIES AND TRACKING TECHNOLOGIES

We use cookies and similar technologies to remember your preferences, keep you signed in and understand how the Service is used. You can control cookies through your browser settings. Disabling cookies may reduce the functionality of the Service.

5. DATA RETENTION

We retain personal information for as long as necessary to provide the Service, comply with our legal obligations, resolve disputes and enforce our agreements. Account data is deleted within 30 days of account closure, subject to legal retention requirements.

6. DATA SECURITY

We implement reasonable administrative, technical and physical safeguards designed to protect your information. However, no internet transmission or electronic storage is 100% secure. We cannot guarantee absolute security.

7. YOUR RIGHTS

${rightsBlock}

To exercise any of these rights, contact us at ${p.email}. We will respond within the timeframe required by applicable law.

8. CHILDREN'S PRIVACY

The Service is not directed to children under 13 (or under 16 in the EU). We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, contact us and we will delete it.

9. INTERNATIONAL TRANSFERS

We may transfer, store and process your information in countries other than your own. Where required by law, we implement appropriate safeguards such as standard contractual clauses.

10. CHANGES TO THIS POLICY

We may update this policy from time to time. Material changes will be announced on the Service or by email. Continued use after the effective date constitutes acceptance of the updated policy.

11. CONTACT

If you have questions about this policy or our data practices, contact:
  ${p.name}
  ${p.email}
  ${p.url}

— End of Privacy Policy —
`;
}
