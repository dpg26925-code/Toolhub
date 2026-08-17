import React, { useState, useMemo } from "react";
import { Package, RefreshCw, AlertTriangle, Info, ArrowDownCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL, parseInput } from "./_br-utils";

export default function CalculadoraEstoqueMinimo() {
  const [demand, setDemand] = useState<string>("300"); // Mensal
  const [leadTime, setLeadTime] = useState<string>("15"); // Dias
  const [safetyDays, setSafetyDays] = useState<string>("5"); // Dias de segurança

  const results = useMemo(() => {
    const d = parseInput(demand);
    const lt = parseInput(leadTime);
    const sd = parseInput(safetyDays);

    const dailyDemand = d / 30;
    const safetyStock = Math.ceil(dailyDemand * sd);
    const reorderPoint = Math.ceil((dailyDemand * lt) + safetyStock);
    const minimumStock = safetyStock;

    // Mock a depletion graph
    const chartData = [];
    let current = reorderPoint * 1.5;
    for (let i = 0; i < 30; i++) {
      chartData.push({
        day: `Dia ${i + 1}`,
        estoque: Math.max(0, Math.round(current)),
        minimo: minimumStock,
        reposicao: reorderPoint
      });
      current -= dailyDemand;
      if (current < safetyStock) {
        current = reorderPoint * 1.5; // Simulate a restock for visualization
      }
    }

    return { safetyStock, reorderPoint, minimumStock, dailyDemand, chartData };
  }, [demand, leadTime, safetyDays]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Parâmetros de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Demanda Mensal Média (unidades)</Label>
              <Input type="number" value={demand} onChange={e => setDemand(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Prazo de Entrega (Lead Time em dias)</Label>
              <Input type="number" value={leadTime} onChange={e => setLeadTime(e.target.value)} />
              <p className="text-[10px] text-muted-foreground">Quanto tempo o fornecedor leva para entregar.</p>
            </div>
            <div className="space-y-2">
              <Label>Estoque de Segurança (em dias)</Label>
              <Input type="number" value={safetyDays} onChange={e => setSafetyDays(e.target.value)} />
              <p className="text-[10px] text-muted-foreground">Dias extras para cobrir atrasos ou pico de demanda.</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-600 font-medium flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Ponto de Reposição
              </CardDescription>
              <CardTitle className="text-3xl font-bold">{results.reorderPoint} un.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700/80">
                Faça um novo pedido quando o estoque chegar a {results.reorderPoint} unidades.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-600 font-medium flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4" /> Estoque Mínimo (Segurança)
              </CardDescription>
              <CardTitle className="text-3xl font-bold">{results.minimumStock} un.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700/80">
                Quantidade mínima para não ficar sem produto (Ruptura).
              </p>
            </CardContent>
          </Card>

          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Projeção de Consumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" hide />
                    <YAxis hide domain={[0, 'dataMax + 10']} />
                    <Tooltip />
                    <Area type="monotone" dataKey="estoque" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-muted rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p>Sua demanda diária média é de <strong>{results.dailyDemand.toFixed(2)}</strong> unidades.</p>
              <p className="mt-1">Manter o estoque correto evita perda de vendas e dinheiro parado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
