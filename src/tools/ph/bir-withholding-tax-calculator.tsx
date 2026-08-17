import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt, copy } from "../_acc";
import { Copy, Printer, Info } from "lucide-react";

export default function BIRTaxCalculator() {
  const [gross, setGross] = useState(30000);
  const [deductions, setDeductions] = useState(2500); // SSS+PagIBIG+PhilHealth estimate
  const [dependents, setDependents] = useState(0);

  const r = useMemo(() => {
    const annualGross = gross * 12;
    const annualDeductions = deductions * 12;
    const taxableIncome = Math.max(0, annualGross - annualDeductions);
    
    // Tax Brackets 2024
    let taxDue = 0;
    let bracket = "";

    if (taxableIncome <= 250000) {
      taxDue = 0;
      bracket = "0% (Exempt)";
    } else if (taxableIncome <= 400000) {
      taxDue = (taxableIncome - 250000) * 0.15;
      bracket = "15% of excess over 250,000";
    } else if (taxableIncome <= 800000) {
      taxDue = 22500 + (taxableIncome - 400000) * 0.20;
      bracket = "PHP 22,500 + 20% of excess over 400,000";
    } else if (taxableIncome <= 2000000) {
      taxDue = 102500 + (taxableIncome - 800000) * 0.25;
      bracket = "PHP 102,500 + 25% of excess over 800,000";
    } else if (taxableIncome <= 8000000) {
      taxDue = 402500 + (taxableIncome - 2000000) * 0.30;
      bracket = "PHP 402,500 + 30% of excess over 2,000,000";
    } else {
      taxDue = 2302500 + (taxableIncome - 8000000) * 0.35;
      bracket = "PHP 2,302,500 + 35% of excess over 8,000,000";
    }

    const monthlyTax = taxDue / 12;
    const monthlyNet = gross - deductions - monthlyTax;

    return {
      annualGross,
      annualDeductions,
      taxableIncome,
      taxDue,
      monthlyTax,
      monthlyNet,
      bracket
    };
  }, [gross, deductions]);

  const handlePrint = () => window.print();
  const handleCopy = () => {
    copy(`BIR Withholding Tax Estimate:
Gross Monthly: ₱${fmt(gross)}
Monthly Withholding Tax: ₱${fmt(r.monthlyTax)}
Monthly Net Pay: ₱${fmt(r.monthlyNet)}
Calculated via Nexatools`);
    toast.success("Result copied to clipboard");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1">
      <div className="grid gap-4 sm:grid-cols-2 bg-card p-6 rounded-xl border border-border print:hidden">
        <div className="space-y-2">
          <Label htmlFor="gross">Monthly Gross Salary (₱)</Label>
          <Input id="gross" type="number" value={gross} onChange={(e) => setGross(Math.max(0, +e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deduct">Other Deductions (Monthly SSS/PH/PI) (₱)</Label>
          <Input id="deduct" type="number" value={deductions} onChange={(e) => setDeductions(Math.max(0, +e.target.value))} />
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estimated Monthly Withholding Tax</h2>
        <div className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">
          ₱{fmt(r.monthlyTax)}
        </div>
        <p className="text-sm text-muted-foreground">Monthly Take Home: ₱{fmt(r.monthlyNet)}</p>
      </div>

      <div className="space-y-6 bg-card p-6 rounded-xl border border-border">
        <h3 className="text-lg font-semibold">Tax Calculation Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Annual Taxable Income" value={`₱${fmt(r.taxableIncome)}`} />
          <Stat label="Annual Tax Due" value={`₱${fmt(r.taxDue)}`} />
          <Stat label="Monthly Tax" value={`₱${fmt(r.monthlyTax)}`} />
        </div>
        <div className="pt-4 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground mb-1">Applicable Tax Bracket</p>
          <p className="text-sm font-semibold">{r.bracket}</p>
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
        <p>Disclaimer: Based on BIR 2024 withholding tax tables. For estimation only; consult BIR or HR for official payroll computations.</p>
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
