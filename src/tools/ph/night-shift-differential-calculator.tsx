import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fmt, copy } from "../_acc";
import { Copy, Printer, Info } from "lucide-react";

export default function NightShiftCalculator() {
  const [hourlyRate, setHourlyRate] = useState(100);
  const [nsHours, setNsHours] = useState(8);

  const r = useMemo(() => {
    const differential = hourlyRate * 0.10 * nsHours;
    return { differential, total: (hourlyRate + (hourlyRate * 0.10)) * nsHours };
  }, [hourlyRate, nsHours]);

  const handleCopy = () => {
    copy(`Night Shift Differential: ₱${fmt(r.differential)}`);
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
          <Label>Night Shift Hours (10PM-6AM)</Label>
          <Input type="number" value={nsHours} onChange={(e) => setNsHours(+e.target.value)} />
        </div>
      </div>

      <div className="bg-primary/5 p-8 text-center rounded-2xl">
        <div className="text-sm text-muted-foreground uppercase">Night Shift Differential Pay</div>
        <div className="text-5xl font-bold text-primary">₱{fmt(r.differential)}</div>
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
