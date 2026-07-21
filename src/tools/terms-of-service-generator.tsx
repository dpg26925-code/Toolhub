import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Biz = "blog" | "ecommerce" | "saas" | "app";
type Dispute = "arbitration" | "litigation";

export default function TermsOfServiceGenerator() {
  const [name, setName] = useState("Acme Inc.");
  const [url, setUrl] = useState("https://example.com");
  const [biz, setBiz] = useState<Biz>("saas");
  const [jurisdiction, setJurisdiction] = useState("Delaware, USA");
  const [law, setLaw] = useState("the State of Delaware, USA");
  const [dispute, setDispute] = useState<Dispute>("arbitration");
  const [email, setEmail] = useState("legal@example.com");
  const [effective, setEffective] = useState(new Date().toISOString().slice(0, 10));

  const terms = useMemo(() => buildTerms({ name, url, biz, jurisdiction, law, dispute, email, effective }), [name, url, biz, jurisdiction, law, dispute, email, effective]);

  const download = () => {
    const blob = new Blob([terms], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "terms-of-service.txt";
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
        <div><Label>Jurisdiction / venue</Label><Input value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="mt-1" placeholder="e.g. Delaware, USA" /></div>
        <div><Label>Governing law</Label><Input value={law} onChange={(e) => setLaw(e.target.value)} className="mt-1" placeholder="e.g. the State of Delaware, USA" /></div>
        <div>
          <Label>Dispute resolution</Label>
          <Select value={dispute} onValueChange={(v) => setDispute(v as Dispute)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="arbitration">Binding arbitration</SelectItem>
              <SelectItem value="litigation">Court litigation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Contact email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
        <div><Label>Effective date</Label><Input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} className="mt-1" /></div>
      </div>

      <div>
        <Label>Generated Terms of Service</Label>
        <Textarea readOnly value={terms} className="mt-1 min-h-[400px] font-mono text-xs" />
        <div className="mt-2 flex gap-2">
          <Button onClick={() => { navigator.clipboard.writeText(terms); toast.success("Copied"); }}>Copy</Button>
          <Button variant="outline" onClick={download}>Download .txt</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Disclaimer:</strong> This template is not legal advice. Have a qualified attorney review your Terms of Service before publishing.
      </div>
    </div>
  );
}

function buildTerms(p: { name: string; url: string; biz: Biz; jurisdiction: string; law: string; dispute: "arbitration" | "litigation"; email: string; effective: string; }): string {
  const service = { blog: "content website", ecommerce: "online store", saas: "software-as-a-service platform", app: "mobile application" }[p.biz];

  const disputeBlock = p.dispute === "arbitration"
    ? `Any dispute arising out of or related to these Terms or the Service shall be resolved by final and binding arbitration administered under the commercial rules of a recognized arbitration body, held in ${p.jurisdiction}. You and ${p.name} waive any right to a jury trial and to participate in a class action.`
    : `Any dispute arising out of or related to these Terms or the Service shall be resolved exclusively in the state or federal courts located in ${p.jurisdiction}. You and ${p.name} consent to the personal jurisdiction of those courts.`;

  return `TERMS OF SERVICE

Effective date: ${p.effective}

These Terms of Service ("Terms") govern your access to and use of the ${service} operated by ${p.name} ("we", "us", "our") at ${p.url} (the "Service"). By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.

1. ACCEPTANCE OF TERMS

By creating an account, accessing or using the Service, you represent that you are at least 18 years old (or the age of majority in your jurisdiction) and have the legal capacity to enter into a binding agreement. If you use the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.

2. INTELLECTUAL PROPERTY

The Service and all content, features and functionality (including but not limited to text, graphics, logos, icons, images, audio, video and software) are owned by ${p.name} or its licensors and are protected by copyright, trademark and other intellectual property laws. Except as expressly permitted, you may not copy, modify, distribute, sell, lease or create derivative works of any part of the Service.

You retain ownership of content you submit to the Service. By submitting content, you grant ${p.name} a worldwide, non-exclusive, royalty-free licence to host, store, reproduce and display that content solely to operate and improve the Service.

3. USER RESPONSIBILITIES

You agree not to:
  • Use the Service in any manner that violates applicable law
  • Attempt to gain unauthorized access to the Service, other accounts, or related systems
  • Interfere with, disrupt or place undue load on the Service
  • Upload viruses, malware or any code that could harm the Service or its users
  • Use automated means (scrapers, bots) to access the Service except as permitted by our API terms
  • Impersonate any person or misrepresent your affiliation with any entity
  • Use the Service to send unsolicited communications ("spam")

You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.

4. FEES AND PAYMENT

Certain features of the Service may require payment of fees. All fees are stated in the currency shown at checkout and are non-refundable except as required by law or expressly stated. We may change fees at any time; changes apply prospectively.

5. DISCLAIMER OF WARRANTIES

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT AND UNINTERRUPTED OR ERROR-FREE OPERATION.

6. LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${p.name.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE. OUR AGGREGATE LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS PAID BY YOU TO US IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) US$100.

7. INDEMNIFICATION

You agree to indemnify and hold harmless ${p.name}, its affiliates, officers, employees and agents from and against any claims, liabilities, damages, losses and expenses (including reasonable attorneys' fees) arising out of or related to your use of the Service, your content, or your breach of these Terms.

8. TERMINATION

We may suspend or terminate your access to the Service at any time, with or without notice, for any reason including breach of these Terms. Upon termination, your right to use the Service ceases immediately. Sections that by their nature should survive termination will survive, including intellectual property, disclaimers, limitation of liability, indemnification and governing law.

9. GOVERNING LAW AND DISPUTES

These Terms are governed by the laws of ${p.law}, without regard to its conflict-of-laws principles. ${disputeBlock}

10. CHANGES TO THESE TERMS

We may modify these Terms at any time. Material changes will be announced on the Service or by email. Continued use after the effective date of the revised Terms constitutes acceptance.

11. CONTACT

Questions about these Terms should be sent to:
  ${p.name}
  ${p.email}
  ${p.url}

— End of Terms of Service —
`;
}
