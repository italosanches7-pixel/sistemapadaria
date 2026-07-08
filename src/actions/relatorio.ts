"use server";

import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/sessao";
import { calcularJanela, calcularIntervaloCustomizado, type Periodo } from "@/lib/periodo";

export type RelatorioVendas = {
  inicio: string;
  fim: string;
  faturamentoTotal: number;
  numeroVendas: number;
  ticketMedio: number;
  quantidadeCancelamentos: number;
  porFormaPagamento: { formaPagamento: string; total: number; quantidade: number }[];
  porOperador: { nome: string; total: number; quantidade: number }[];
  rankingProdutos: { nome: string; quantidade: number; total: number }[];
};

export async function gerarRelatorio(
  periodo: Periodo | "customizado",
  inicioCustom?: string,
  fimCustom?: string
): Promise<RelatorioVendas> {
  await exigirSessao();

  const { inicio, fim } =
    periodo === "customizado" && inicioCustom && fimCustom
      ? calcularIntervaloCustomizado(inicioCustom, fimCustom)
      : calcularJanela(periodo === "customizado" ? "dia" : periodo);

  const vendasConcluidas = await prisma.venda.findMany({
    where: { dataHora: { gte: inicio, lte: fim }, status: "CONCLUIDA" },
    include: { operador: true },
  });

  const quantidadeCancelamentos = await prisma.venda.count({
    where: { dataHora: { gte: inicio, lte: fim }, status: "CANCELADA" },
  });

  const faturamentoTotal = vendasConcluidas.reduce((soma, v) => soma + Number(v.valorTotal), 0);
  const numeroVendas = vendasConcluidas.length;
  const ticketMedio = numeroVendas > 0 ? faturamentoTotal / numeroVendas : 0;

  const mapaFormaPagamento = new Map<string, { total: number; quantidade: number }>();
  const mapaOperador = new Map<string, { total: number; quantidade: number }>();

  for (const venda of vendasConcluidas) {
    const forma = mapaFormaPagamento.get(venda.formaPagamento) ?? { total: 0, quantidade: 0 };
    forma.total += Number(venda.valorTotal);
    forma.quantidade += 1;
    mapaFormaPagamento.set(venda.formaPagamento, forma);

    const operador = mapaOperador.get(venda.operador.nome) ?? { total: 0, quantidade: 0 };
    operador.total += Number(venda.valorTotal);
    operador.quantidade += 1;
    mapaOperador.set(venda.operador.nome, operador);
  }

  const itensPeriodo = await prisma.itemVenda.findMany({
    where: { venda: { dataHora: { gte: inicio, lte: fim }, status: "CONCLUIDA" } },
  });

  const mapaProdutos = new Map<string, { quantidade: number; total: number }>();
  for (const item of itensPeriodo) {
    const acumulado = mapaProdutos.get(item.nomeProduto) ?? { quantidade: 0, total: 0 };
    acumulado.quantidade += item.quantidade;
    acumulado.total += item.quantidade * Number(item.precoUnitario);
    mapaProdutos.set(item.nomeProduto, acumulado);
  }

  const rankingProdutos = Array.from(mapaProdutos.entries())
    .map(([nome, dados]) => ({ nome, ...dados }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  return {
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    faturamentoTotal: Math.round(faturamentoTotal * 100) / 100,
    numeroVendas,
    ticketMedio: Math.round(ticketMedio * 100) / 100,
    quantidadeCancelamentos,
    porFormaPagamento: Array.from(mapaFormaPagamento.entries()).map(([formaPagamento, dados]) => ({
      formaPagamento,
      ...dados,
    })),
    porOperador: Array.from(mapaOperador.entries()).map(([nome, dados]) => ({ nome, ...dados })),
    rankingProdutos,
  };
}
