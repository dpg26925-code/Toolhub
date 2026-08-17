import React, { useState, useMemo } from "react";
import { Calculator, Tag, Info, DollarSign, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatBRL, parseInput } from "./_br-utils";
import { toast } from "sonner";

export default function CalculadoraPrecoVenda() {
  const [cost, setCost] = useState<string>("50");
  const [margin, setMargin] = useState<string>("30");
  const [taxRate, setTaxRate] = useState<string>("6");
  const [marketplaceFee, setMarketplaceFee] = useState<string>("15");
  const [shipping, setShipping] = useState<string>("0");
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const c = parseInput(cost);
    const m = parseInput(margin) / 100;
    const t = parseInput(taxRate) / 100;
    const mf = parseInput(marketplaceFee) / 100;
    const s = parseInput(shipping);

    // Selling Price calculation:
    // P = (Cost + Shipping) / (1 - Margin - TaxRate - MarketplaceFee)
    const denominator = 1 - m - t - mf;
    const suggestedPrice = denominator > 0 ? (c + s) / denominator : 0;
    
    const profit = suggestedPrice > 0 ? suggestedPrice * m : 0;
    const taxes = suggestedPrice * t;
    const fees = suggestedPrice * mf;
    const markup = c > 0 ? suggestedPrice / c : 0;

    return { suggestedPrice, profit, taxes, fees, markup };
  }, [cost, margin, taxRate, marketplaceFee, shipping]);

  const copyResults = () => {
    const text = `Preço Sugerido: ${formatBRL(results.suggestedPrice)} | Markup: ${results.markup.toFixed(2)}x`;
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
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Composição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Custo do Produto (R$)</Label>
              <Input type="number" value={cost} onChange={e => setCost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Margem Lucro Desejada (%)</Label>
              <Input type="number" value={margin} onChange={e => setMargin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Impostos sobre Venda (%)</Label>
              <Input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Taxa do Marketplace (%)</Label>
              <Input type="number" value={marketplaceFee} onChange={e => setMarketplaceFee(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Custo de Frete (R$)</Label>
              <Input type="number" value={shipping} onChange={e => setShipping(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-primary font-medium">Preço de Venda Sugerido</CardDescription>
                <CardTitle className="text-4xl font-bold">{formatBRL(results.suggestedPrice)}</CardTitle>
              </div>
              <Button onClick={copyResults}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copiar Preço
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="p-3 border rounded bg-white">
                  <p className="text-xs text-muted-foreground">Lucro Líquido</p>
                  <p className="font-bold text-green-600">{formatBRL(results.profit)}</p>
                </div>
                <div className="p-3 border rounded bg-white">
                  <p className="text-xs text-muted-foreground">Impostos</p>
                  <p className="font-bold text-red-500">{formatBRL(results.taxes)}</p>
                </div>
                <div className="p-3 border rounded bg-white">
                  <p className="text-xs text-muted-foreground">Taxa Canal</p>
                  <p className="font-bold text-red-500">{formatBRL(results.fees)}</p>
                </div>
                <div className="p-3 border rounded bg-white">
                  <p className="text-xs text-muted-foreground">Markup</p>
                  <p className="font-bold">{results.markup.toFixed(2)}x</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Por que este preço?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Para atingir uma margem de <strong>{margin}%</strong>, o preço precisa cobrir o custo do produto mais todos os impostos e taxas que incidem sobre o <strong>valor final da venda</strong>.
              </p>
              <div className="flex items-start gap-3 p-3 bg-muted rounded text-sm mt-4">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p>Compare este preço com a concorrência. Se estiver muito alto, tente reduzir custos de operação ou negociar taxas com o marketplace.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
