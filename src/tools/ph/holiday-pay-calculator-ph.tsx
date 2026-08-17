import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fmt, copy } from "../_acc";
import { Copy, Printer, Info } from "lucide-react";

export default function HolidayPayCalculator() {
  const [dailyRate, setDailyRate] = useState(500);
  const [regularHolidays, setRegularHolidays] = useState(1);
  const [specialHolidays, setSpecialHolidays] = useState(0);
  const [restDays, setRestDays] = useState(0);

  const r = useMemo(() => {
    const regPay = regularHolidays * dailyRate * 2; // 100% + 100% premium
    const specPay = specialHolidays * dailyRate * 1.3;
    const restPay = restDays * dailyRate * 1.3;
    return { regPay, specPay, restPay, total: regPay + specPay + restPay };
  }, [dailyRate, regularHolidays, specialHolidays, restDays]);

  const handleCopy = () => {
    copy(`Holiday Pay Estimate: ₱${fmt(r.total)}`);
    toast.success("Result copied to clipboard");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1">
      <div className="grid gap-4 sm:grid-cols-2 bg-card p-6 rounded-xl border border-border">
        <div className="space-y-2">
          <Label>Daily Rate (₱)</Label>
          <Input type="number" value={dailyRate} onChange={(e) => setDailyRate(+e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Regular Holidays Worked</Label>
          <Input type="number" value={regularHolidays} onChange={(e) => setRegularHolidays(+e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Special Non-Working Days</Label>
          <Input type="number" value={specialHolidays} onChange={(e) => setSpecialHolidays(+e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Rest Days Worked</Label>
          <Input type="number" value={restDays} onChange={(e) => setRestDays(+e.target.value)} />
        </div>
      </div>

      <div className="bg-primary/5 p-8 text-center rounded-2xl">
        <div className="text-sm text-muted-foreground uppercase">Total Holiday Pay</div>
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
