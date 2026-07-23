import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Tpl = "formal" | "casual" | "urgent";

export default function Tool() {
  const [company, setCompany] = useState("Acme Retail Co.");
  const [name, setName] = useState("Alex Smith");
  const [email, setEmail] = useState("alex@acme.com");
  const [product, setProduct] = useState("Cotton T-shirts, 180gsm, white, sizes S–XXL");
  const [qty, setQty] = useState(5000);
  const [target, setTarget] = useState(3.5);
  const [deadline, setDeadline] = useState("2026-09-30");
  const [tpl, setTpl] = useState<Tpl>("formal");

  const rfq = useMemo(() => {
    const intro: Record<Tpl, string> = {
      formal: `Dear Supplier,\n\nMy name is ${name}, and I represent ${company}. We are evaluating suppliers for the following item and would like to request your quotation.`,
      casual: `Hi there,\n\nI'm ${name} at ${company}. We're looking to source the following and wanted to see if you can help.`,
      urgent: `URGENT RFQ — Need response by ${deadline}\n\n${name}, ${company}`,
    };
    return `${intro[tpl]}\n\nPRODUCT SPECIFICATIONS\n${product}\n\nQuantity: ${qty.toLocaleString()} units\nTarget FOB price: $${target.toFixed(2)}/unit\nDelivery required by: ${deadline}\nPayment terms: T/T 30% deposit, 70% before shipment (open to discussion)\nIncoterm: FOB (open to CIF/DDP quotes)\n\nPlease include in your quote:\n1. Unit price at target quantity\n2. Available MOQ tiers and price breaks\n3. Lead time from PO confirmation\n4. Sample availability and cost\n5. Certifications available (ISO, BSCI, OEKO-TEX etc.)\n6. Payment terms flexibility\n\nContact: ${email}\n\nLooking forward to your reply.\n\nBest regards,\n${name}\n${company}`;
  }, [company, name, email, product, qty, target, deadline, tpl]);

  const download = () => {
    const b = new Blob([rfq], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "rfq.txt"; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Your company</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1"/></div>
        <div><Label>Your name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1"/></div>
        <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1"/></div>
        <div><Label>Template</Label><Select value={tpl} onValueChange={(v) => setTpl(v as Tpl)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="formal">Formal</SelectItem><SelectItem value="casual">Casual</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
        <div className="sm:col-span-2"><Label>Product spec</Label><Textarea rows={2} value={product} onChange={(e) => setProduct(e.target.value)} className="mt-1"/></div>
        <div><Label>Quantity</Label><Input type="number" value={qty} onChange={(e) => setQty(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Target price/unit</Label><Input type="number" step="0.01" value={target} onChange={(e) => setTarget(+e.target.value || 0)} className="mt-1"/></div>
        <div className="sm:col-span-2"><Label>Deadline</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1"/></div>
      </div>
      <Textarea rows={16} readOnly value={rfq} className="font-mono text-xs"/>
      <div className="flex gap-2"><Button variant="outline" onClick={() => { navigator.clipboard.writeText(rfq); toast.success("Copied"); }}>Copy</Button><Button variant="outline" onClick={download}>Download .txt</Button></div>
    </div>
  );
}