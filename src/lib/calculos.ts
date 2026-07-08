export type ItemCarrinho = {
  quantidade: number;
  precoUnitario: number;
};

export function calcularTotalVenda(itens: ItemCarrinho[]): number {
  const total = itens.reduce((soma, item) => soma + item.quantidade * item.precoUnitario, 0);
  return Math.round(total * 100) / 100;
}

export function calcularValorEsperadoFechamento(fundoTroco: number, totalVendasDinheiro: number): number {
  return Math.round((fundoTroco + totalVendasDinheiro) * 100) / 100;
}

export function calcularDiferencaFechamento(valorContado: number, valorEsperado: number): number {
  return Math.round((valorContado - valorEsperado) * 100) / 100;
}
