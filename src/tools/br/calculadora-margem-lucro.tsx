import React, { useState, useMemo } from "react";
import { Calculator, TrendingUp, DollarSign, PieChart as PieChartIcon, Copy, Check, Info, ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatBRL, parseInput } from "./_br-utils";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#7C3AED"];

export default function CalculadoraMargemLucro() {
  const [price, setPrice] = useState<string>("100");
  const [cost, setCost] = useState<string>("60");
  const [shipping, setShipping] = useState<string>("0");
  const [taxRate, setTaxRate] = useState<string>("0");
  const [otherCosts, setOtherCosts] = useState<string>("0");
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const p = parseInput(price);
    const c = parseInput(cost);
    const s = parseInput(shipping);
    const t = parseInput(taxRate);
    const o = parseInput(otherCosts);

    const taxAmount = p * (t / 100);
    const totalCosts = c + s + taxAmount + o;
    const profit = p - totalCosts;
    
    const grossMargin = p > 0 ? ((p - c) / p) * 100 : 0;
    const netMargin = p > 0 ? (profit / p) * 100 : 0;
    const markup = c > 0 ? (p / c) : 0;
    const breakeven = profit > 0 ? totalCosts : 0;

    return { p, c, s, t, o, taxAmount, totalCosts, profit, grossMargin, netMargin, markup, breakeven };
  }, [price, cost, shipping, taxRate, otherCosts]);

  const chartData = [
    { name: "Lucro Líquido", value: Math.max(0, results.profit) },
    { name: "Custo Produto", value: results.c },
    { name: "Impostos", value: results.taxAmount },
    { name: "Frete", value: results.s },
    { name: "Outros", value: results.o },
  ].filter(d => d.value > 0);

  const copyResults = () => {
    const text = `Resultados Margem de Lucro:
Preço: ${formatBRL(results.p)}
Custo: ${formatBRL(results.c)}
Lucro Líquido: ${formatBRL(results.profit)}
Margem Líquida: ${results.netMargin.toFixed(2)}%
Markup: ${results.markup.toFixed(2)}x`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Resultados copiados!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Entradas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preço de Venda (R$)</Label>
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Custo do Produto (R$)</Label>
              <Input type="number" value={cost} onChange={e => setCost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Custo de Frete (R$)</Label>
              <Input type="number" value={shipping} onChange={e => setShipping(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Impostos (%)</Label>
              <Input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Outros Custos (R$)</Label>
              <Input type="number" value={otherCosts} onChange={e => setOtherCosts(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <CardDescription>Margem Líquida</CardDescription>
                <CardTitle className="text-3xl font-bold">{results.netMargin.toFixed(2)}%</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-green-500/5">
              <CardHeader className="pb-2">
                <CardDescription>Lucro Líquido</CardDescription>
                <CardTitle className="text-3xl font-bold">{formatBRL(results.profit)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Análise de Custos vs Lucro</CardTitle>
              <Button variant="outline" size="sm" onClick={copyResults}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                      {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatBRL(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 border rounded bg-muted/30">
                  <p className="text-sm text-muted-foreground">Margem Bruta</p>
                  <p className="text-lg font-bold">{results.grossMargin.toFixed(2)}%</p>
                </div>
                <div className="p-3 border rounded bg-muted/30">
                  <p className="text-sm text-muted-foreground">Markup</p>
                  <p className="text-lg font-bold">{results.markup.toFixed(2)}x</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
