import React, { useState, useMemo } from "react";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  Copy, 
  Check, 
  Info,
  Truck,
  ArrowRight
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const CATEGORY_FEES: Record<string, number> = {
  moda: 0.08,
  beleza: 0.07,
  eletronicos: 0.06,
  casa: 0.05,
  outros: 0.05,
};

const WITHDRAWAL_FEES: Record<string, number> = {
  pix: 0,
  ted: 5,
  internacional: 15,
};

const COLORS = ["#000000", "#FF0050", "#00F2EA", "#FFB800", "#7C3AED"];

export default function TikTokShopFeeCalculator() {
  const [price, setPrice] = useState<string>("100");
  const [productCost, setProductCost] = useState<string>("40");
  const [category, setCategory] = useState<string>("moda");
  const [shippingCost, setShippingCost] = useState<string>("15");
  const [discount, setDiscount] = useState<string>("0");
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>("pix");
  const [isFreeShipping, setIsFreeShipping] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const p = parseFloat(price) || 0;
    const cost = parseFloat(productCost) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const disc = parseFloat(discount) || 0;
    
    // TikTok Shop Brazil structure
    const commissionRate = CATEGORY_FEES[category] || 0.05;
    const commission = p * commissionRate;
    const transactionFee = p * 0.02; // 2%
    const processingFee = p * 0.025; // 2.5%
    const withdrawalFee = WITHDRAWAL_FEES[withdrawalMethod] || 0;
    const sellerShipping = isFreeShipping ? shipping : 0;

    const totalFees = commission + transactionFee + processingFee + withdrawalFee + sellerShipping;
    const netRevenue = p - totalFees - disc;
    const profit = netRevenue - cost;
    const margin = p > 0 ? (profit / p) * 100 : 0;

    return {
      gross: p,
      commission,
      transactionFee,
      processingFee,
      withdrawalFee,
      sellerShipping,
      totalFees,
      netRevenue,
      profit,
      margin,
      commissionPercent: commissionRate * 100
    };
  }, [price, productCost, category, shippingCost, discount, withdrawalMethod, isFreeShipping]);

  const chartData = [
    { name: "Comissão", value: results.commission },
    { name: "Transação (2%)", value: results.transactionFee },
    { name: "Processamento (2.5%)", value: results.processingFee },
    { name: "Saque", value: results.withdrawalFee },
    { name: "Frete", value: results.sellerShipping },
  ].filter(d => d.value > 0);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const copyToClipboard = () => {
    const text = `Resultados TikTok Shop Brazil:
Preço Bruto: ${formatBRL(results.gross)}
Comissão (${results.commissionPercent}%): ${formatBRL(results.commission)}
Taxa de Transação (2%): ${formatBRL(results.transactionFee)}
Taxa de Processamento (2.5%): ${formatBRL(results.processingFee)}
Taxa de Saque (${withdrawalMethod.toUpperCase()}): ${formatBRL(results.withdrawalFee)}
Frete Subsidiado: ${formatBRL(results.sellerShipping)}
-------------------------
Valor Líquido Final: ${formatBRL(results.netRevenue)}
Lucro Estimado: ${formatBRL(results.profit)}
Margem Efetiva: ${results.margin.toFixed(2)}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Resultados copiados!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Configurações
            </CardTitle>
            <CardDescription>
              Insira os dados da sua venda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço do Produto (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-9"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productCost">Custo do Produto (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                <Input
                  id="productCost"
                  type="number"
                  value={productCost}
                  onChange={(e) => setProductCost(e.target.value)}
                  className="pl-9"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moda">Moda (8%)</SelectItem>
                  <SelectItem value="beleza">Beleza (7%)</SelectItem>
                  <SelectItem value="eletronicos">Eletrônicos (6%)</SelectItem>
                  <SelectItem value="casa">Casa (5%)</SelectItem>
                  <SelectItem value="outros">Outros (5%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Valor do Cupom/Desconto (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                <Input
                  id="discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="pl-9"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="free-shipping" className="flex items-center gap-2 cursor-pointer">
                  <Truck className="w-4 h-4" />
                  Oferecer Frete Grátis?
                </Label>
                <Switch
                  id="free-shipping"
                  checked={isFreeShipping}
                  onCheckedChange={setIsFreeShipping}
                />
              </div>
              
              {isFreeShipping && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="shippingCost">Custo do Frete (R$)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                    <Input
                      id="shippingCost"
                      type="number"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      className="pl-9"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Método de Saque</Label>
              <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX (R$ 0,00)</SelectItem>
                  <SelectItem value="ted">TED (R$ 5,00)</SelectItem>
                  <SelectItem value="internacional">Internacional (R$ 15,00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardDescription className="text-primary font-medium">Valor Líquido Final</CardDescription>
                <CardTitle className="text-3xl font-bold">{formatBRL(results.netRevenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4" />
                  O que cai na sua conta
                </div>
              </CardContent>
            </Card>

            <Card className={results.profit >= 0 ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}>
              <CardHeader className="pb-2">
                <CardDescription className={results.profit >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  Lucro Estimado
                </CardDescription>
                <CardTitle className="text-3xl font-bold">{formatBRL(results.profit)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Margem Efetiva
                  </div>
                  <span className={`font-bold ${results.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {results.margin.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Detalhamento de Taxas</CardTitle>
                <CardDescription>Distribuição dos custos da venda</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatBRL(value)}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span className="text-muted-foreground">Preço Bruto</span>
                    <span className="font-medium">{formatBRL(results.gross)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                      Comissão ({results.commissionPercent}%)
                    </span>
                    <span className="font-medium">{formatBRL(results.commission)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                      Taxa de Transação (2%)
                    </span>
                    <span className="font-medium">{formatBRL(results.transactionFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[2] }} />
                      Taxa de Processamento (2.5%)
                    </span>
                    <span className="font-medium">{formatBRL(results.processingFee)}</span>
                  </div>
                  {results.withdrawalFee > 0 && (
                    <div className="flex justify-between text-sm py-1 border-b">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[3] }} />
                        Taxa de Saque
                      </span>
                      <span className="font-medium">{formatBRL(results.withdrawalFee)}</span>
                    </div>
                  )}
                  {results.sellerShipping > 0 && (
                    <div className="flex justify-between text-sm py-1 border-b">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[4] }} />
                        Frete Subsidiado
                      </span>
                      <span className="font-medium">{formatBRL(results.sellerShipping)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm py-2 bg-muted/30 px-2 rounded mt-2">
                    <span className="font-bold">Total de Descontos</span>
                    <span className="font-bold text-red-600">-{formatBRL(results.totalFees + parseFloat(discount || "0"))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="pb-2 pt-4 flex flex-row items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm font-medium text-amber-600">Atenção</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-amber-700/80 italic">
                Valores estimados. As taxas podem variar conforme seu contrato com o TikTok Shop e mudanças na política da plataforma. Consulte o painel oficial do vendedor para valores exatos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
