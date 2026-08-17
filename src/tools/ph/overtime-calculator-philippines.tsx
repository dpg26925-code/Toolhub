import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fmt, copy } from "../_acc";
import { Copy, Printer, Info } from "lucide-react";

export default function OvertimeCalculator() {
  const [hourlyRate, setHourlyRate] = useState(100);
  const [otHours, setOtHours] = useState(2);
  const [dayType, setDayType] = useState("ordinary");
  const [nsHours, setNsHours] = useState(0);

  const r = useMemo(() => {
    let multiplier = 1.25;
    if (dayType === "rest_day") multiplier = 1.69;
    else if (dayType === "special_holiday") multiplier = 1.3;
    else if (dayType === "regular_holiday") multiplier = 2.0;

    const otPay = hourlyRate * otHours * multiplier;
    const nsPremium = nsHours * (hourlyRate * 0.1);
    const total = otPay + nsPremium;

    return { otPay, nsPremium, total };
  }, [hourlyRate, otHours, dayType, nsHours]);

  const handleCopy = () => {
    copy(`Overtime Pay Estimate: ₱${fmt(r.total)}`);
    toast.success("Result copied to clipboard");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1">
      <div className="grid gap-4 sm:grid-cols-2 bg-card p-6 rounded-xl border border-border">
        <div className="space-y-2">
          <Label>Hourly Rate (₱)</Label>
          <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(+e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Day Type</Label>
          <Select value={dayType} onValueChange={setDayType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ordinary">Ordinary Day</SelectItem>
              <SelectItem value="rest_day">Rest Day</SelectItem>
              <SelectItem value="special_holiday">Special Holiday</SelectItem>
              <SelectItem value="regular_holiday">Regular Holiday</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Overtime Hours</Label>
          <Input type="number" value={otHours} onChange={(e) => setOtHours(+e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Night Shift Hours (10PM-6AM)</Label>
          <Input type="number" value={nsHours} onChange={(e) => setNsHours(+e.target.value)} />
        </div>
      </div>

      <div className="bg-primary/5 p-8 text-center rounded-2xl">
        <div className="text-sm text-muted-foreground uppercase">Total Compensation</div>
        <div className="text-5xl font-bold text-primary">₱{fmt(r.total)}</div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleCopy} variant="outline" className="gap-2"><Copy className="w-4 h-4" /> Copy</Button>
        <Button onClick={() => window.print()} variant="outline" className="gap-2"><Printer className="w-4 h-4" /> Print</Button>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg text-xs italic flex gap-3 text-muted-foreground">
        <Info className="w-4 h-4 shrink-0" />
        <p>Disclaimer: Based on Philippine Labor Code. Verify with DOLE.</p>
      </div>
    </div>
  );
}
