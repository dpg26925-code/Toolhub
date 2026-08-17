import React, { useState, useMemo } from "react";
import { Calculator, Truck, Info, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatBRL, parseInput } from "./_br-utils";
import { toast } from "sonner";

export default function CalculadoraFreteGratis() {
  const [price, setPrice] = useState<string>("100");
  const [shippingCost, setShippingCost] = useState<string>("20");
  const [desiredMargin, setDesiredMargin] = useState<string>("20");
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const p = parseInput(price);
    const s = parseInput(shippingCost);
    const m = parseInput(desiredMargin) / 100;

    // Minimum price to maintain desired margin while covering shipping
    // Margin formula: (P - C - S) / P = M
    // P - C - S = P * M => P(1 - M) = C + S => P = (C + S) / (1 - M)
    // Assuming product cost is implied by current price and margin
    const currentCost = p * (1 - m); 
    const minPriceForFreeShipping = (currentCost + s) / (1 - m);

    return { minPriceForFreeShipping, impact: minPriceForFreeShipping - p };
  }, [price, shippingCost, desiredMargin]);

  const copyResults = () => {
    const text = `Preço mínimo para Frete Grátis: ${formatBRL(results.minPriceForFreeShipping)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Frete Grátis</CardTitle>
          <CardDescription>Determine o preço mínimo para oferecer frete grátis sem perder margem.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Preço do Produto (R$)</Label>
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Custo do Frete (R$)</Label>
              <Input type="number" value={shippingCost} onChange={e => setShippingCost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Margem Desejada (%)</Label>
              <Input type="number" value={desiredMargin} onChange={e => setDesiredMargin(e.target.value)} />
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-lg border flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço mínimo sugerido para Frete Grátis</p>
              <h2 className="text-3xl font-bold text-primary">{formatBRL(results.minPriceForFreeShipping)}</h2>
            </div>
            <Button onClick={copyResults}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copiar
            </Button>
          </div>

          <div className="text-sm text-muted-foreground border-t pt-4">
            <p className="flex items-center gap-2 font-semibold mb-2 text-foreground">
              <Info className="w-4 h-4" /> Dicas Estratégicas
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Absorver o frete reduz seu lucro, mas aumenta a taxa de conversão em até 30%.</li>
              <li>Considere dividir o custo do frete: suba o preço um pouco e cubra o resto.</li>
              <li>"Frete grátis acima de R$ X" é geralmente mais eficaz que frete grátis para todos os produtos.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
