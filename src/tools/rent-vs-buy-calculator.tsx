import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmt } from "./_acc";
import { monthlyPayment } from "./loan-amortization";

function simulate(years: number, opts: {
  price: number; down: number; rate: number; term: number;
  taxPct: number; insAnnual: number; hoa: number; maintPct: number;
  rent: number; rentIncPct: number; investPct: number; homeApprPct: number;
}) {
  const { price, down, rate, term, taxPct, insAnnual, hoa, maintPct,
    rent, rentIncPct, investPct, homeApprPct } = opts;
  const loan = Math.max(0, price - down);
  const pi = monthlyPayment(loan, rate, term * 12);
  const r = rate / 100 / 12;
  const invR = investPct / 100 / 12;
  const apprR = homeApprPct / 100 / 12;
  let bal = loan;
  let homeValue = price;
  let rentInvest = down; // renter invests down payment
  let buyerPaid = down;
  let renterPaid = 0;
  let currentRent = rent;
  const series: { m: number; buyNet: number; rentNet: number }[] = [];
  const months = years * 12;
  for (let m = 1; m <= months; m++) {
    // buyer
    const interest = bal * r;
    const principal = Math.min(bal, pi - interest);
    bal -= principal;
    const tax = (homeValue * taxPct / 100) / 12;
    const ins = insAnnual / 12;
    const maint = (homeValue * maintPct / 100) / 12;
    const buyMonthly = pi + tax + ins + hoa + maint;
    buyerPaid += buyMonthly;
    homeValue *= 1 + apprR;
    // renter — invests the difference between buyer's outflow and rent
    const diff = buyMonthly - currentRent;
    if (diff > 0) rentInvest = (rentInvest + diff) * (1 + invR);
    else rentInvest = rentInvest * (1 + invR);
    renterPaid += currentRent;
    if (m % 12 === 0) currentRent *= 1 + rentIncPct / 100;
    const buyEquity = homeValue - bal;
    const buyNet = buyEquity - buyerPaid + down; // net wealth change
    const rentNet = rentInvest - renterPaid;
    series.push({ m, buyNet, rentNet });
  }
  const breakEven = series.find((s) => s.buyNet >= s.rentNet)?.m ?? null;
  return { series, breakEven, finalHome: homeValue, finalLoan: bal, buyerPaid, renterPaid, rentInvest };
}

export default function RentVsBuyCalculator() {
  const [price, setPrice] = useState(450000);
  const [down, setDown] = useState(90000);
  const [rate, setRate] = useState(6.75);
  const [term, setTerm] = useState(30);
  const [taxPct, setTaxPct] = useState(1.1);
  const [insAnnual, setInsAnnual] = useState(1500);
  const [hoa, setHoa] = useState(0);
  const [maintPct, setMaintPct] = useState(1);
  const [rent, setRent] = useState(2200);
  const [rentIncPct, setRentIncPct] = useState(3);
  const [investPct, setInvestPct] = useState(6);
  const [homeApprPct, setHomeApprPct] = useState(3);

  const opts = { price, down, rate, term, taxPct, insAnnual, hoa, maintPct, rent, rentIncPct, investPct, homeApprPct };
  const y5 = useMemo(() => simulate(5, opts), [price, down, rate, term, taxPct, insAnnual, hoa, maintPct, rent, rentIncPct, investPct, homeApprPct]);
  const y10 = useMemo(() => simulate(10, opts), [price, down, rate, term, taxPct, insAnnual, hoa, maintPct, rent, rentIncPct, investPct, homeApprPct]);

  const chart = y10.series;
  const W = 600, H = 200, pad = 30;
  const maxV = Math.max(1, ...chart.map((c) => Math.max(c.buyNet, c.rentNet)));
  const minV = Math.min(0, ...chart.map((c) => Math.min(c.buyNet, c.rentNet)));
  const xy = (i: number, v: number) => {
    const x = pad + (i / (chart.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - minV) / (maxV - minV)) * (H - pad * 2);
    return `${x},${y}`;
  };
  const buyPath = chart.map((c, i) => xy(i, c.buyNet)).join(" ");
  const rentPath = chart.map((c, i) => xy(i, c.rentNet)).join(" ");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <F l="Home price" v={price} on={setPrice} />
        <F l="Down payment" v={down} on={setDown} />
        <F l="Mortgage rate (%)" v={rate} on={setRate} step="0.01" />
        <F l="Term (years)" v={term} on={setTerm} />
        <F l="Property tax (%/yr)" v={taxPct} on={setTaxPct} step="0.01" />
        <F l="Insurance (/yr)" v={insAnnual} on={setInsAnnual} />
        <F l="HOA (/mo)" v={hoa} on={setHoa} />
        <F l="Maintenance (%/yr)" v={maintPct} on={setMaintPct} step="0.1" />
        <F l="Home appreciation (%/yr)" v={homeApprPct} on={setHomeApprPct} step="0.1" />
        <F l="Current rent (/mo)" v={rent} on={setRent} />
        <F l="Rent increase (%/yr)" v={rentIncPct} on={setRentIncPct} step="0.1" />
        <F l="Investment return (%/yr)" v={investPct} on={setInvestPct} step="0.1" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="5-year outlook">
          <S label="Buying net worth Δ" v={fmt(y5.series[y5.series.length - 1]?.buyNet ?? 0)} h />
          <S label="Renting net worth Δ" v={fmt(y5.series[y5.series.length - 1]?.rentNet ?? 0)} />
          <S label="Buyer paid" v={fmt(y5.buyerPaid)} />
          <S label="Renter paid" v={fmt(y5.renterPaid)} />
        </Card>
        <Card title="10-year outlook">
          <S label="Buying net worth Δ" v={fmt(y10.series[y10.series.length - 1]?.buyNet ?? 0)} h />
          <S label="Renting net worth Δ" v={fmt(y10.series[y10.series.length - 1]?.rentNet ?? 0)} />
          <S label="Home value in 10y" v={fmt(y10.finalHome)} />
          <S label="Break-even" v={y10.breakEven ? `Month ${y10.breakEven} (~yr ${Math.ceil(y10.breakEven / 12)})` : "Not within 10y"} />
        </Card>
      </div>
      <div className="rounded-xl border border-border p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold">Wealth accumulation (10 years)</span>
          <span className="flex gap-3">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 bg-primary" /> Buy</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 bg-amber-500" /> Rent</span>
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="currentColor" opacity="0.2" />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="currentColor" opacity="0.2" />
          <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="2" points={buyPath} />
          <polyline fill="none" stroke="rgb(245 158 11)" strokeWidth="2" points={rentPath} />
        </svg>
      </div>
    </div>
  );
}

function F({ l, v, on, step }: { l: string; v: number; on: (n: number) => void; step?: string }) {
  return (
    <div>
      <Label>{l}</Label>
      <Input className="mt-1" type="number" step={step ?? "1"} value={v} onChange={(e) => on(+e.target.value)} />
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}
function S({ label, v, h }: { label: string; v: string; h?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-semibold ${h ? "text-primary text-lg" : ""}`}>{v}</div>
    </div>
  );
}