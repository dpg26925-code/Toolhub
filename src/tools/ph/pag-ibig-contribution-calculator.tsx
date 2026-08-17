import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fmt, copy } from "../_acc";
import { Copy, Printer, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PagIbigCalculator() {
  const [salary, setSalary] = useState(20000);
  const [employmentType, setEmploymentType] = useState("private");
  const [membershipType, setMembershipType] = useState("new");

  const r = useMemo(() => {
    // Pag-IBIG 2024 Rules:
    // Salary brackets:
    // PHP 1,000-1,500: 1% employee, 2% employer
    // Above 1,500: 2% employee, 2% employer
    // Max contribution: PHP 200 each (based on 10,000 ceiling for 2% rate)
    
    let eeRate = 0.02;
    let erRate = 0.02;

    if (salary <= 1500) {
      eeRate = 0.01;
    }

    let eeContribution = salary * eeRate;
    let erContribution = salary * erRate;

    // Ceiling is PHP 200 as per prompt
    eeContribution = Math.min(eeContribution, 200);
    erContribution = Math.min(erContribution, 200);

    const total = eeContribution + erContribution;

    return {
      eeContribution,
      erContribution,
      total,
      annualTotal: total * 12,
      eeRate: eeRate * 100,
      erRate: erRate * 100,
      bracket: salary <= 1500 ? "PHP 1,000 - 1,500" : "Above PHP 1,500"
    };
  }, [salary]);

  const handlePrint = () => window.print();
  const handleCopy = () => {
    copy(`Pag-IBIG Contribution Estimate:
Employee: ₱${fmt(r.eeContribution)}
Employer: ₱${fmt(r.erContribution)}
Total Monthly: ₱${fmt(r.total)}
Annual Total: ₱${fmt(r.annualTotal)}
Calculated via Nexatools`);
    toast.success("Result copied to clipboard");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 bg-card p-6 rounded-xl border border-border print:hidden">
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
          <Label>Employment Type</Label>
          <Select value={employmentType} onValueChange={setEmploymentType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="government">Government</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Membership Type</Label>
          <Select value={membershipType} onValueChange={setMembershipType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="old">Old</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Monthly Contribution</h2>
        <div className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">
          ₱{fmt(r.total)}
        </div>
        <p className="text-sm text-muted-foreground">
          Employee: ₱{fmt(r.eeContribution)} | Employer: ₱{fmt(r.erContribution)}
        </p>
      </div>

      <div className="space-y-6 bg-card p-6 rounded-xl border border-border">
        <h3 className="text-lg font-semibold">Contribution Breakdown</h3>
        
        <div className="space-y-4">
          <div className="h-8 w-full bg-secondary rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${(r.eeContribution / r.total) * 100}%` }}
            />
            <div 
              className="h-full bg-orange-400" 
              style={{ width: `${(r.erContribution / r.total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Employee ({r.eeRate}%)</span>
            <span>Employer ({r.erRate}%)</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t border-border">
          <Stat label="Employee Share" value={`₱${fmt(r.eeContribution)}`} />
          <Stat label="Employer Share" value={`₱${fmt(r.erContribution)}`} />
          <Stat label="Total Monthly" value={`₱${fmt(r.total)}`} />
          <Stat label="Annual Total" value={`₱${fmt(r.annualTotal)}`} />
          <Stat label="Applicable Bracket" value={r.bracket} />
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
        <p>Disclaimer: Based on 2024 Pag-IBIG schedules. Verify with Pag-IBIG for exact calculations.</p>
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
