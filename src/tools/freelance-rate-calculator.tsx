import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Download, Briefcase, Sparkles, TrendingUp, DollarSign, Clock } from "lucide-react";

const PRESETS = [
  { name: "Junior Freelancer", salary: "60000", hours: "25", weeksOff: "3", expenses: "250", tax: "25", profit: "10" },
  { name: "Mid-Level Professional", salary: "95000", hours: "25", weeksOff: "4", expenses: "450", tax: "28", profit: "15" },
  { name: "Senior Specialist", salary: "150000", hours: "20", weeksOff: "5", expenses: "800", tax: "32", profit: "20" },
  { name: "Principal Consultant", salary: "220000", hours: "18", weeksOff: "6", expenses: "1200", tax: "35", profit: "25" },
];

export default function FreelanceRateCalculator() {
  const [annualNetSalary, setAnnualNetSalary] = useState("100000");
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState("25");
  const [weeksOffPerYear, setWeeksOffPerYear] = useState("4");
  const [monthlyExpenses, setMonthlyExpenses] = useState("500");
  const [taxRatePercent, setTaxRatePercent] = useState("28");
  const [profitBufferPercent, setProfitBufferPercent] = useState("15");
  const [copied, setCopied] = useState(false);

  const pSalary = Math.max(1000, parseFloat(annualNetSalary) || 1000);
  const pHours = Math.max(1, Math.min(60, parseFloat(billableHoursPerWeek) || 25));
  const pWeeksOff = Math.max(0, Math.min(26, parseFloat(weeksOffPerYear) || 4));
  const pExpenses = Math.max(0, parseFloat(monthlyExpenses) || 0);
  const pTax = Math.min(60, Math.max(0, parseFloat(taxRatePercent) || 0)) / 100;
  const pProfit = Math.min(50, Math.max(0, parseFloat(profitBufferPercent) || 0)) / 100;

  const calc = useMemo(() => {
    // 1. Working Time
    const workingWeeks = Math.max(1, 52 - pWeeksOff);
    const totalBillableHoursYear = workingWeeks * pHours;

    // 2. Annual Operating Costs
    const annualExpenses = pExpenses * 12;

    // 3. Gross Revenue Calculation
    // We need net salary S after paying tax T on (Gross - Expenses - ProfitBuffer)
    // Gross = (NetSalary / (1 - TaxRate)) + Expenses + (Gross * ProfitBuffer)
    // Gross * (1 - ProfitBuffer) = (NetSalary / (1 - TaxRate)) + Expenses
    const pretaxSalaryNeeded = pTax < 1 ? pSalary / (1 - pTax) : pSalary;
    const requiredGrossRevenue = (pretaxSalaryNeeded + annualExpenses) / (1 - pProfit);

    // Break-even revenue (no profit buffer)
    const breakEvenGrossRevenue = pretaxSalaryNeeded + annualExpenses;

    // 4. Rate Calculations
    const targetHourlyRate = totalBillableHoursYear > 0 ? requiredGrossRevenue / totalBillableHoursYear : 0;
    const breakEvenHourlyRate = totalBillableHoursYear > 0 ? breakEvenGrossRevenue / totalBillableHoursYear : 0;
    const premiumHourlyRate = targetHourlyRate * 1.3;

    // Standard Project & Retainer Rates
    const dayRate = targetHourlyRate * 8;
    const halfDayRate = targetHourlyRate * 4;
    const weeklyRate = targetHourlyRate * pHours;
    const monthlyRetainer = requiredGrossRevenue / 12;
    const standard40hProject = targetHourlyRate * 40;

    // Breakdown components
    const annualTaxesPaid = pretaxSalaryNeeded - pSalary;
    const annualProfitBuffer = requiredGrossRevenue * pProfit;

    return {
      workingWeeks,
      totalBillableHoursYear,
      annualExpenses,
      requiredGrossRevenue,
      breakEvenGrossRevenue,
      targetHourlyRate,
      breakEvenHourlyRate,
      premiumHourlyRate,
      dayRate,
      halfDayRate,
      weeklyRate,
      monthlyRetainer,
      standard40hProject,
      annualTaxesPaid,
      annualProfitBuffer,
    };
  }, [pSalary, pHours, pWeeksOff, pExpenses, pTax, pProfit]);

  const f = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const fDec = (n: number) => `$${n.toFixed(2)}`;

  const handleCopy = async () => {
    const text = `=== Freelance Rate Card & Financial Plan ===
Target Take-Home Salary: ${f(pSalary)} / year
Billable Workload: ${pHours} hrs/week (${calc.workingWeeks} working weeks/yr)
Annual Billable Hours: ${calc.totalBillableHoursYear.toLocaleString()} hrs

--- Recommended Rates ---
• Target Hourly Rate: ${fDec(calc.targetHourlyRate)}/hr
• Break-Even Floor Rate: ${fDec(calc.breakEvenHourlyRate)}/hr
• Premium / Value Rate: ${fDec(calc.premiumHourlyRate)}/hr
• Day Rate (8 hrs): ${f(calc.dayRate)}
• Weekly Retainer (${pHours} hrs): ${f(calc.weeklyRate)}
• Monthly Retainer: ${f(calc.monthlyRetainer)}
• 40-Hour Project Estimate: ${f(calc.standard40hProject)}

--- Required Revenue Breakdown ---
Required Gross Annual Revenue: ${f(calc.requiredGrossRevenue)}
- Target Net Take-Home: ${f(pSalary)}
- Estimated Taxes: ${f(calc.annualTaxesPaid)} (${(pTax * 100).toFixed(0)}%)
- Annual Business Overhead: ${f(calc.annualExpenses)}
- Business Rainy Day Reserve: ${f(calc.annualProfitBuffer)}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Freelance rate card copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Target Net Take-Home Salary", pSalary.toFixed(2)],
      ["Billable Hours per Week", pHours.toString()],
      ["Weeks Off per Year", pWeeksOff.toString()],
      ["Working Weeks per Year", calc.workingWeeks.toString()],
      ["Total Annual Billable Hours", calc.totalBillableHoursYear.toString()],
      ["Monthly Business Expenses", pExpenses.toFixed(2)],
      ["Estimated Tax Rate (%)", `${(pTax * 100).toFixed(1)}%`],
      ["Profit Buffer Margin (%)", `${(pProfit * 100).toFixed(1)}%`],
      ["Required Gross Annual Revenue", calc.requiredGrossRevenue.toFixed(2)],
      ["Required Monthly Revenue", calc.monthlyRetainer.toFixed(2)],
      [],
      ["Billing Format", "Rate ($)"],
      ["Minimum Break-Even Hourly Rate", calc.breakEvenHourlyRate.toFixed(2)],
      ["Recommended Target Hourly Rate", calc.targetHourlyRate.toFixed(2)],
      ["Premium / Advisory Hourly Rate", calc.premiumHourlyRate.toFixed(2)],
      ["Half-Day Rate (4 Hours)", calc.halfDayRate.toFixed(2)],
      ["Full Day Rate (8 Hours)", calc.dayRate.toFixed(2)],
      ["Weekly Retainer", calc.weeklyRate.toFixed(2)],
      ["Monthly Retainer", calc.monthlyRetainer.toFixed(2)],
      ["40-Hour Standard Project", calc.standard40hProject.toFixed(2)],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `freelance_rate_card_${pSalary}_salary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV rate card downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Career Presets:</span>
        {PRESETS.map((p) => (
          <Button
            key={p.name}
            size="sm"
            variant="outline"
            onClick={() => {
              setAnnualNetSalary(p.salary);
              setBillableHoursPerWeek(p.hours);
              setWeeksOffPerYear(p.weeksOff);
              setMonthlyExpenses(p.expenses);
              setTaxRatePercent(p.tax);
              setProfitBufferPercent(p.profit);
              toast.info(`Loaded preset: ${p.name}`);
            }}
            className="h-7 text-xs"
          >
            <Sparkles className="mr-1 h-3 w-3 text-primary" />
            {p.name}
          </Button>
        ))}
      </div>

      {/* Top Results Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended Hourly Rate</span>
          <div className="mt-1 text-3xl font-extrabold text-primary">{fDec(calc.targetHourlyRate)}/hr</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Floor: {fDec(calc.breakEvenHourlyRate)}/hr
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Standard Day Rate</span>
          <div className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {f(calc.dayRate)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Half-day: {f(calc.halfDayRate)}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Revenue Target</span>
          <div className="mt-1 text-3xl font-bold text-foreground">
            {f(calc.monthlyRetainer)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            To pocket {f(pSalary / 12)} net/mo
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Required Annual Gross</span>
          <div className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {f(calc.requiredGrossRevenue)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Covers taxes, expenses & buffer
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Income & Capacity */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-primary" /> Target Income & Working Capacity
          </h3>

          <div>
            <Label htmlFor="salary" className="text-xs font-medium">Desired Annual Take-Home Salary ($)</Label>
            <Input
              id="salary"
              type="number"
              min="5000"
              step="1000"
              value={annualNetSalary}
              onChange={(e) => setAnnualNetSalary(e.target.value)}
              className="mt-1 font-mono text-sm"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              What you want to actually deposit in your personal bank account after all taxes and business expenses.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hours" className="text-xs font-medium">Billable Hours / Week</Label>
              <Input
                id="hours"
                type="number"
                min="5"
                max="50"
                value={billableHoursPerWeek}
                onChange={(e) => setBillableHoursPerWeek(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="weeksOff" className="text-xs font-medium">Weeks Off / Vacation / Sick</Label>
              <Input
                id="weeksOff"
                type="number"
                min="0"
                max="20"
                value={weeksOffPerYear}
                onChange={(e) => setWeeksOffPerYear(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/30 p-2.5 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">💡 Why only 20–25 billable hours?</p>
            <p className="mt-0.5">
              Freelancers spend 30%–40% of their 40-hour work week on non-billable tasks: sales pitches, invoicing, marketing, emails, and client discovery.
            </p>
          </div>
        </div>

        {/* Right Column: Overhead, Taxes & Profit Buffer */}
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-emerald-500" /> Business Overhead, Taxes & Buffer
          </h3>

          <div>
            <Label htmlFor="expenses" className="text-xs font-medium">Monthly Business Expenses ($)</Label>
            <Input
              id="expenses"
              type="number"
              min="0"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              className="mt-1 font-mono text-sm"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Software subscriptions (Adobe, Figma, GitHub, ChatGPT), hardware, accounting, coworking, health insurance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="taxRate" className="text-xs font-medium">Estimated Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="55"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="profitBuffer" className="text-xs font-medium">Profit / Rainy Day Buffer (%)</Label>
              <Input
                id="profitBuffer"
                type="number"
                min="0"
                max="40"
                value={profitBufferPercent}
                onChange={(e) => setProfitBufferPercent(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Annual Working Weeks:</span>
              <span className="font-mono font-bold text-foreground">{calc.workingWeeks} weeks</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Total Billable Hours / Year:</span>
              <span className="font-mono font-bold text-primary">{calc.totalBillableHoursYear.toLocaleString()} hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Card & Financial Plan Table */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 className="text-sm font-semibold">Freelance Rate Card & Financial Breakdown</h3>
            <p className="text-xs text-muted-foreground">Every pricing model calculated to ensure full profitability</p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadCsv} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" onClick={handleCopy} className="h-8 text-xs gap-1 font-semibold">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Rate Card"}
            </Button>
          </div>
        </div>

        {/* Rates Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Hourly Rate</div>
            <div className="mt-1 text-2xl font-bold text-primary">{fDec(calc.targetHourlyRate)}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Min floor: {fDec(calc.breakEvenHourlyRate)}</p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Full Day Rate (8h)</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{f(calc.dayRate)}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Half day: {f(calc.halfDayRate)}</p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Weekly Retainer</div>
            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{f(calc.weeklyRate)}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">For {pHours} reserved hours</p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3 text-center">
            <div className="text-xs font-medium text-muted-foreground">Standard 40h Project</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{f(calc.standard40hProject)}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Typical 2-week sprint</p>
          </div>
        </div>

        {/* Revenue Allocation Table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-left font-semibold">
              <tr>
                <th className="p-2.5">Revenue Category</th>
                <th className="p-2.5">Monthly</th>
                <th className="p-2.5 text-right">Annual Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="font-semibold text-primary">
                <td className="p-2.5">Total Required Gross Revenue</td>
                <td className="p-2.5 font-mono">{f(calc.monthlyRetainer)}</td>
                <td className="p-2.5 font-mono text-right">{f(calc.requiredGrossRevenue)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-emerald-600 dark:text-emerald-400">Personal Net Take-Home Salary</td>
                <td className="p-2.5 font-mono text-emerald-600 dark:text-emerald-400">{f(pSalary / 12)}</td>
                <td className="p-2.5 font-mono text-right text-emerald-600 dark:text-emerald-400">{f(pSalary)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">Income & Self-Employment Taxes ({(pTax * 100).toFixed(0)}%)</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(calc.annualTaxesPaid / 12)}</td>
                <td className="p-2.5 font-mono text-right text-muted-foreground">{f(calc.annualTaxesPaid)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">Business Operating Overhead</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(pExpenses)}</td>
                <td className="p-2.5 font-mono text-right text-muted-foreground">{f(calc.annualExpenses)}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-muted-foreground">Business Profit & Rainy Day Reserve ({(pProfit * 100).toFixed(0)}%)</td>
                <td className="p-2.5 font-mono text-muted-foreground">{f(calc.annualProfitBuffer / 12)}</td>
                <td className="p-2.5 font-mono text-right text-muted-foreground">{f(calc.annualProfitBuffer)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
