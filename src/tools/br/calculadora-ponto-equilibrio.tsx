import React, { useState, useMemo } from "react";
import { Calculator, Target, Info, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatBRL, parseInput } from "./_br-utils";

export default function CalculadoraPontoEquilibrio() {
  const [fixedCosts, setFixedCosts] = useState<string>("5000");
  const [variableCosts, setVariableCosts] = useState<string>("40");
  const [sellingPrice, setSellingPrice] = useState<string>("100");

  const results = useMemo(() => {
    const fc = parseInput(fixedCosts);
    const vc = parseInput(variableCosts);
    const sp = parseInput(sellingPrice);

    const contributionMargin = sp - vc;
    const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fc / contributionMargin) : 0;
    const breakEvenRevenue = breakEvenUnits * sp;

    // Generate chart data for 0 to 2x break-even units
    const chartPoints = [];
    const limit = breakEvenUnits > 0 ? breakEvenUnits * 2 : 100;
    const step = Math.ceil(limit / 10);

    for (let i = 0; i <= limit; i += step) {
      chartPoints.push({
        units: i,
        custos: fc + (vc * i),
        receita: sp * i
      });
    }

    return { breakEvenUnits, breakEvenRevenue, contributionMargin, chartPoints };
  }, [fixedCosts, variableCosts, sellingPrice]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Parâmetros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Custo Fixo Mensal (R$)</Label>
              <Input type="number" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} />
              <p className="text-[10px] text-muted-foreground">Aluguel, salários, software, etc.</p>
            </div>
            <div className="space-y-2">
              <Label>Preço de Venda Unitário (R$)</Label>
              <Input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Custo Variável Unitário (R$)</Label>
              <Input type="number" value={variableCosts} onChange={e => setVariableCosts(e.target.value)} />
              <p className="text-[10px] text-muted-foreground">Custo produto, embalagem, impostos por venda.</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardDescription className="text-primary font-medium">Ponto de Equilíbrio (Unidades)</CardDescription>
                <CardTitle className="text-3xl font-bold">{results.breakEvenUnits} itens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Você precisa vender {results.breakEvenUnits} unidades para cobrir todos os custos.</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader className="pb-2">
                <CardDescription className="text-green-600 font-medium">Faturamento de Equilíbrio</CardDescription>
                <CardTitle className="text-3xl font-bold">{formatBRL(results.breakEvenRevenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Margem de contribuição: {formatBRL(results.contributionMargin)} por unidade.</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Break-Even</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.chartPoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="units" label={{ value: 'Unidades', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(v) => `R$${v}`} />
                    <Tooltip formatter={(v: number) => formatBRL(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="custos" stroke="#EF4444" name="Custos Totais" />
                    <Line type="monotone" dataKey="receita" stroke="#10B981" name="Receita" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
