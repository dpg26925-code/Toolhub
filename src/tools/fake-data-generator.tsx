import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Locale = "US" | "UK" | "VN" | "JP" | "DE";
type Kind = "person" | "company" | "credit-card" | "ssn" | "iban";

const FIRST: Record<Locale, string[]> = {
  US: ["James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth"],
  UK: ["Oliver","Amelia","Harry","Isla","George","Ava","Noah","Mia","Leo","Emily"],
  VN: ["Anh","Bình","Chi","Dũng","Hà","Hùng","Linh","Minh","Nam","Trang"],
  JP: ["Haruto","Yuma","Sota","Yui","Hina","Aoi","Riku","Ren","Sakura","Mio"],
  DE: ["Lukas","Leon","Emma","Mia","Ben","Elias","Hannah","Lea","Paul","Anna"],
};
const LAST: Record<Locale, string[]> = {
  US: ["Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Wilson","Anderson","Thomas"],
  UK: ["Smith","Jones","Taylor","Brown","Williams","Wilson","Johnson","Davies","Robinson","Wright"],
  VN: ["Nguyễn","Trần","Lê","Phạm","Hoàng","Huỳnh","Phan","Vũ","Đặng","Bùi"],
  JP: ["Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito","Yamamoto","Nakamura","Kobayashi","Kato"],
  DE: ["Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann"],
};
const CITIES: Record<Locale, string[]> = {
  US: ["New York","Los Angeles","Chicago","Houston","Phoenix","Boston","Seattle"],
  UK: ["London","Manchester","Birmingham","Leeds","Glasgow","Bristol","Liverpool"],
  VN: ["Hà Nội","TP.HCM","Đà Nẵng","Hải Phòng","Cần Thơ","Huế"],
  JP: ["Tokyo","Osaka","Kyoto","Nagoya","Sapporo","Fukuoka"],
  DE: ["Berlin","Hamburg","München","Köln","Frankfurt","Stuttgart"],
};
const PHONE: Record<Locale, () => string> = {
  US: () => `+1 (${rand(200, 999)}) ${rand(200, 999)}-${String(rand(0, 9999)).padStart(4, "0")}`,
  UK: () => `+44 7${rand(100000000, 999999999)}`,
  VN: () => `+84 9${rand(10000000, 99999999)}`,
  JP: () => `+81 90-${String(rand(0, 9999)).padStart(4, "0")}-${String(rand(0, 9999)).padStart(4, "0")}`,
  DE: () => `+49 ${rand(30, 999)} ${rand(1000000, 9999999)}`,
};
const COMPANIES = ["Acme","Globex","Initech","Umbrella","Soylent","Hooli","Massive","Vandelay","Wayne","Wonka"];
const SUFFIX: Record<Locale, string[]> = { US: ["Inc","LLC","Corp"], UK: ["Ltd","PLC"], VN: ["JSC","Co., Ltd"], JP: ["K.K.","G.K."], DE: ["GmbH","AG"] };

function rand(min: number, max: number) { return min + Math.floor(Math.random() * (max - min + 1)); }
function pick<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }
function slug(s: string) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]/g, "").toLowerCase(); }

function luhnCheck(digits: number[]) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[digits.length - 1 - i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}
function creditCard() {
  const brands = [{ n: "Visa", p: "4", len: 16 }, { n: "MC", p: "51", len: 16 }, { n: "Amex", p: "37", len: 15 }];
  const b = pick(brands);
  const digits = b.p.split("").map(Number);
  while (digits.length < b.len - 1) digits.push(rand(0, 9));
  digits.push(luhnCheck(digits));
  const num = digits.join("").replace(/(.{4})/g, "$1 ").trim();
  return `${b.n} · ${num} · ${String(rand(1, 12)).padStart(2, "0")}/${28 + rand(0, 4)} · CVV ${String(rand(0, 999)).padStart(3, "0")}`;
}
function ssn(locale: Locale) {
  if (locale === "US") return `${String(rand(100, 899))}-${String(rand(10, 99))}-${String(rand(1000, 9999))}`;
  if (locale === "UK") return `AB${String(rand(100000, 999999))}C`;
  if (locale === "DE") return `${String(rand(10, 65))} ${String(rand(100000, 999999))} A ${rand(0, 999)}`;
  return `${String(rand(100, 999))}-${String(rand(100, 999))}-${String(rand(100, 999))}`;
}
function iban(locale: Locale) {
  const cc: Record<Locale, string> = { US: "US", UK: "GB", VN: "VN", JP: "JP", DE: "DE" };
  const body = Array.from({ length: 20 }, () => String(rand(0, 9))).join("");
  return `${cc[locale]}${String(rand(10, 99))}${body}`;
}

function generate(kind: Kind, locale: Locale, i: number): string {
  const first = pick(FIRST[locale]);
  const last = pick(LAST[locale]);
  if (kind === "person") {
    const email = `${slug(first)}.${slug(last)}${i}@example.com`;
    return `${first} ${last} · ${email} · ${PHONE[locale]()} · ${pick(CITIES[locale])}`;
  }
  if (kind === "company") return `${pick(COMPANIES)}${rand(1, 99)} ${pick(SUFFIX[locale])} · ${pick(CITIES[locale])}`;
  if (kind === "credit-card") return creditCard();
  if (kind === "ssn") return ssn(locale);
  return iban(locale);
}

export default function FakeDataGeneratorTool() {
  const [kind, setKind] = useState<Kind>("person");
  const [locale, setLocale] = useState<Locale>("US");
  const [count, setCount] = useState(10);
  const [seed, setSeed] = useState(0);

  const rows = useMemo(() => Array.from({ length: count }, (_, i) => generate(kind, locale, i + 1)), [kind, locale, count, seed]);
  const output = rows.join("\n");

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
        ⚠️ Test data only. Numbers pass Luhn / format checks but are <strong>not</strong> real accounts. Never use for anything but development testing.
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label>Type</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="person">Person</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="credit-card">Credit card (Luhn)</SelectItem>
              <SelectItem value="ssn">SSN / National ID</SelectItem>
              <SelectItem value="iban">IBAN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Locale</Label>
          <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="US">US</SelectItem>
              <SelectItem value="UK">UK</SelectItem>
              <SelectItem value="VN">VN</SelectItem>
              <SelectItem value="JP">JP</SelectItem>
              <SelectItem value="DE">DE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Quantity</Label><Input type="number" min={1} max={500} value={count} onChange={(e) => setCount(Math.max(1, Math.min(500, +e.target.value)))} className="mt-1" /></div>
        <div className="flex items-end"><Button variant="outline" className="w-full" onClick={() => setSeed((s) => s + 1)}>Regenerate</Button></div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between"><Label>Result ({rows.length})</Label>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>Copy</Button>
            <Button size="sm" variant="outline" onClick={() => {
              const blob = new Blob([output], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `fake-${kind}.txt`; a.click();
              URL.revokeObjectURL(url);
            }}>Download</Button>
          </div>
        </div>
        <Textarea rows={14} readOnly value={output} className="font-mono text-xs" />
      </div>
    </div>
  );
}