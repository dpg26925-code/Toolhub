import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Term = "EXW" | "FOB" | "CIF" | "DAP" | "DDP";
const RESP: Record<Term, { seller: string[]; buyer: string[] }> = {
  EXW: { seller: ["Goods at premises"], buyer: ["Loading","Export clearance","Freight","Insurance","Import clearance","Duties","Delivery"] },
  FOB: { seller: ["Goods loaded on vessel","Export clearance"], buyer: ["Ocean freight","Insurance","Import clearance","Duties","Delivery"] },
  CIF: { seller: ["Goods on vessel","Ocean freight","Minimum insurance","Export clearance"], buyer: ["Import clearance","Duties","Delivery"] },
  DAP: { seller: ["Delivery to buyer premises","All freight","Export clearance"], buyer: ["Import clearance","Duties","Unloading"] },
  DDP: { seller: ["Everything to buyer door incl. duties"], buyer: ["Unloading only"] },
};

export default function Tool() {
  const [term, setTerm] = useState<Term>("FOB");
  const [goods, setGoods] = useState(10000);
  const [export_c, setExport] = useState(200);
  const [ocean, setOcean] = useState(800);
  const [insurance, setInsurance] = useState(50);
  const [importC, setImport] = useState(150);
  const [duty, setDuty] = useState(500);
  const [inland, setInland] = useState(300);

  const totals = useMemo(() => {
    const items = [{ n: "Goods", v: goods, seller: ["EXW","FOB","CIF","DAP","DDP"] }, { n: "Export clearance", v: export_c, seller: ["FOB","CIF","DAP","DDP"] }, { n: "Ocean freight", v: ocean, seller: ["CIF","DAP","DDP"] }, { n: "Insurance", v: insurance, seller: ["CIF","DAP","DDP"] }, { n: "Import clearance", v: importC, seller: ["DDP"] }, { n: "Duties", v: duty, seller: ["DDP"] }, { n: "Inland delivery", v: inland, seller: ["DAP","DDP"] }];
    const sellerTotal = items.filter((i) => i.seller.includes(term)).reduce((s, i) => s + i.v, 0);
    const buyerTotal = items.filter((i) => !i.seller.includes(term)).reduce((s, i) => s + i.v, 0);
    return { sellerTotal, buyerTotal, landed: sellerTotal + buyerTotal, items };
  }, [term, goods, export_c, ocean, insurance, importC, duty, inland]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div><Label>Incoterm</Label><Select value={term} onValueChange={(v) => setTerm(v as Term)}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
          <SelectContent>{(["EXW","FOB","CIF","DAP","DDP"] as Term[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Goods ($)</Label><Input type="number" value={goods} onChange={(e) => setGoods(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Export clearance</Label><Input type="number" value={export_c} onChange={(e) => setExport(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Ocean freight</Label><Input type="number" value={ocean} onChange={(e) => setOcean(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Insurance</Label><Input type="number" value={insurance} onChange={(e) => setInsurance(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Import clearance</Label><Input type="number" value={importC} onChange={(e) => setImport(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Duties</Label><Input type="number" value={duty} onChange={(e) => setDuty(+e.target.value || 0)} className="mt-1"/></div>
        <div><Label>Inland delivery</Label><Input type="number" value={inland} onChange={(e) => setInland(+e.target.value || 0)} className="mt-1"/></div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-3"><h3 className="text-sm font-semibold text-emerald-500">Seller pays: ${totals.sellerTotal.toLocaleString()}</h3><ul className="mt-2 space-y-1 text-sm">{RESP[term].seller.map((r) => <li key={r}>• {r}</li>)}</ul></div>
        <div className="rounded-lg border p-3"><h3 className="text-sm font-semibold text-blue-500">Buyer pays: ${totals.buyerTotal.toLocaleString()}</h3><ul className="mt-2 space-y-1 text-sm">{RESP[term].buyer.map((r) => <li key={r}>• {r}</li>)}</ul></div>
      </div>
      <div className="rounded-lg border bg-muted/30 p-4"><div className="text-xs text-muted-foreground">Total landed cost</div><div className="text-2xl font-bold text-primary">${totals.landed.toLocaleString()}</div></div>
    </div>
  );
}