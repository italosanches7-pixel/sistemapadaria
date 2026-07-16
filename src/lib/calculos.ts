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

export type PagamentoEntrada = { valor: number };

export function somarPagamentos(pagamentos: PagamentoEntrada[]): number {
  const soma = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  return Math.round(soma * 100) / 100;
}

/**
 * Valida a lista de pagamentos de uma venda: precisa ter ao menos um, todos com
 * valor positivo, e a soma precisa bater com o total da venda (tolerância de
 * meio centavo para arredondamentos). Retorna a mensagem de erro, ou null se ok.
 */
export function validarPagamentos(pagamentos: PagamentoEntrada[], totalVenda: number): string | null {
  if (!pagamentos.length) return "Informe ao menos uma forma de pagamento.";
  if (pagamentos.some((p) => Number.isNaN(p.valor) || p.valor <= 0)) {
    return "Cada pagamento deve ter um valor maior que zero.";
  }
  const soma = somarPagamentos(pagamentos);
  if (Math.abs(soma - totalVenda) > 0.005) {
    return "A soma dos pagamentos não bate com o total da venda.";
  }
  return null;
}
