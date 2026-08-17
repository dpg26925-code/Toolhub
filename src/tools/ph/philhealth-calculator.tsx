import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "../_acc";
import { Copy, Printer, Info } from "lucide-react";

export default function PhilHealthCalculator() {
  const [salary, setSalary] = useState(25000);

  const r = useMemo(() => {
    // PhilHealth 2024: 5.5% Total Premium
    // 2.75% Employee, 2.75% Employer
    // Floor: 10,000, Ceiling: 100,000
    
    const floor = 10000;
    const ceiling = 100000;
    const rate = 0.055;

    const baseSalary = Math.min(Math.max(salary, floor), ceiling);
    const total = baseSalary * rate;
    const eeContribution = total / 2;
    const erContribution = total / 2;

    return {
      eeContribution,
      erContribution,
      total,
      annualTotal: total * 12,
      effectiveRate: (total / salary) * 100,
    };
  }, [salary]);

  const handlePrint = () => window.print();
  const handleCopy = () => {
    copy(`PhilHealth Contribution Estimate:
Employee: ₱${fmt(r.eeContribution)}
Employer: ₱${fmt(r.erContribution)}
Total Monthly: ₱${fmt(r.total)}
Annual Total: ₱${fmt(r.annualTotal)}
Calculated via Nexatools`);
    toast.success("Result copied to clipboard");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1">
      <div className="bg-card p-6 rounded-xl border border-border print:hidden">
        <div className="space-y-2">
          <Label htmlFor="salary">Monthly Basic Salary (₱)</Label>
          <Input 
            id="salary"
            type="number" 
            value={salary} 
            onChange={(e) => setSalary(Math.max(0, +e.target.value))} 
          />
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Monthly PhilHealth Premium</h2>
        <div className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">
          ₱{fmt(r.total)}
        </div>
        <p className="text-sm text-muted-foreground">
          Employee: ₱{fmt(r.eeContribution)} | Employer: ₱{fmt(r.erContribution)}
        </p>
      </div>

      <div className="space-y-6 bg-card p-6 rounded-xl border border-border">
        <h3 className="text-lg font-semibold">Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Employee Share (2.75%)" value={`₱${fmt(r.eeContribution)}`} />
          <Stat label="Employer Share (2.75%)" value={`₱${fmt(r.erContribution)}`} />
          <Stat label="Total Monthly" value={`₱${fmt(r.total)}`} />
          <Stat label="Annual Total" value={`₱${fmt(r.annualTotal)}`} />
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
        <p>Disclaimer: Based on 2024 PhilHealth rates. Verify with PhilHealth for exact premiums.</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground uppercase">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
