import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Calendar, Sparkles, Orbit } from "lucide-react";

const ZODIAC = [
  { name: "Capricorn (Ma Kết)", from: [12, 22], to: [1, 19] },
  { name: "Aquarius (Bảo Bình)", from: [1, 20], to: [2, 18] },
  { name: "Pisces (Song Ngư)", from: [2, 19], to: [3, 20] },
  { name: "Aries (Bạch Dương)", from: [3, 21], to: [4, 19] },
  { name: "Taurus (Kim Ngưu)", from: [4, 20], to: [5, 20] },
  { name: "Gemini (Song Tử)", from: [5, 21], to: [6, 20] },
  { name: "Cancer (Cự Giải)", from: [6, 21], to: [7, 22] },
  { name: "Leo (Sư Tử)", from: [7, 23], to: [8, 22] },
  { name: "Virgo (Xử Nữ)", from: [8, 23], to: [9, 22] },
  { name: "Libra (Thiên Bình)", from: [9, 23], to: [10, 22] },
  { name: "Scorpio (Bọ Cạp)", from: [10, 23], to: [11, 21] },
  { name: "Sagittarius (Nhân Mã)", from: [11, 22], to: [12, 21] },
];

const BIRTHSTONE = [
  "Garnet (Ngọc Hồng Lựu)",
  "Amethyst (Thạch Anh Tím)",
  "Aquamarine (Ngọc Xanh Biển)",
  "Diamond (Kim Cương)",
  "Emerald (Ngọc Lục Bảo)",
  "Pearl (Ngọc Trai)",
  "Ruby (Hồng Ngọc)",
  "Peridot (Ngọc Cản)",
  "Sapphire (Lam Ngọc)",
  "Opal (Ngọc Mắt Mèo)",
  "Topaz (Hoàng Ngọc)",
  "Turquoise (Ngọc Lam)",
];

const PLANET_YEAR = {
  Mercury: 0.240846,
  Venus: 0.615198,
  Mars: 1.88085,
  Jupiter: 11.862,
  Saturn: 29.4571,
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function zodiacFor(m: number, d: number) {
  for (const z of ZODIAC) {
    if ((m === z.from[0] && d >= z.from[1]) || (m === z.to[0] && d <= z.to[1])) return z.name;
  }
  return "Capricorn (Ma Kết)";
}

export default function AgeCalculator() {
  const [birth, setBirth] = useState("2000-01-01");
  const [now, setNow] = useState(new Date());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const b = new Date(birth);
  const ms = now.getTime() - b.getTime();
  const years = ms / (365.25 * 86400000);
  const totalDays = Math.floor(ms / 86400000);

  let y = now.getFullYear() - b.getFullYear();
  let m = now.getMonth() - b.getMonth();
  let d = now.getDate() - b.getDate();
  if (d < 0) {
    m--;
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (m < 0) {
    y--;
    m += 12;
  }

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor(ms / 60000);
  const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  const daysToBday = Math.ceil((next.getTime() - now.getTime()) / 86400000);

  const zodiac = zodiacFor(b.getMonth() + 1, b.getDate());
  const stone = BIRTHSTONE[b.getMonth()] || "Diamond";
  const dayOfWeek = DAYS[b.getDay()] || "Sunday";

  const handleCopy = async () => {
    const summary = `=== Age Breakdown ===
Exact Age: ${y} years, ${m} months, ${d} days
Days Lived: ${totalDays.toLocaleString()} days
Hours Lived: ${hours.toLocaleString()} hours
Born On: ${dayOfWeek}
Zodiac Sign: ${zodiac}
Birthstone: ${stone}
Next Birthday: in ${daysToBday} days`;

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Age summary copied to clipboard!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Date Picker Card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="birth-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-brand" />
            Select Your Date of Birth
          </Label>

          <div className="flex items-center gap-1.5">
            <Button size="xs" variant="outline" onClick={() => setBirth("1995-05-15")} className="text-xs h-7">
              1995
            </Button>
            <Button size="xs" variant="outline" onClick={() => setBirth("2000-01-01")} className="text-xs h-7">
              2000 (Gen Z)
            </Button>
            <Button size="xs" variant="outline" onClick={() => setBirth("2005-10-20")} className="text-xs h-7">
              2005
            </Button>
          </div>
        </div>

        <Input
          id="birth-date"
          type="date"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
          className="font-medium text-base h-11"
        />
      </div>

      {/* Primary Age Result Banner */}
      <div className="rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Calculated Exact Age
            </span>
            <div className="mt-1 text-3xl font-extrabold text-brand sm:text-4xl">
              {y} years, {m} months, {d} days
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <strong>{totalDays.toLocaleString()}</strong> days · <strong>{hours.toLocaleString()}</strong> hours · <strong>{minutes.toLocaleString()}</strong> minutes alive
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleCopy}
            className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy Age Details
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Astro & Fun Facts Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Day of Week</div>
          <div className="mt-1 text-lg font-bold text-foreground">{dayOfWeek}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Zodiac Sign</div>
          <div className="mt-1 text-base font-bold text-brand">{zodiac}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Birthstone</div>
          <div className="mt-1 text-base font-bold text-foreground">{stone}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Next Birthday</div>
          <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">in {daysToBday} days</div>
        </div>
      </div>

      {/* Planetary Ages */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Orbit className="h-4 w-4 text-brand" />
          Your Age on Other Solar Planets
        </div>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-5">
          {Object.entries(PLANET_YEAR).map(([p, len]) => (
            <div key={p} className="rounded-xl border border-border bg-muted/20 p-3 text-center">
              <div className="text-xs text-muted-foreground font-medium">{p}</div>
              <div className="mt-1 text-xl font-bold font-mono text-foreground">
                {(years / len).toFixed(1)} <span className="text-xs font-normal text-muted-foreground">yrs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
