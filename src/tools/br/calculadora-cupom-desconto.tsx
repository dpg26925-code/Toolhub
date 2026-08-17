import React, { useState, useMemo } from "react";
import { Calculator, Percent, Copy, Check, Info, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBRL, parseInput } from "./_br-utils";
import { toast } from "sonner";

export default function CalculadoraCupomDesconto() {
  const [price, setPrice] = useState<string>("100");
  const [discountType, setDiscountType] = useState<string>("percent");
  const [discountValue, setDiscountValue] = useState<string>("10");
  const [cost, setCost] = useState<string>("50");
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const p = parseInput(price);
    const v = parseInput(discountValue);
    const c = parseInput(cost);

    const discountAmount = discountType === "percent" ? p * (v / 100) : v;
    const finalPrice = Math.max(0, p - discountAmount);
    const profit = finalPrice - c;
    const margin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

    const chartData = [
      { name: "Preço Original", value: p, color: "#94a3b8" },
      { name: "Com Desconto", value: finalPrice, color: "#10b981" }
    ];

    return { discountAmount, finalPrice, profit, margin, chartData };
  }, [price, discountType, discountValue, cost]);

  const copyResults = () => {
    const text = `Preço final com desconto: ${formatBRL(results.finalPrice)} (Lucro: ${formatBRL(results.profit)})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Cupom de Desconto</CardTitle>
          <CardDescription>Verifique se o seu cupom ainda garante lucro após os custos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço Original (R$)</Label>
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Custo do Produto (R$)</Label>
              <Input type="number" value={cost} onChange={e => setCost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Desconto</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Porcentagem (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor do Desconto</Label>
              <Input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço Final</p>
              <h3 className="text-2xl font-bold">{formatBRL(results.finalPrice)}</h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lucro</p>
              <h3 className={`text-2xl font-bold ${results.profit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatBRL(results.profit)}</h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Margem</p>
              <h3 className="text-2xl font-bold">{results.margin.toFixed(2)}%</h3>
            </div>
          </div>

          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results.chartData} layout="vertical" margin={{ left: 30, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatBRL(v)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={35}>
                  {results.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Button className="w-full" onClick={copyResults}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            Copiar Resumo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
