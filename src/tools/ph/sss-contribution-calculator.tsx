import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fmt, copy } from "../_acc";
import { Copy, Printer, Info } from "lucide-react";

export default function SSSCalculator() {
  const [salary, setSalary] = useState(25000);
  const [status, setStatus] = useState("employed");

  const r = useMemo(() => {
    // SSS 2024 Simplified Brackets (Rate is approx 14% total)
    // 9.5% Employer, 4.5% Employee
    // Ceiling: PHP 30,000 for regular SSS, Mandatory Provident Fund (WISP) above 20k
    
    // For the prompt's simplicity and requested logic:
    // Salary brackets: PHP 5,000, 5,001-7,500, up to 35,000+
    
    let eeRate = 0.045;
    let erRate = 0.095;
    let ecc = status === "employed" ? 10 : 0; // Employer Compensation Commission

    if (salary > 15000) ecc = 30; // Increased ECC for higher salary

    let eeContribution = salary * eeRate;
    let erContribution = salary * erRate;

    // Max caps (2024 approximation)
    const ceiling = 30000;
    if (salary > ceiling) {
      eeContribution = ceiling * eeRate;
      erContribution = ceiling * erRate;
    }

    const total = eeContribution + erContribution + ecc;

    return {
      eeContribution,
      erContribution,
      ecc,
      total,
      annualTotal: total * 12,
      bracket: salary <= 5000 ? "Below 5,000" : salary <= 35000 ? `${fmt(Math.floor(salary/500)*500)} - ${fmt(Math.floor(salary/500)*500 + 499)}` : "35,000+"
    };
  }, [salary, status]);

  const handlePrint = () => window.print();
  const handleCopy = () => {
    copy(`SSS Contribution Estimate:
Employee: ₱${fmt(r.eeContribution)}
Employer: ₱${fmt(r.erContribution)}
ECC: ₱${fmt(r.ecc)}
Total Monthly: ₱${fmt(r.total)}
Calculated via Nexatools`);
    toast.success("Result copied to clipboard");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1">
      <div className="grid gap-4 sm:grid-cols-2 bg-card p-6 rounded-xl border border-border print:hidden">
        <div className="space-y-2">
          <Label htmlFor="salary">Monthly Basic Salary (₱)</Label>
          <Input 
            id="salary"
            type="number" 
            value={salary} 
            onChange={(e) => setSalary(Math.max(0, +e.target.value))} 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Employment Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employed">Employed (Private)</SelectItem>
              <SelectItem value="self-employed">Self-Employed / Voluntary</SelectItem>
              <SelectItem value="ofw">OFW</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Monthly SSS Contribution</h2>
        <div className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">
          ₱{fmt(r.total)}
        </div>
        <p className="text-sm text-muted-foreground">
          EE: ₱{fmt(r.eeContribution)} | ER: ₱{fmt(r.erContribution)} | ECC: ₱{fmt(r.ecc)}
        </p>
      </div>

      <div className="space-y-6 bg-card p-6 rounded-xl border border-border">
        <h3 className="text-lg font-semibold">Contribution Table</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 font-medium">Type</th>
                <th className="text-right py-2 font-medium">Monthly Share</th>
                <th className="text-right py-2 font-medium">Annual Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 font-medium">Employee Share</td>
                <td className="text-right py-3">₱{fmt(r.eeContribution)}</td>
                <td className="text-right py-3 text-muted-foreground">₱{fmt(r.eeContribution * 12)}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 font-medium">Employer Share</td>
                <td className="text-right py-3">₱{fmt(r.erContribution)}</td>
                <td className="text-right py-3 text-muted-foreground">₱{fmt(r.erContribution * 12)}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 font-medium text-blue-500">ECC (Employer-only)</td>
                <td className="text-right py-3">₱{fmt(r.ecc)}</td>
                <td className="text-right py-3 text-muted-foreground">₱{fmt(r.ecc * 12)}</td>
              </tr>
              <tr className="font-bold text-primary">
                <td className="py-3">Grand Total</td>
                <td className="text-right py-3">₱{fmt(r.total)}</td>
                <td className="text-right py-3">₱{fmt(r.annualTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-border flex justify-between items-center text-sm">
          <span className="text-muted-foreground uppercase font-medium">Salary Bracket</span>
          <span className="font-bold text-primary">{r.bracket}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button onClick={handleCopy} variant="outline" className="gap-2">
          <Copy className="w-4 h-4" /> Copy Result
        </Button>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="w-4 h-4" /> Print PDF
        </Button>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg text-xs text-muted-foreground flex gap-3 italic">
        <Info className="w-4 h-4 shrink-0" />
        <p>Disclaimer: Based on 2024 SSS schedules. Verify with SSS for exact contributions.</p>
      </div>
    </div>
  );
}
