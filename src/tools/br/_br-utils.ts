export const formatBRL = (val: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
};

export const formatPercent = (val: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val / 100);
};

export const parseInput = (val: string) => {
  return parseFloat(val) || 0;
};
