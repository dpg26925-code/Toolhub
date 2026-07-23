import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DB: { code: string; desc: string; keywords: string[]; duty: string }[] = [
  { code: "8517.62", desc: "Wireless communication devices (Bluetooth, WiFi)", keywords: ["bluetooth","wifi","earbud","router","modem"], duty: "0%" },
  { code: "8471.30", desc: "Laptops and portable computers < 10kg", keywords: ["laptop","notebook","computer"], duty: "0%" },
  { code: "8544.42", desc: "Insulated cables with connectors", keywords: ["cable","usb","hdmi","charger cable"], duty: "2.6%" },
  { code: "6109.10", desc: "T-shirts, cotton, knitted", keywords: ["tshirt","t-shirt","cotton shirt"], duty: "16.5%" },
  { code: "6203.42", desc: "Men's cotton trousers", keywords: ["pants","trousers","jeans"], duty: "16.6%" },
  { code: "6402.99", desc: "Footwear with rubber/plastic soles", keywords: ["shoe","sneaker","boot","sandal"], duty: "37.5%" },
  { code: "9503.00", desc: "Toys, dolls, puzzles", keywords: ["toy","doll","puzzle","game"], duty: "0%" },
  { code: "3304.99", desc: "Beauty preparations (skincare, makeup)", keywords: ["skincare","cream","lipstick","makeup","cosmetic"], duty: "0%" },
  { code: "8501.31", desc: "DC motors < 750W", keywords: ["motor","dc motor"], duty: "4%" },
  { code: "8481.80", desc: "Valves for pipes / boilers", keywords: ["valve","tap","faucet"], duty: "3%" },
  { code: "9401.61", desc: "Upholstered wooden seats", keywords: ["chair","seat","sofa"], duty: "0%" },
  { code: "8443.32", desc: "Printers, network-connected", keywords: ["printer","3d printer"], duty: "0%" },
];

export default function Tool() {
  const [q, setQ] = useState("bluetooth earbuds");
  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return DB.map((row) => {
      const score = words.reduce((s, w) => s + (row.keywords.some((k) => k.includes(w) || w.includes(k)) ? 1 : 0) + (row.desc.toLowerCase().includes(w) ? 0.5 : 0), 0);
      return { ...row, score };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);
  }, [q]);
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">Reference only — Verify with your country's customs authority. Duty rates shown are typical USA MFN and change frequently.</div>
      <div><Label>Describe your product</Label><Input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1" placeholder="e.g. cotton t-shirt, wireless earbuds"/></div>
      <div className="space-y-2">
        {results.map((r) => (
          <div key={r.code} className="rounded-lg border p-3">
            <div className="flex items-center justify-between"><span className="font-mono text-lg font-bold">HS {r.code}</span><span className="rounded-full bg-muted px-2 py-0.5 text-xs">Duty ≈ {r.duty}</span></div>
            <div className="mt-1 text-sm">{r.desc}</div>
          </div>
        ))}
        {!results.length && <p className="text-sm text-muted-foreground">No matches. Try different keywords.</p>}
      </div>
    </div>
  );
}