import React, { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Info, DollarSign, Copy, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatBRL, parseInput } from "./_br-utils";
import { toast } from "sonner";

export default function CalculadoraROIMarketing() {
  const [investment, setInvestment] = useState<string>("1000");
  const [revenue, setRevenue] = useState<string>("5000");
  const [productCost, setProductCost] = useState<string>("2000");
  const [otherCosts, setOtherCosts] = useState<string>("500");
  const [conversions, setConversions] = useState<string>("50");
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const inv = parseInput(investment);
    const rev = parseInput(revenue);
    const cost = parseInput(productCost);
    const other = parseInput(otherCosts);
    const conv = parseInput(conversions);

    const netProfit = rev - inv - cost - other;
    const roi = inv > 0 ? (netProfit / inv) * 100 : 0;
    const roas = inv > 0 ? (rev / inv) : 0;
    const cpa = conv > 0 ? (inv / conv) : 0;

    return { netProfit, roi, roas, cpa };
  }, [investment, revenue, productCost, otherCosts, conversions]);

  const copyResults = () => {
    const text = `ROI: ${results.roi.toFixed(2)}% | ROAS: ${results.roas.toFixed(2)}x | Lucro Líquido: ${formatBRL(results.netProfit)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Dados da Campanha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Investimento em Anúncios (R$)</Label>
              <Input type="number" value={investment} onChange={e => setInvestment(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Faturamento Gerado (R$)</Label>
              <Input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Custo dos Produtos (R$)</Label>
              <Input type="number" value={productCost} onChange={e => setProductCost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Outros Custos (Frete, Taxas) (R$)</Label>
              <Input type="number" value={otherCosts} onChange={e => setOtherCosts(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Número de Conversões</Label>
              <Input type="number" value={conversions} onChange={e => setConversions(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <CardDescription>ROI (Retorno sobre Investimento)</CardDescription>
                <CardTitle className={`text-3xl font-bold ${results.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {results.roi.toFixed(2)}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-blue-500/5">
              <CardHeader className="pb-2">
                <CardDescription>ROAS (Retorno sobre Gasto)</CardDescription>
                <CardTitle className="text-3xl font-bold">{results.roas.toFixed(2)}x</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Performance Financeira</CardTitle>
              <Button variant="outline" size="sm" onClick={copyResults}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copiar
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground mb-1">Lucro Líquido da Campanha</p>
                  <p className={`text-xl font-bold ${results.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatBRL(results.netProfit)}
                  </p>
                </div>
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground mb-1">CPA (Custo por Aquisição)</p>
                  <p className="text-xl font-bold">{formatBRL(results.cpa)}</p>
                </div>
              </div>
              </div>
              
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={results.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {results.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatBRL(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                <p><strong>Dica:</strong> Um ROAS acima de 4x é geralmente considerado bom no e-commerce brasileiro, mas o que importa é o lucro líquido final no bolso.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
